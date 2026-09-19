import { Suspense, useEffect, useMemo } from 'react'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import {
  Color,
  type Material,
  type Mesh,
  type MeshStandardMaterial,
} from 'three'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js'

const AVATAR_ROOT_SCALE = 1
const AVATAR_HEIGHT_METERS = 1.1
const CAMERA_DISTANCE = 3

function createSkinMaterial(material: Material, skinColor: string) {
  const standard = material as MeshStandardMaterial
  if (!standard.isMeshStandardMaterial) return material

  const patched = standard.clone()
  const target = new Color(skinColor)

  patched.onBeforeCompile = (shader) => {
    shader.uniforms.avatarSkinTone = { value: target }

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        '#include <common>\nvarying vec3 vAvatarBindPosition;',
      )
      .replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\nvAvatarBindPosition = position;',
      )

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        '#include <common>\nuniform vec3 avatarSkinTone;\nvarying vec3 vAvatarBindPosition;',
      )
      .replace(
        '#include <map_fragment>',
        `#include <map_fragment>
        float r = diffuseColor.r;
        float g = diffuseColor.g;
        float b = diffuseColor.b;

        float ax = abs(vAvatarBindPosition.x);
        float y = vAvatarBindPosition.y;

        bool headOrNeck = y > 0.62;
        bool hands = y > 0.34 && y < 0.70 && ax > 0.19;
        bool bareLegs = y > 0.06 && y < 0.35 && ax > 0.055 && ax < 0.25;
        bool skinRegion = headOrNeck || hands || bareLegs;

        // Skin in the baked Meshy texture is warm but noticeably less
        // saturated than the orange/yellow workwear details.
        float maxC = max(r, max(g, b));
        float minC = min(r, min(g, b));
        float chroma = maxC - minC;

        bool warmSkinPixel =
          r > g * 1.015 &&
          g > b * 0.94 &&
          r > 0.12 &&
          g > 0.08 &&
          b > 0.055 &&
          b > g * 0.46 &&
          chroma > 0.025 &&
          chroma < 0.58;

        if (skinRegion && warmSkinPixel) {
          float sourceLuma = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
          float targetLuma = max(dot(avatarSkinTone, vec3(0.299, 0.587, 0.114)), 0.08);
          float preservedShade = clamp(sourceLuma / 0.58, 0.44, 1.36);
          vec3 recolored = avatarSkinTone * preservedShade;

          // Keep highlights/shadows from the original texture but replace hue.
          diffuseColor.rgb = mix(diffuseColor.rgb, recolored, 0.97);
        }`,
      )
  }

  patched.customProgramCacheKey = () => `ma-skin-v3-${skinColor}`
  patched.needsUpdate = true
  return patched
}

function ProductionModel({
  url,
  skinColor,
}: {
  url: string
  skinColor?: string
}) {
  const { scene } = useGLTF(url)

  const model = useMemo(() => {
    const next = clone(scene)

    next.traverse((child) => {
      const mesh = child as Mesh
      if (!mesh.isMesh) return

      mesh.castShadow = true
      mesh.receiveShadow = true

      if (!skinColor) return

      if (Array.isArray(mesh.material)) {
        mesh.material = mesh.material.map((material) =>
          createSkinMaterial(material, skinColor),
        )
      } else if (mesh.material) {
        mesh.material = createSkinMaterial(mesh.material, skinColor)
      }
    })

    return next
  }, [scene, skinColor])

  useEffect(() => {
    return () => {
      model.traverse((child) => {
        const mesh = child as Mesh
        if (!mesh.isMesh) return

        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((material) => material.dispose())
        } else {
          mesh.material?.dispose()
        }
      })
    }
  }, [model])

  return (
    <group
      scale={AVATAR_ROOT_SCALE}
      position={[0, -AVATAR_HEIGHT_METERS / 2, 0]}
    >
      <primitive object={model} />
    </group>
  )
}

function LockCamera() {
  const camera = useThree((state) => state.camera)

  useEffect(() => {
    camera.position.set(0, 0, CAMERA_DISTANCE)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
  }, [camera])

  return null
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
      camera={{ position: [0, 0, CAMERA_DISTANCE], fov: 34, near: 0.01, far: 100 }}
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

      <LockCamera />

      <Suspense fallback={null}>
        <ProductionModel url={modelUrl} skinColor={skinColor} />
      </Suspense>

      <OrbitControls
        makeDefault
        target={[0, 0, 0]}
        enablePan={false}
        enableZoom={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={CAMERA_DISTANCE}
        maxDistance={CAMERA_DISTANCE}
        minPolarAngle={Math.PI / 2}
        maxPolarAngle={Math.PI / 2}
      />
    </Canvas>
  )
}
