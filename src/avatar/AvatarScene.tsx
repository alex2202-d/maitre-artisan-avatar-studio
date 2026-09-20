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

function prepareFaceAsset(texture: Texture) {
  // Standard image/SVG texture convention: keep TextureLoader's Y orientation.
  // The face is projected in bind-pose coordinates, not through the GLB UV atlas.
  texture.colorSpace = SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

function createWardrobeMaterial(
  material: Material,
  topColor: string,
  bottomColor: string,
  skinColor: string,
  faceAsset: Texture,
  faceAssetKey: string,
  replaceFace: boolean,
) {
  const standard = material as MeshStandardMaterial
  if (!standard.isMeshStandardMaterial) return material

  const patched = standard.clone()
  const top = new Color(topColor)
  const bottom = new Color(bottomColor)
  const skin = new Color(skinColor)

  patched.onBeforeCompile = (shader) => {
    shader.uniforms.avatarTopColor = { value: top }
    shader.uniforms.avatarBottomColor = { value: bottom }
    shader.uniforms.avatarSkinColor = { value: skin }
    shader.uniforms.avatarFaceAsset = { value: faceAsset }
    shader.uniforms.avatarReplaceFace = { value: replaceFace ? 1 : 0 }

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
uniform vec3 avatarSkinColor;
uniform sampler2D avatarFaceAsset;
uniform float avatarReplaceFace;
varying vec3 vAvatarBindPosition;

float maFaceEllipse(vec2 p, vec2 center, vec2 radius) {
  vec2 d = (p - center) / radius;
  return dot(d, d);
}`,
      )
      .replace(
        '#include <map_fragment>',
        `#include <map_fragment>

        // The Meshy V2 avatar is one continuous mesh and its UV atlas contains
        // overlapping islands. Therefore facial assets are projected in the
        // measured bind-pose head coordinates instead of using TEXCOORD_0.
        if (avatarReplaceFace > 0.5) {
          vec3 fp = vAvatarBindPosition;

          // Camera-facing surface measured directly from the V2 GLB:
          // eye-coloured vertices cluster around y 0.71..0.75, z 0.15..0.21.
          // The lower dark-feature cluster begins around y 0.60..0.66.
          float front = smoothstep(0.120, 0.165, fp.z);

          bool leftEyeZone =
            maFaceEllipse(fp.xy, vec2(-0.060, 0.725), vec2(0.078, 0.070)) <= 1.0;
          bool rightEyeZone =
            maFaceEllipse(fp.xy, vec2(0.060, 0.725), vec2(0.078, 0.070)) <= 1.0;
          bool mouthZone =
            abs(fp.x) <= 0.118 &&
            fp.y >= 0.575 &&
            fp.y <= 0.665;

          // Remove the baked classic eyes/pupils/mouth from the original
          // continuous mesh. Lighting is still applied afterwards by the
          // MeshStandardMaterial, so the cleaned area remains integrated.
          if (front > 0.02 && (leftEyeZone || rightEyeZone || mouthZone)) {
            float skinShade = clamp(0.99 + (fp.y - 0.82) * 0.055, 0.965, 1.02);
            diffuseColor.rgb = avatarSkinColor * skinShade;
          }

          // Independent face asset projected only on the measured front of head.
          vec2 faceUv = vec2(
            (fp.x + 0.165) / 0.330,
            (fp.y - 0.555) / 0.240
          );

          bool faceUvInside =
            faceUv.x >= 0.0 && faceUv.x <= 1.0 &&
            faceUv.y >= 0.0 && faceUv.y <= 1.0;

          if (front > 0.02 && faceUvInside) {
            vec4 faceLayer = texture2D(avatarFaceAsset, faceUv);
            diffuseColor.rgb = mix(diffuseColor.rgb, faceLayer.rgb, faceLayer.a * front);
          }
        }

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
    `ma-wardrobe-projected-face-v1-${topColor}-${bottomColor}-${skinColor}-${faceAssetKey}-${replaceFace}`
  patched.needsUpdate = true
  return patched
}

function ProductionModel({
  url,
  topColor,
  bottomColor,
  skinColor,
  faceAssetUrl,
  replaceFace,
}: {
  url: string
  topColor: string
  bottomColor: string
  skinColor: string
  faceAssetUrl: string
  replaceFace: boolean
}) {
  const { scene } = useGLTF(url)
  const loadedFaceAsset = useTexture(faceAssetUrl)
  const faceAsset = useMemo(
    () => prepareFaceAsset(loadedFaceAsset),
    [loadedFaceAsset],
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
            skinColor,
            faceAsset,
            faceAssetUrl,
            replaceFace,
          ),
        )
      } else if (mesh.material) {
        mesh.material = createWardrobeMaterial(
          mesh.material,
          topColor,
          bottomColor,
          skinColor,
          faceAsset,
          faceAssetUrl,
          replaceFace,
        )
      }
    })

    return instance
  }, [
    scene,
    topColor,
    bottomColor,
    skinColor,
    faceAsset,
    faceAssetUrl,
    replaceFace,
  ])

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
  faceAssetUrl,
  topColor = '#D93636',
  bottomColor = '#D93636',
  skinColor = '#BC7F58',
  faceId = 'face-classic',
}: {
  modelUrl: string
  faceAssetUrl: string
  kind?: 'character' | 'piece'
  skinToneId?: string
  topColor?: string
  bottomColor?: string
  skinColor?: string
  faceId?: string
}) {
  const replaceFace = faceId !== 'face-classic'

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
          skinColor={skinColor}
          faceAssetUrl={faceAssetUrl}
          replaceFace={replaceFace}
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
