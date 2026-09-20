import { Suspense, useEffect, useMemo } from 'react'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import type { Group, Mesh } from 'three'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js'

const AVATAR_HEIGHT_METERS = 1.1
const CAMERA_DISTANCE = 3

function prepareScene(source: Group) {
  const instance = clone(source)
  instance.traverse((child) => {
    const mesh = child as Mesh
    if (!mesh.isMesh) return
    mesh.castShadow = true
    mesh.receiveShadow = true
  })
  return instance
}

function RealAvatarModel({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  const model = useMemo(() => prepareScene(scene), [scene])

  useEffect(() => {
    return () => {
      model.traverse((child) => {
        const mesh = child as Mesh
        if (!mesh.isMesh) return
      })
    }
  }, [model])

  return <primitive object={model} />
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
  faceId,
  hairStyleId,
  hairColor,
  topColor,
  bottomColor,
  helmetColor,
  gloveColor,
  shoeColor,
  accessoryId,
  headwearId,
}: {
  modelUrl: string
  skinColor: string
  faceId: string
  hairStyleId: string
  hairColor: string
  topColor: string
  bottomColor: string
  helmetColor: string
  gloveColor: string
  shoeColor: string
  accessoryId: string | null
  headwearId: string | null
}) {
  void skinColor
  void faceId
  void hairStyleId
  void hairColor
  void topColor
  void bottomColor
  void helmetColor
  void gloveColor
  void shoeColor
  void accessoryId
  void headwearId

  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, CAMERA_DISTANCE], fov: 34, near: 0.01, far: 100 }}
      gl={{ antialias: true, alpha: false }}
    >
      <color attach="background" args={['#E7E3E0']} />
      <ambientLight intensity={1.75} />
      <hemisphereLight args={['#ffffff', '#c9c0b6', 1.35]} />
      <directionalLight
        castShadow
        intensity={2.4}
        position={[4.5, 7, 5]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight intensity={0.9} position={[-4, 3, 2]} color="#dfe8ff" />
      <directionalLight intensity={0.65} position={[1, 4, -4]} color="#fff0dc" />

      <LockCamera />

      <Suspense fallback={null}>
        <group position={[0, -AVATAR_HEIGHT_METERS / 2, 0]}>
          <RealAvatarModel url={modelUrl} />
        </group>
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
