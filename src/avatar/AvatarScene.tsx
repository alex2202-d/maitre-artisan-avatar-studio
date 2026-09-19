import { Suspense, useEffect, useMemo } from 'react'
import { Bounds, Center, OrbitControls, useGLTF } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import { Color, type Material, type Mesh, type MeshStandardMaterial } from 'three'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js'

function patchSkinMaterial(material: Material, skinColor: string) {
  const standard = material as MeshStandardMaterial
  if (!standard.isMeshStandardMaterial) return material

  const patched = standard.clone()

  patched.onBeforeCompile = (shader) => {
    shader.uniforms.avatarSkinTone = { value: new Color(skinColor) }

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        '#include <common>\nuniform vec3 avatarSkinTone;',
      )
      .replace(
        '#include <map_fragment>',
        `#include <map_fragment>
        float r = diffuseColor.r;
        float g = diffuseColor.g;
        float b = diffuseColor.b;

        // Meshy baked the avatar into one texture/material.
        // Detect warm, low-saturation skin pixels while excluding the
        // much more saturated orange/yellow workwear accents.
        bool isSkinHue =
          r > g * 1.025 &&
          g > b * 1.015 &&
          r > 0.16 &&
          g > 0.11 &&
          b > 0.07 &&
          b > g * 0.52 &&
          r < g * 1.72;

        if (isSkinHue) {
          float sourceLuma = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
          float shade = clamp(sourceLuma / 0.58, 0.48, 1.34);
          vec3 recoloredSkin = avatarSkinTone * shade;
          diffuseColor.rgb = mix(diffuseColor.rgb, recoloredSkin, 0.96);
        }`,
      )
  }

  patched.customProgramCacheKey = () => 'ma-skin-tone-v2'
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

      if (skinColor) {
        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map((material) =>
            patchSkinMaterial(material, skinColor),
          )
        } else if (mesh.material) {
          mesh.material = patchSkinMaterial(mesh.material, skinColor)
        }
      }
    })

    return next
  }, [scene, skinColor])

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

function FramedCharacter({
  modelUrl,
  skinColor,
}: {
  modelUrl: string
  skinColor?: string
}) {
  const width = useThree((state) => state.size.width)
  const mobile = width <= 760

  return (
    <Bounds fit clip observe={false} margin={mobile ? 1.34 : 1.22}>
      <Center>
        <ProductionModel url={modelUrl} skinColor={skinColor} />
      </Center>
    </Bounds>
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
      camera={{ position: [0, 0, 6], fov: 34, near: 0.01, far: 100 }}
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
        <FramedCharacter modelUrl={modelUrl} skinColor={skinColor} />
      </Suspense>

      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={false}
        enableDamping
        dampingFactor={0.08}
        minPolarAngle={Math.PI / 2}
        maxPolarAngle={Math.PI / 2}
      />
    </Canvas>
  )
}
