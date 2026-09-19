import { Suspense, useEffect, useMemo } from 'react'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import {
  CanvasTexture,
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

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function recolorSkinTexture(source: Texture, skinColor: string): Texture | null {
  const image = source.image as CanvasImageSource & { width?: number; height?: number }
  const width = Number(image?.width ?? 0)
  const height = Number(image?.height ?? 0)
  if (!image || width <= 0 || height <= 0) return null

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) return null

  context.drawImage(image, 0, 0, width, height)

  const pixels = context.getImageData(0, 0, width, height)
  const data = pixels.data
  const target = new Color(skinColor)

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] / 255
    const g = data[i + 1] / 255
    const b = data[i + 2] / 255

    const maxC = Math.max(r, g, b)
    const minC = Math.min(r, g, b)
    const saturation = maxC > 0 ? (maxC - minC) / maxC : 0
    const luma = r * 0.299 + g * 0.587 + b * 0.114

    // The Meshy avatar uses one baked texture. Skin pixels are the warm,
    // relatively bright and moderately saturated peach tones. The yellow
    // hardhat/orange trim are much more saturated, while boots are darker.
    const looksLikeSkin =
      r > 0.52 &&
      g > 0.34 &&
      b > 0.24 &&
      r > g * 1.025 &&
      g > b * 1.015 &&
      saturation >= 0.08 &&
      saturation <= 0.46 &&
      luma > 0.42

    if (!looksLikeSkin) continue

    const shade = clamp(luma / 0.72, 0.56, 1.24)
    const nr = clamp(target.r * shade, 0, 1)
    const ng = clamp(target.g * shade, 0, 1)
    const nb = clamp(target.b * shade, 0, 1)

    data[i] = Math.round(nr * 255)
    data[i + 1] = Math.round(ng * 255)
    data[i + 2] = Math.round(nb * 255)
  }

  context.putImageData(pixels, 0, 0)

  const recolored = new CanvasTexture(canvas)
  recolored.name = `${source.name || 'avatar-basecolor'}-${skinColor}`
  recolored.flipY = source.flipY
  recolored.wrapS = source.wrapS
  recolored.wrapT = source.wrapT
  recolored.magFilter = source.magFilter
  recolored.minFilter = source.minFilter
  recolored.anisotropy = source.anisotropy
  recolored.colorSpace = source.colorSpace || SRGBColorSpace
  recolored.needsUpdate = true

  return recolored
}

function recolorMaterial(material: Material, skinColor: string) {
  const standard = material as MeshStandardMaterial
  if (!standard.isMeshStandardMaterial) return material

  const patched = standard.clone()
  const sourceMap = standard.map

  if (sourceMap) {
    const recoloredMap = recolorSkinTexture(sourceMap, skinColor)
    if (recoloredMap) patched.map = recoloredMap
  }

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
          recolorMaterial(material, skinColor),
        )
      } else if (mesh.material) {
        mesh.material = recolorMaterial(mesh.material, skinColor)
      }
    })

    return next
  }, [scene, skinColor])

  useEffect(() => {
    return () => {
      model.traverse((child) => {
        const mesh = child as Mesh
        if (!mesh.isMesh) return

        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
        materials.forEach((material) => {
          const standard = material as MeshStandardMaterial
          if (standard.map && standard.map instanceof CanvasTexture) {
            standard.map.dispose()
          }
          material?.dispose()
        })
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
