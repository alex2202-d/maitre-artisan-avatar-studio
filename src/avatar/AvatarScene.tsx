import { Canvas } from '@react-three/fiber'
import { OrbitControls, RoundedBox } from '@react-three/drei'
import type { AvatarConfig, FaceExpression, Morphology } from './types'

const morphologyMetrics: Record<
  Morphology,
  {
    torsoWidth: number
    torsoHeight: number
    bellyDepth: number
    shoulder: number
    armRadius: number
    hipWidth: number
    legRadius: number
    headScaleX: number
    headScaleY: number
  }
> = {
  slim: {
    torsoWidth: 1.18,
    torsoHeight: 1.12,
    bellyDepth: 0.68,
    shoulder: 0.9,
    armRadius: 0.2,
    hipWidth: 0.76,
    legRadius: 0.22,
    headScaleX: 0.98,
    headScaleY: 0.93,
  },
  standard: {
    torsoWidth: 1.36,
    torsoHeight: 1.16,
    bellyDepth: 0.78,
    shoulder: 1.02,
    armRadius: 0.23,
    hipWidth: 0.84,
    legRadius: 0.25,
    headScaleX: 1.04,
    headScaleY: 0.96,
  },
  sturdy: {
    torsoWidth: 1.55,
    torsoHeight: 1.14,
    bellyDepth: 0.9,
    shoulder: 1.14,
    armRadius: 0.27,
    hipWidth: 0.94,
    legRadius: 0.28,
    headScaleX: 1.08,
    headScaleY: 0.97,
  },
  xl: {
    torsoWidth: 1.72,
    torsoHeight: 1.2,
    bellyDepth: 1.02,
    shoulder: 1.24,
    armRadius: 0.3,
    hipWidth: 1.02,
    legRadius: 0.31,
    headScaleX: 1.12,
    headScaleY: 0.98,
  },
}

function Face({ expression }: { expression: FaceExpression }) {
  const focused = expression === 'focused'
  const surprised = expression === 'surprised'
  const content = expression === 'content'
  const smiling = expression === 'smile' || expression === 'content'

  if (content) {
    return (
      <group>
        <mesh position={[-0.34, 3.12, 0.93]} rotation={[0, 0, -0.12]}>
          <torusGeometry args={[0.17, 0.025, 10, 28, Math.PI]} />
          <meshStandardMaterial color="#201A17" />
        </mesh>
        <mesh position={[0.34, 3.12, 0.93]} rotation={[0, 0, -0.12]}>
          <torusGeometry args={[0.17, 0.025, 10, 28, Math.PI]} />
          <meshStandardMaterial color="#201A17" />
        </mesh>
        <mesh position={[0, 2.83, 0.96]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.2, 0.025, 10, 32, Math.PI]} />
          <meshStandardMaterial color="#512D2A" />
        </mesh>
      </group>
    )
  }

  return (
    <group>
      <mesh position={[-0.34, 3.11, 0.88]} scale={[0.28, 0.34, 0.115]} castShadow>
        <sphereGeometry args={[1, 36, 28]} />
        <meshStandardMaterial color="#F8F5EF" roughness={0.72} />
      </mesh>
      <mesh position={[0.34, 3.11, 0.88]} scale={[0.28, 0.34, 0.115]} castShadow>
        <sphereGeometry args={[1, 36, 28]} />
        <meshStandardMaterial color="#F8F5EF" roughness={0.72} />
      </mesh>

      <mesh position={[-0.3, 3.08, 0.995]} scale={[0.06, 0.075, 0.045]}>
        <sphereGeometry args={[1, 22, 16]} />
        <meshStandardMaterial color="#17191D" />
      </mesh>
      <mesh position={[0.3, 3.08, 0.995]} scale={[0.06, 0.075, 0.045]}>
        <sphereGeometry args={[1, 22, 16]} />
        <meshStandardMaterial color="#17191D" />
      </mesh>

      <RoundedBox
        args={[0.3, 0.035, 0.035]}
        radius={0.015}
        smoothness={3}
        position={[-0.34, 3.47, 0.86]}
        rotation={[0, 0, focused ? -0.3 : 0.14]}
      >
        <meshStandardMaterial color="#3A241B" />
      </RoundedBox>
      <RoundedBox
        args={[0.3, 0.035, 0.035]}
        radius={0.015}
        smoothness={3}
        position={[0.34, 3.47, 0.86]}
        rotation={[0, 0, focused ? 0.3 : -0.14]}
      >
        <meshStandardMaterial color="#3A241B" />
      </RoundedBox>

      {surprised ? (
        <mesh position={[0, 2.78, 0.96]}>
          <torusGeometry args={[0.11, 0.028, 10, 30]} />
          <meshStandardMaterial color="#512D2A" />
        </mesh>
      ) : smiling ? (
        <mesh position={[0, 2.82, 0.96]}>
          <torusGeometry args={[0.2, 0.025, 10, 32, Math.PI]} />
          <meshStandardMaterial color="#512D2A" />
        </mesh>
      ) : (
        <RoundedBox args={[0.3, 0.035, 0.035]} radius={0.014} smoothness={3} position={[0, 2.8, 0.96]}>
          <meshStandardMaterial color="#512D2A" />
        </RoundedBox>
      )}
    </group>
  )
}

function Hair({ config }: { config: AvatarConfig }) {
  if (config.hairStyle === 'none' || config.headwear !== 'none') return null

  const material = <meshStandardMaterial color={config.hairColor} roughness={0.92} />

  if (config.hairStyle === 'tuft') {
    return (
      <group>
        <mesh position={[0, 3.78, 0.02]} scale={[0.82, 0.28, 0.72]} castShadow>
          <sphereGeometry args={[1, 36, 26]} />
          {material}
        </mesh>
        <mesh position={[0.26, 3.92, 0.36]} rotation={[0.28, 0, -0.42]} scale={[0.22, 0.46, 0.18]} castShadow>
          <coneGeometry args={[1, 1.5, 24]} />
          {material}
        </mesh>
      </group>
    )
  }

  if (config.hairStyle === 'side') {
    return (
      <group>
        <mesh position={[0, 3.77, 0]} scale={[0.86, 0.3, 0.74]} castShadow>
          <sphereGeometry args={[1, 36, 26]} />
          {material}
        </mesh>
        <mesh position={[-0.64, 3.58, 0.12]} rotation={[0, 0, 0.28]} scale={[0.28, 0.45, 0.28]} castShadow>
          <sphereGeometry args={[1, 28, 20]} />
          {material}
        </mesh>
      </group>
    )
  }

  return (
    <group>
      <mesh position={[-0.38, 3.75, 0]} scale={[0.48, 0.3, 0.5]} castShadow>
        <sphereGeometry args={[1, 32, 24]} />
        {material}
      </mesh>
      <mesh position={[0.1, 3.82, -0.02]} scale={[0.56, 0.32, 0.54]} castShadow>
        <sphereGeometry args={[1, 32, 24]} />
        {material}
      </mesh>
      <mesh position={[0.5, 3.68, -0.02]} scale={[0.34, 0.28, 0.42]} castShadow>
        <sphereGeometry args={[1, 30, 22]} />
        {material}
      </mesh>
    </group>
  )
}

function Headwear({ config }: { config: AvatarConfig }) {
  if (config.headwear === 'none') return null

  if (config.headwear === 'beanie') {
    return (
      <group>
        <mesh position={[0, 3.74, 0]} scale={[0.9, 0.42, 0.8]} castShadow>
          <sphereGeometry args={[1, 42, 30]} />
          <meshStandardMaterial color={config.headwearColor} roughness={0.94} />
        </mesh>
        <mesh position={[0, 3.52, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.7, 0.11, 18, 54]} />
          <meshStandardMaterial color={config.headwearColor} roughness={0.94} />
        </mesh>
      </group>
    )
  }

  return (
    <group>
      <mesh position={[0, 3.77, 0]} scale={[0.94, 0.45, 0.82]} castShadow>
        <sphereGeometry args={[1, 48, 32]} />
        <meshStandardMaterial color={config.headwearColor} roughness={0.68} metalness={0.02} />
      </mesh>
      <mesh position={[0, 3.5, 0.06]} scale={[1.02, 0.08, 0.9]} castShadow>
        <cylinderGeometry args={[0.78, 0.78, 0.16, 48]} />
        <meshStandardMaterial color={config.headwearColor} roughness={0.62} />
      </mesh>
      <RoundedBox args={[0.12, 0.42, 0.08]} radius={0.03} smoothness={3} position={[0, 4.06, 0.34]}>
        <meshStandardMaterial color={config.headwearColor} roughness={0.58} />
      </RoundedBox>
      <RoundedBox args={[0.1, 0.34, 0.07]} radius={0.03} smoothness={3} position={[-0.34, 4.0, 0.31]} rotation={[0, 0, -0.13]}>
        <meshStandardMaterial color={config.headwearColor} roughness={0.58} />
      </RoundedBox>
      <RoundedBox args={[0.1, 0.34, 0.07]} radius={0.03} smoothness={3} position={[0.34, 4.0, 0.31]} rotation={[0, 0, 0.13]}>
        <meshStandardMaterial color={config.headwearColor} roughness={0.58} />
      </RoundedBox>
    </group>
  )
}

function Top({ config, metrics }: { config: AvatarConfig; metrics: (typeof morphologyMetrics)[Morphology] }) {
  const hoodie = config.topStyle === 'hoodie'
  const jacket = config.topStyle === 'work-jacket'
  const torsoY = 1.95

  return (
    <group>
      <mesh position={[0, torsoY, 0]} scale={[metrics.torsoWidth, metrics.torsoHeight, metrics.bellyDepth]} castShadow>
        <sphereGeometry args={[0.68, 48, 34]} />
        <meshStandardMaterial color={config.topColor} roughness={0.86} />
      </mesh>

      <mesh position={[-metrics.shoulder, 1.96, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <capsuleGeometry args={[metrics.armRadius, 0.52, 8, 20]} />
        <meshStandardMaterial color={config.topColor} roughness={0.87} />
      </mesh>
      <mesh position={[metrics.shoulder, 1.96, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <capsuleGeometry args={[metrics.armRadius, 0.52, 8, 20]} />
        <meshStandardMaterial color={config.topColor} roughness={0.87} />
      </mesh>

      {hoodie && (
        <mesh position={[0, 2.35, -0.38]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.44, 0.13, 18, 50]} />
          <meshStandardMaterial color={config.topColor} roughness={0.92} />
        </mesh>
      )}

      {jacket && (
        <group>
          <RoundedBox args={[0.055, 0.78, 0.055]} radius={0.02} smoothness={3} position={[0, 1.98, 0.56]}>
            <meshStandardMaterial color="#D6D9DC" roughness={0.52} metalness={0.18} />
          </RoundedBox>
          <RoundedBox args={[0.42, 0.22, 0.05]} radius={0.05} smoothness={4} position={[-0.33, 1.82, 0.56]}>
            <meshStandardMaterial color={config.topColor} roughness={0.9} />
          </RoundedBox>
          <RoundedBox args={[0.42, 0.22, 0.05]} radius={0.05} smoothness={4} position={[0.33, 1.82, 0.56]}>
            <meshStandardMaterial color={config.topColor} roughness={0.9} />
          </RoundedBox>
          <RoundedBox args={[0.18, 0.05, 0.05]} radius={0.018} smoothness={3} position={[-0.31, 2.33, 0.54]} rotation={[0, 0, -0.35]}>
            <meshStandardMaterial color="#E67A2E" roughness={0.8} />
          </RoundedBox>
          <RoundedBox args={[0.18, 0.05, 0.05]} radius={0.018} smoothness={3} position={[0.31, 2.33, 0.54]} rotation={[0, 0, 0.35]}>
            <meshStandardMaterial color="#E67A2E" roughness={0.8} />
          </RoundedBox>
        </group>
      )}
    </group>
  )
}

function Toolbelt({ config, metrics }: { config: AvatarConfig; metrics: (typeof morphologyMetrics)[Morphology] }) {
  if (!config.toolbelt) return null

  return (
    <group position={[0, 1.36, 0]}>
      <RoundedBox args={[metrics.torsoWidth * 1.06, 0.13, 0.16]} radius={0.04} smoothness={3} position={[0, 0, 0.47]} castShadow>
        <meshStandardMaterial color="#5B3C2E" roughness={0.9} />
      </RoundedBox>
      <RoundedBox args={[0.34, 0.42, 0.18]} radius={0.06} smoothness={4} position={[-0.58, -0.16, 0.52]} castShadow>
        <meshStandardMaterial color="#4A332A" roughness={0.92} />
      </RoundedBox>
      <RoundedBox args={[0.34, 0.42, 0.18]} radius={0.06} smoothness={4} position={[0.58, -0.16, 0.52]} castShadow>
        <meshStandardMaterial color="#4A332A" roughness={0.92} />
      </RoundedBox>
      <mesh position={[-0.58, 0.01, 0.63]}>
        <cylinderGeometry args={[0.045, 0.045, 0.28, 18]} />
        <meshStandardMaterial color="#D9DCDD" metalness={0.55} roughness={0.34} />
      </mesh>
      <RoundedBox args={[0.08, 0.28, 0.06]} radius={0.02} smoothness={3} position={[0.58, 0.03, 0.64]}>
        <meshStandardMaterial color="#E16B2B" roughness={0.66} />
      </RoundedBox>
    </group>
  )
}

function LegsAndShoes({ config, metrics }: { config: AvatarConfig; metrics: (typeof morphologyMetrics)[Morphology] }) {
  const cargo = config.pantsStyle === 'cargo'
  const boots = config.shoeStyle === 'safety-boots'

  return (
    <group>
      <RoundedBox args={[metrics.hipWidth * 1.48, 0.36, 0.72]} radius={0.14} smoothness={5} position={[0, 1.22, 0]} castShadow>
        <meshStandardMaterial color={config.pantsColor} roughness={0.91} />
      </RoundedBox>

      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * metrics.hipWidth * 0.43, 0.73, 0]} castShadow>
            <capsuleGeometry args={[metrics.legRadius, 0.58, 8, 20]} />
            <meshStandardMaterial color={config.pantsColor} roughness={0.92} />
          </mesh>

          {cargo && (
            <RoundedBox
              args={[0.28, 0.3, 0.12]}
              radius={0.05}
              smoothness={4}
              position={[side * metrics.hipWidth * 0.61, 0.88, 0.22]}
              castShadow
            >
              <meshStandardMaterial color={config.pantsColor} roughness={0.92} />
            </RoundedBox>
          )}

          <RoundedBox
            args={boots ? [0.62, 0.34, 0.86] : [0.58, 0.29, 0.78]}
            radius={boots ? 0.14 : 0.17}
            smoothness={5}
            position={[side * metrics.hipWidth * 0.43, 0.2, 0.14]}
            castShadow
          >
            <meshStandardMaterial color={config.shoeColor} roughness={0.78} />
          </RoundedBox>

          {boots && (
            <RoundedBox
              args={[0.64, 0.1, 0.9]}
              radius={0.04}
              smoothness={3}
              position={[side * metrics.hipWidth * 0.43, 0.06, 0.14]}
              castShadow
            >
              <meshStandardMaterial color="#171A1E" roughness={0.82} />
            </RoundedBox>
          )}
        </group>
      ))}
    </group>
  )
}

function Hands({ config, metrics }: { config: AvatarConfig; metrics: (typeof morphologyMetrics)[Morphology] }) {
  const handColor = config.gloves ? config.gloveColor : config.skinColor

  return (
    <group>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (metrics.shoulder + 0.46), 1.92, 0.02]} scale={[0.28, 0.3, 0.28]} castShadow>
          <sphereGeometry args={[1, 30, 22]} />
          <meshStandardMaterial color={handColor} roughness={0.86} />
        </mesh>
      ))}
    </group>
  )
}

function Character({ config }: { config: AvatarConfig }) {
  const metrics = morphologyMetrics[config.morphology]

  return (
    <group position={[0, 0.02, 0]}>
      <LegsAndShoes config={config} metrics={metrics} />
      <Top config={config} metrics={metrics} />
      <Toolbelt config={config} metrics={metrics} />
      <Hands config={config} metrics={metrics} />

      <mesh position={[0, 3.08, 0]} scale={[metrics.headScaleX, metrics.headScaleY, 0.96]} castShadow>
        <sphereGeometry args={[1.02, 64, 48]} />
        <meshStandardMaterial color={config.skinColor} roughness={0.88} />
      </mesh>

      <Face expression={config.expression} />
      <Hair config={config} />
      <Headwear config={config} />
    </group>
  )
}

export default function AvatarScene({ config }: { config: AvatarConfig }) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [0, 2.55, 7.1], fov: 36 }}
      gl={{ antialias: true, alpha: false }}
    >
      <color attach="background" args={['#202633']} />
      <fog attach="fog" args={['#202633', 8.5, 13]} />
      <ambientLight intensity={1.25} />
      <hemisphereLight args={['#ffffff', '#10141c', 1.3]} />
      <directionalLight
        castShadow
        intensity={2.5}
        position={[4.5, 7, 5]}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight intensity={1.0} position={[-4, 3, 2]} color="#9EB9FF" />
      <directionalLight intensity={0.7} position={[0, 3, -4]} color="#F6B35D" />

      <Character config={config} />

      <mesh position={[0, 0.02, 0]} receiveShadow>
        <cylinderGeometry args={[1.85, 2.05, 0.18, 64]} />
        <meshStandardMaterial color="#121722" roughness={0.72} metalness={0.08} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.075, 0]} receiveShadow>
        <circleGeometry args={[7.5, 72]} />
        <meshStandardMaterial color="#171D27" roughness={1} />
      </mesh>

      <OrbitControls
        makeDefault
        target={[0, 2.0, 0]}
        enablePan={false}
        minDistance={4.8}
        maxDistance={9}
        minPolarAngle={Math.PI * 0.24}
        maxPolarAngle={Math.PI * 0.62}
      />
    </Canvas>
  )
}
