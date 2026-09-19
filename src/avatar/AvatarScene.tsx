import { Suspense, useEffect, useMemo } from 'react'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import {
  Box3,
  Color,
  Vector3,
  type Material,
  type Mesh,
  type MeshStandardMaterial,
} from 'three'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js'

function patchSkinMaterial(material: Material, skinColor: string, headThreshold: number) {
  const standard = material as MeshStandardMaterial
  if (!standard.isMeshStandardMaterial) return material

  const patched = standard.clone()
  patched.onBeforeCompile = (shader) => {
    shader.uniforms.avatarSkinTone = { value: new Color(skinColor) }
    shader.uniforms.avatarHeadThreshold = { value: headThreshold }

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        '#include <common>\nvarying vec3 vAvatarLocalPosition;',
      )
      .replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\nvAvatarLocalPosition = transformed;',
      )

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        '#include <common>\nuniform vec3 avatarSkinTone;\nuniform float avatarHeadThreshold;\nvarying vec3 vAvatarLocalPosition;',
      )
      .replace(
        '#include <map_fragment>',
        `#include <map_fragment>
        float skinMax = max(diffuseColor.r, max(diffuseColor.g, diffuseColor.b));
        float skinMin = min(diffuseColor.r, min(diffuseColor.g, diffuseColor.b));
        float skinSpread = skinMax - skinMin;
        bool isSkinHue =
          diffuseColor.r > diffuseColor.g * 1.025 &&
          diffuseColor.g > diffuseColor.b * 0.98 &&
          diffuseColor.r > 0.34 &&
          diffuseColor.b > 0.10 &&
          skinSpread > 0.035 &&
          skinSpread < 0.48;
        bool isHeadRegion = vAvatarLocalPosition.y > avatarHeadThreshold;
        if (isSkinHue && isHeadRegion) {
          float sourceLuma = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
          float shade = clamp(sourceLuma / 0.62, 0.54, 1.34);
          vec3 recoloredSkin = avatarSkinTone * shade;
          diffuseColor.rgb = mix(diffuseColor.rgb, recoloredSkin, 0.92);
        }`,
      )
  }
  patched.customProgramCacheKey = () => 'ma-skin-tone-v1'
  patched.needsUpdate = true
  return patched
}

function NormalizedCharacter({
  url,
  skinColor,
}: {
  url: string
  skinColor?: string
}) {
  const { scene } = useGLTF(url)
  const viewport = useThree((state) => state.size)
  const mobile = viewport.width <= 760

  const normalized = useMemo(() => {
    const next = clone(scene)
    next.updateMatrixWorld(true)

    const sourceBox = new Box3().setFromObject(next)
    const sourceSize = new Vector3()
    const sourceCenter = new Vector3()
    sourceBox.getSize(sourceSize)
    sourceBox.getCenter(sourceCenter)

    const safeHeight = Math.max(sourceSize.y, 0.001)
    const safeWidth = Math.max(sourceSize.x, 0.001)
    const screenAspect = viewport.width / Math.max(viewport.height, 1)

    const maxWorldHeight = mobile ? 2.9 : 3.55
    const maxWorldWidth = mobile ? Math.max(1.45, 4.4 * screenAspect) : 3.4
    const fitScale = Math.min(maxWorldHeight / safeHeight, maxWorldWidth / safeWidth)
    const headThreshold = sourceBox.min.y + safeHeight * 0.64

    next.traverse((child) => {
      const mesh = child as Mesh
      if (!mesh.isMesh) return

      mesh.castShadow = true
      mesh.receiveShadow = true

      if (skinColor) {
        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map((material) =>
            patchSkinMaterial(material, skinColor, headThreshold),
          )
        } else if (mesh.material) {
          mesh.material = patchSkinMaterial(mesh.material, skinColor, headThreshold)
        }
      }
    })

    return {
      object: next,
      scale: fitScale,
      position: [
        -sourceCenter.x * fitScale,
        -sourceBox.min.y * fitScale,
        -sourceCenter.z * fitScale,
      ] as [number, number, number],
      targetY: (safeHeight * fitScale) / 2,
    }
  }, [scene, skinColor, viewport.width, viewport.height, mobile])

  useEffect(() => {
    return () => {
      normalized.object.traverse((child) => {
        const mesh = child as Mesh
        if (!mesh.isMesh) return
        if (Array.isArray(mesh.material)) mesh.material.forEach((material) => material.dispose())
        else mesh.material?.dispose()
      })
    }
  }, [normalized])

  return (
    <>
      <group position={normalized.position} scale={normalized.scale}>
        <primitive object={normalized.object} />
      </group>

      <OrbitControls
        makeDefault
        target={[0, normalized.targetY, 0]}
        enablePan={false}
        enableZoom={false}
        enableDamping
        dampingFactor={0.08}
        minPolarAngle={Math.PI / 2}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  )
}

export default function AvatarScene({
  modelUrl,
  skinColor,
}: {
  modelUrl: string
  kind?: 'character' | 'piece'
  skinColor?: string
}) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [0, 1.45, 7.5], fov: 34, near: 0.01, far: 100 }}
      gl={{ antialias: true, alpha: false }}
    >
      <color attach="background" args={['#E7E3E0']} />
      <ambientLight intensity={1.8} />
      <hemisphereLight args={['#ffffff', '#c9c0b6', 1.45]} />
      <directionalLight
        castShadow
        intensity={2.7}
        position={[4.5, 7, 5]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight intensity={1.1} position={[-4, 3, 2]} color="#dfe8ff" />
      <directionalLight intensity={0.75} position={[1, 4, -4]} color="#fff0dc" />

      <Suspense fallback={null}>
        <NormalizedCharacter url={modelUrl} skinColor={skinColor} />
      </Suspense>
    </Canvas>
  )
}
