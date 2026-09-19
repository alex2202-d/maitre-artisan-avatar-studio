import { Suspense, useEffect, useMemo } from 'react'
import { Bounds, Center, OrbitControls, useGLTF } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js'
import type { Mesh } from 'three'

function ProductionModel({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  const model = useMemo(() => clone(scene), [scene])

  useEffect(() => {
    model.traverse((child) => {
      const mesh = child as Mesh
      if (mesh.isMesh) {
        mesh.castShadow = true
        mesh.receiveShadow = true
      }
    })
  }, [model])

  return <primitive object={model} />
}

export default function AvatarScene({
  modelUrl,
  kind = 'character',
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
            <ProductionModel url={modelUrl} />
          </Center>
        </Bounds>
      </Suspense>

      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI * 0.12}
        maxPolarAngle={Math.PI * 0.82}
      />
    </Canvas>
  )
}
