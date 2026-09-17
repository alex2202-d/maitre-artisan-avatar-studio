import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { AvatarConfig } from './types'

function Top({ config }: { config: AvatarConfig }) {
  const jacket = config.topStyle === 'work-jacket'
  const hoodie = config.topStyle === 'hoodie'

  return (
    <group>
      <mesh position={[0, 1.82, 0]} scale={hoodie ? [0.88, 0.76, 0.57] : [0.82, 0.7, 0.53]} castShadow>
        <sphereGeometry args={[1, 48, 32]} />
        <meshStandardMaterial color={config.topColor} roughness={0.86} />
      </mesh>

      <mesh position={[-0.93, 1.88, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.22, 0.24, hoodie ? 0.72 : 0.62, 28]} />
        <meshStandardMaterial color={config.topColor} roughness={0.86} />
      </mesh>
      <mesh position={[0.93, 1.88, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.22, 0.24, hoodie ? 0.72 : 0.62, 28]} />
        <meshStandardMaterial color={config.topColor} roughness={0.86} />
      </mesh>

      {hoodie && (
        <mesh position={[0, 2.25, -0.34]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.42, 0.13, 18, 48]} />
          <meshStandardMaterial color={config.topColor} roughness={0.9} />
        </mesh>
      )}

      {jacket && (
        <>
          <mesh position={[0, 1.82, 0.52]} scale={[0.022, 0.48, 0.02]}>
            <boxGeometry />
            <meshStandardMaterial color="#EEE9E1" roughness={0.7} />
          </mesh>
          <mesh position={[-0.25, 2.24, 0.49]} rotation={[0, 0, -0.32]} scale={[0.18, 0.07, 0.04]}>
            <boxGeometry />
            <meshStandardMaterial color="#EEE9E1" roughness={0.7} />
          </mesh>
          <mesh position={[0.25, 2.24, 0.49]} rotation={[0, 0, 0.32]} scale={[0.18, 0.07, 0.04]}>
            <boxGeometry />
            <meshStandardMaterial color="#EEE9E1" roughness={0.7} />
          </mesh>
        </>
      )}
    </group>
  )
}

function Character({ config }: { config: AvatarConfig }) {
  return (
    <group position={[0, -0.03, 0]}>
      <mesh position={[-0.34, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.23, 0.25, 1.08, 28]} />
        <meshStandardMaterial color={config.pantsColor} roughness={0.9} />
      </mesh>
      <mesh position={[0.34, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.23, 0.25, 1.08, 28]} />
        <meshStandardMaterial color={config.pantsColor} roughness={0.9} />
      </mesh>

      <mesh position={[-0.35, 0.16, 0.1]} scale={[0.48, 0.23, 0.72]} castShadow>
        <boxGeometry />
        <meshStandardMaterial color={config.shoeColor} roughness={0.72} />
      </mesh>
      <mesh position={[0.35, 0.16, 0.1]} scale={[0.48, 0.23, 0.72]} castShadow>
        <boxGeometry />
        <meshStandardMaterial color={config.shoeColor} roughness={0.72} />
      </mesh>

      <Top config={config} />

      <mesh position={[-1.27, 1.87, 0]} scale={[0.28, 0.28, 0.28]} castShadow>
        <sphereGeometry args={[1, 32, 24]} />
        <meshStandardMaterial color={config.skinColor} roughness={0.86} />
      </mesh>
      <mesh position={[1.27, 1.87, 0]} scale={[0.28, 0.28, 0.28]} castShadow>
        <sphereGeometry args={[1, 32, 24]} />
        <meshStandardMaterial color={config.skinColor} roughness={0.86} />
      </mesh>

      <mesh position={[0, 2.88, 0]} scale={[1.02, 0.88, 0.9]} castShadow>
        <sphereGeometry args={[1, 64, 48]} />
        <meshStandardMaterial color={config.skinColor} roughness={0.9} />
      </mesh>

      <mesh position={[-0.34, 3.0, 0.78]} scale={[0.3, 0.36, 0.12]}>
        <sphereGeometry args={[1, 40, 28]} />
        <meshStandardMaterial color="#F7F4EC" roughness={0.75} />
      </mesh>
      <mesh position={[0.34, 3.0, 0.78]} scale={[0.3, 0.36, 0.12]}>
        <sphereGeometry args={[1, 40, 28]} />
        <meshStandardMaterial color="#F7F4EC" roughness={0.75} />
      </mesh>
      <mesh position={[-0.31, 2.98, 0.9]} scale={[0.08, 0.1, 0.045]}>
        <sphereGeometry args={[1, 24, 18]} />
        <meshStandardMaterial color="#111318" />
      </mesh>
      <mesh position={[0.31, 2.98, 0.9]} scale={[0.08, 0.1, 0.045]}>
        <sphereGeometry args={[1, 24, 18]} />
        <meshStandardMaterial color="#111318" />
      </mesh>
      <mesh position={[0, 2.68, 0.84]} scale={[0.28, 0.035, 0.04]}>
        <boxGeometry />
        <meshStandardMaterial color="#5F2B2B" roughness={0.8} />
      </mesh>

      {!config.beanie && (
        <group>
          <mesh position={[-0.42, 3.55, 0]} scale={[0.5, 0.34, 0.52]} castShadow>
            <sphereGeometry args={[1, 32, 24]} />
            <meshStandardMaterial color={config.hairColor} roughness={0.92} />
          </mesh>
          <mesh position={[0.12, 3.62, -0.02]} scale={[0.58, 0.34, 0.52]} castShadow>
            <sphereGeometry args={[1, 32, 24]} />
            <meshStandardMaterial color={config.hairColor} roughness={0.92} />
          </mesh>
          <mesh position={[0.5, 3.48, -0.02]} scale={[0.35, 0.3, 0.46]} castShadow>
            <sphereGeometry args={[1, 32, 24]} />
            <meshStandardMaterial color={config.hairColor} roughness={0.92} />
          </mesh>
        </group>
      )}

      {config.beanie && (
        <group>
          <mesh position={[0, 3.53, 0]} scale={[0.84, 0.4, 0.76]} castShadow>
            <sphereGeometry args={[1, 48, 32]} />
            <meshStandardMaterial color={config.beanieColor} roughness={0.95} />
          </mesh>
          <mesh position={[0, 3.36, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.67, 0.12, 20, 56]} />
            <meshStandardMaterial color={config.beanieColor} roughness={0.95} />
          </mesh>
        </group>
      )}
    </group>
  )
}

export default function AvatarScene({ config }: { config: AvatarConfig }) {
  return (
    <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 2.55, 6.6], fov: 38 }}>
      <color attach="background" args={['#171B21']} />
      <ambientLight intensity={1.15} />
      <directionalLight
        castShadow
        intensity={2.3}
        position={[4, 7, 5]}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight intensity={0.8} position={[-4, 3, -3]} />
      <Character config={config} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[4.5, 64]} />
        <meshStandardMaterial color="#232932" roughness={1} />
      </mesh>
      <OrbitControls
        makeDefault
        target={[0, 1.9, 0]}
        enablePan={false}
        minDistance={4.6}
        maxDistance={8.5}
        minPolarAngle={Math.PI * 0.25}
        maxPolarAngle={Math.PI * 0.62}
      />
    </Canvas>
  )
}
