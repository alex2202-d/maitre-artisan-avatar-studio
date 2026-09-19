import { Suspense, useEffect, useMemo } from 'react'
import { Bounds, Center, OrbitControls, useGLTF } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Box3, Color, type Material, type Mesh, type MeshStandardMaterial } from 'three'
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
          float targetLuma = max(dot(avatarSkinTone, vec3(0.299, 0.587, 0.114)), 0.08);
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

function ProductionModel({
  url,
  skinColor,
  applySkinTone,
}: {
  url: string
  skinColor?: string
  applySkinTone: boolean
}) {
  const { scene } = useGLTF(url)

  const model = useMemo(() => {
    const next = clone(scene)
    const box = new Box3().setFromObject(next)
    const height = Math.max(box.max.y - box.min.y, 0.001)
    const headThreshold = box.min.y + height * 0.64

    next.traverse((child) => {
      const mesh = child as Mesh
      if (!mesh.isMesh) return

      mesh.castShadow = true
      mesh.receiveShadow = true

      if (applySkinTone && skinColor) {
        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map((material) =>
            patchSkinMaterial(material, skinColor, headThreshold),
          )
        } else if (mesh.material) {
          mesh.material = patchSkinMaterial(mesh.material, skinColor, headThreshold)
        }
      }
    })

    return next
  }, [scene, skinColor, applySkinTone])

  useEffect(() => {
    return () => {
      model.traverse((child) => {
        const mesh = child as Mesh
        if (!mesh.isMesh) return
        if (Array.isArray(mesh.material)) mesh.material.forEach((material) => material.dispose())
        else mesh.material?.dispose()
      })
    }
  }, [model])

  return <primitive object={model} />
}

export default function AvatarScene({
  modelUrl,
  kind = 'character',
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
      camera={{ position: [2.2, 1.8, 4.8], fov: 34, near: 0.01, far: 100 }}
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
        <Bounds fit clip observe margin={kind === 'character' ? 1.18 : 1.5}>
          <Center bottom>
            <ProductionModel
              url={modelUrl}
              skinColor={skinColor}
              applySkinTone={kind === 'character'}
            />
          </Center>
        </Bounds>
      </Suspense>

      <OrbitControls
        makeDefault
        enablePan={false}
        minPolarAngle={Math.PI * 0.12}
        maxPolarAngle={Math.PI * 0.82}
      />
    </Canvas>
  )
}
