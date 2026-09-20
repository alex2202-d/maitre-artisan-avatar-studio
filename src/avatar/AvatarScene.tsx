import { Suspense, useEffect, useMemo } from 'react'
import { OrbitControls, useGLTF, useTexture } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import {
  Color,
  SRGBColorSpace,
  type Material,
  type Mesh,
  type MeshStandardMaterial,
  type Texture,
} from 'three'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js'

const AVATAR_ROOT_SCALE = 1
const AVATAR_HEIGHT_METERS = 1.1
const CAMERA_DISTANCE = 3

function prepareFaceOverlay(texture: Texture) {
  texture.flipY = false
  texture.colorSpace = SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

function createWardrobeMaterial(
  material: Material,
  topColor: string,
  bottomColor: string,
  faceOverlay: Texture,
  faceOverlayKey: string,
) {
  const standard = material as MeshStandardMaterial
  if (!standard.isMeshStandardMaterial) return material

  const patched = standard.clone()
  const top = new Color(topColor)
  const bottom = new Color(bottomColor)

  patched.onBeforeCompile = (shader) => {
    shader.uniforms.avatarTopColor = { value: top }
    shader.uniforms.avatarBottomColor = { value: bottom }
    shader.uniforms.avatarFaceOverlay = { value: faceOverlay }

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
        `#include <common>
uniform vec3 avatarTopColor;
uniform vec3 avatarBottomColor;
uniform sampler2D avatarFaceOverlay;
varying vec3 vAvatarBindPosition;`,
      )
      .replace(
        '#include <map_fragment>',
        `#include <map_fragment>

        // Real modular face asset: a transparent UV overlay baked from the
        // original avatar geometry/texture. The overlay removes the baked
        // expression only where needed, then supplies the selected face.
        vec4 avatarFace = texture2D(avatarFaceOverlay, vMapUv);
        diffuseColor.rgb = mix(diffuseColor.rgb, avatarFace.rgb, avatarFace.a);

        float r = diffuseColor.r;
        float g = diffuseColor.g;
        float b = diffuseColor.b;
        float sourceLuma = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));

        bool navyFabric =
          b > r + 0.018 &&
          b >= g * 0.96 &&
          r < 0.40 &&
          g < 0.42 &&
          b < 0.52 &&
          sourceLuma < 0.36;

        float y = vAvatarBindPosition.y;
        bool bottomRegion = y >= 0.10 && y < 0.37;
        bool topRegion = y >= 0.37 && y < 0.72;

        if (navyFabric && (topRegion || bottomRegion)) {
          vec3 targetColor = topRegion ? avatarTopColor : avatarBottomColor;
          float preservedShade = clamp(sourceLuma / 0.16, 0.48, 1.45);
          diffuseColor.rgb = clamp(targetColor * preservedShade, 0.0, 1.0);
        }`,
      )
  }

  patched.customProgramCacheKey = () =>
    `ma-wardrobe-face-overlay-v1-${topColor}-${bottomColor}-${faceOverlayKey}`
  patched.needsUpdate = true
  return patched
}

function ProductionModel({
  url,
  topColor,
  bottomColor,
  faceOverlayUrl,
}: {
  url: string
  topColor: string
  bottomColor: string
  faceOverlayUrl: string
}) {
  const { scene } = useGLTF(url)
  const loadedFaceOverlay = useTexture(faceOverlayUrl)
  const faceOverlay = useMemo(
    () => prepareFaceOverlay(loadedFaceOverlay),
    [loadedFaceOverlay],
  )

  const model = useMemo(() => {
    const instance = clone(scene)

    instance.traverse((child) => {
      const mesh = child as Mesh
      if (!mesh.isMesh) return

      mesh.castShadow = true
      mesh.receiveShadow = true

      if (Array.isArray(mesh.material)) {
        mesh.material = mesh.material.map((material) =>
          createWardrobeMaterial(
            material,
            topColor,
            bottomColor,
            faceOverlay,
            faceOverlayUrl,
          ),
        )
      } else if (mesh.material) {
        mesh.material = createWardrobeMaterial(
          mesh.material,
          topColor,
          bottomColor,
          faceOverlay,
          faceOverlayUrl,
        )
      }
    })

    return instance
  }, [scene, topColor, bottomColor, faceOverlay, faceOverlayUrl])

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
  faceOverlayUrl,
  topColor = '#D93636',
  bottomColor = '#D93636',
}: {
  modelUrl: string
  faceOverlayUrl: string
  kind?: 'character' | 'piece'
  skinToneId?: string
  topColor?: string
  bottomColor?: string
  skinColor?: string
  faceId?: string
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
        <ProductionModel
          url={modelUrl}
          topColor={topColor}
          bottomColor={bottomColor}
          faceOverlayUrl={faceOverlayUrl}
        />
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
