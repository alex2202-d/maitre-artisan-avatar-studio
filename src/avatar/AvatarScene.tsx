import { Suspense, useEffect, useMemo } from 'react'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  MeshStandardMaterial,
  QuadraticBezierCurve3,
  Vector3,
  type Group,
  type Material,
  type Mesh,
} from 'three'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js'

const AVATAR_ROOT_SCALE = 1
const AVATAR_HEIGHT_METERS = 1.1
const CAMERA_DISTANCE = 3

const SLOT_URLS = {
  headwear: '/assets/avatar/v2/outfit01/headwear_hardhat_v2.glb',
  top: '/assets/avatar/v2/outfit01/top_workwear_v2.glb',
  bottom: '/assets/avatar/v2/outfit01/bottom_workshort_v2.glb',
  gloves: '/assets/avatar/v2/outfit01/gloves_work_v2.glb',
  shoes: '/assets/avatar/v2/outfit01/shoes_work_boots_v2.glb',
} as const

function prepareScene(source: Group) {
  const instance = clone(source)

  instance.traverse((child) => {
    const mesh = child as Mesh
    if (!mesh.isMesh) return
    mesh.castShadow = true
    mesh.receiveShadow = true

    if (Array.isArray(mesh.material)) {
      mesh.material = mesh.material.map((material) => material.clone())
    } else if (mesh.material) {
      mesh.material = mesh.material.clone()
    }
  })

  return instance
}

function ProductionModel({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  const model = useMemo(() => prepareScene(scene), [scene])

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

  return <primitive object={model} />
}

function slotMaterial(source: Material | Material[], color: string) {
  const material = (Array.isArray(source) ? source[0] : source) as MeshStandardMaterial
  const cloned = material?.isMeshStandardMaterial
    ? material.clone()
    : new MeshStandardMaterial()

  cloned.map = null
  cloned.color = new Color(color)
  cloned.metalness = 0.02
  cloned.roughness = 0.78
  cloned.transparent = false
  cloned.opacity = 1
  cloned.needsUpdate = true
  return cloned
}

function StaticSlot({
  url,
  color,
  position,
  scale,
  rotation = [0, 0, 0],
}: {
  url: string
  color: string
  position: [number, number, number]
  scale: [number, number, number]
  rotation?: [number, number, number]
}) {
  const { scene } = useGLTF(url)

  const model = useMemo(() => {
    const instance = clone(scene)
    instance.traverse((child) => {
      const mesh = child as Mesh
      if (!mesh.isMesh) return
      mesh.castShadow = true
      mesh.receiveShadow = true
      mesh.material = slotMaterial(mesh.material, color)
    })
    return instance
  }, [scene, color])

  return (
    <group position={position} scale={scale} rotation={rotation}>
      <primitive object={model} />
    </group>
  )
}

function firstMesh(source: Group): Mesh | null {
  let found: Mesh | null = null
  source.traverse((child) => {
    const mesh = child as Mesh
    if (!found && mesh.isMesh) found = mesh
  })
  return found as Mesh | null
}

function splitGeometryByX(source: BufferGeometry, side: -1 | 1) {
  const geometry = source.index ? source.toNonIndexed() : source.clone()
  const position = geometry.getAttribute('position')
  const normal = geometry.getAttribute('normal')
  const uv = geometry.getAttribute('uv')

  const positions: number[] = []
  const normals: number[] = []
  const uvs: number[] = []

  for (let i = 0; i < position.count; i += 3) {
    const cx =
      (position.getX(i) + position.getX(i + 1) + position.getX(i + 2)) / 3

    if ((side < 0 && cx >= 0) || (side > 0 && cx <= 0)) continue

    for (let j = 0; j < 3; j += 1) {
      const index = i + j
      positions.push(
        position.getX(index),
        position.getY(index),
        position.getZ(index),
      )
      if (normal) {
        normals.push(
          normal.getX(index),
          normal.getY(index),
          normal.getZ(index),
        )
      }
      if (uv) {
        uvs.push(uv.getX(index), uv.getY(index))
      }
    }
  }

  const result = new BufferGeometry()
  result.setAttribute('position', new Float32BufferAttribute(positions, 3))
  if (normals.length) {
    result.setAttribute('normal', new Float32BufferAttribute(normals, 3))
  } else {
    result.computeVertexNormals()
  }
  if (uvs.length) result.setAttribute('uv', new Float32BufferAttribute(uvs, 2))
  result.computeBoundingBox()

  const center = new Vector3()
  result.boundingBox?.getCenter(center)
  result.translate(-center.x, -center.y, -center.z)
  result.computeBoundingSphere()

  geometry.dispose()
  return result
}

function PairedSlot({
  url,
  color,
  leftPosition,
  rightPosition,
  scale,
  rotation = [0, 0, 0],
}: {
  url: string
  color: string
  leftPosition: [number, number, number]
  rightPosition: [number, number, number]
  scale: [number, number, number]
  rotation?: [number, number, number]
}) {
  const { scene } = useGLTF(url)
  const source = useMemo(() => firstMesh(scene), [scene])

  const data = useMemo(() => {
    if (!source) return null
    return {
      left: splitGeometryByX(source.geometry, -1),
      right: splitGeometryByX(source.geometry, 1),
      leftMaterial: slotMaterial(source.material, color),
      rightMaterial: slotMaterial(source.material, color),
    }
  }, [source, color])

  useEffect(() => {
    return () => {
      data?.left.dispose()
      data?.right.dispose()
      data?.leftMaterial.dispose()
      data?.rightMaterial.dispose()
    }
  }, [data])

  if (!data) return null

  return (
    <>
      <mesh
        geometry={data.left}
        material={data.leftMaterial}
        position={leftPosition}
        scale={scale}
        rotation={rotation}
        castShadow
        receiveShadow
      />
      <mesh
        geometry={data.right}
        material={data.rightMaterial}
        position={rightPosition}
        scale={scale}
        rotation={rotation}
        castShadow
        receiveShadow
      />
    </>
  )
}

function Mouth({ faceId }: { faceId: string }) {
  const z = 0.269

  if (faceId === 'face-surprised-3d') {
    return (
      <mesh position={[0, 0.716, z]}>
        <torusGeometry args={[0.017, 0.0052, 12, 28]} />
        <meshStandardMaterial color="#33221b" roughness={0.9} />
      </mesh>
    )
  }

  const curve =
    faceId === 'face-determined-3d'
      ? new QuadraticBezierCurve3(
          new Vector3(-0.050, 0.716, z),
          new Vector3(0, 0.713, z + 0.002),
          new Vector3(0.050, 0.716, z),
        )
      : faceId === 'face-smile-3d'
        ? new QuadraticBezierCurve3(
            new Vector3(-0.062, 0.728, z),
            new Vector3(0, 0.688, z + 0.002),
            new Vector3(0.062, 0.728, z),
          )
        : new QuadraticBezierCurve3(
            new Vector3(-0.047, 0.720, z),
            new Vector3(0, 0.696, z + 0.002),
            new Vector3(0.047, 0.720, z),
          )

  return (
    <mesh>
      <tubeGeometry args={[curve, 24, 0.0052, 10, false]} />
      <meshStandardMaterial color="#33221b" roughness={0.9} />
    </mesh>
  )
}

function Brows({ faceId }: { faceId: string }) {
  if (faceId !== 'face-determined-3d') return null
  return (
    <>
      <mesh position={[-0.061, 0.910, 0.265]} rotation={[0, 0, -0.23]}>
        <boxGeometry args={[0.067, 0.008, 0.010]} />
        <meshStandardMaterial color="#33221b" roughness={0.9} />
      </mesh>
      <mesh position={[0.061, 0.910, 0.265]} rotation={[0, 0, 0.23]}>
        <boxGeometry args={[0.067, 0.008, 0.010]} />
        <meshStandardMaterial color="#33221b" roughness={0.9} />
      </mesh>
    </>
  )
}

function Hair({
  hairStyleId,
  hairColor,
}: {
  hairStyleId: string
  hairColor: string
}) {
  if (hairStyleId === 'hair-none') return null

  if (hairStyleId === 'hair-tuft-3d') {
    return (
      <group>
        <mesh position={[-0.055, 1.035, 0.105]} rotation={[0.08, 0, -0.48]}>
          <sphereGeometry args={[0.080, 20, 16]} />
          <meshStandardMaterial color={hairColor} roughness={0.86} />
        </mesh>
        <mesh position={[0.015, 1.060, 0.118]} rotation={[0.08, 0, -0.10]}>
          <sphereGeometry args={[0.090, 20, 16]} />
          <meshStandardMaterial color={hairColor} roughness={0.86} />
        </mesh>
        <mesh position={[0.075, 1.030, 0.100]} rotation={[0.08, 0, 0.42]}>
          <sphereGeometry args={[0.070, 20, 16]} />
          <meshStandardMaterial color={hairColor} roughness={0.86} />
        </mesh>
      </group>
    )
  }

  if (hairStyleId === 'hair-side-3d') {
    return (
      <group>
        <mesh position={[0, 0.845, 0]}>
          <sphereGeometry args={[0.273, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2.05]} />
          <meshStandardMaterial color={hairColor} roughness={0.88} />
        </mesh>
        <mesh
          position={[-0.210, 0.930, 0.105]}
          scale={[0.55, 1.20, 0.72]}
          rotation={[0, 0, 0.18]}
        >
          <sphereGeometry args={[0.090, 20, 16]} />
          <meshStandardMaterial color={hairColor} roughness={0.88} />
        </mesh>
      </group>
    )
  }

  return (
    <mesh position={[0, 0.845, 0]}>
      <sphereGeometry args={[0.273, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2.18]} />
      <meshStandardMaterial color={hairColor} roughness={0.88} />
    </mesh>
  )
}

function ProceduralHead({
  skinColor,
  faceId,
  hairStyleId,
  hairColor,
  helmetActive,
}: {
  skinColor: string
  faceId: string
  hairStyleId: string
  hairColor: string
  helmetActive: boolean
}) {
  const surprised = faceId === 'face-surprised-3d'
  return (
    <group position={[0, 0, 0.025]}>
      <mesh position={[0, 0.835, 0]}>
        <sphereGeometry args={[0.268, 42, 32]} />
        <meshStandardMaterial color={skinColor} roughness={0.92} />
      </mesh>

      <mesh
        position={[-0.061, 0.858, 0.245]}
        scale={[1, surprised ? 1.17 : 1.08, 0.75]}
      >
        <sphereGeometry args={[0.052, 24, 18]} />
        <meshStandardMaterial color="#F6F5F1" roughness={0.94} />
      </mesh>
      <mesh
        position={[0.061, 0.858, 0.245]}
        scale={[1, surprised ? 1.17 : 1.08, 0.75]}
      >
        <sphereGeometry args={[0.052, 24, 18]} />
        <meshStandardMaterial color="#F6F5F1" roughness={0.94} />
      </mesh>

      <mesh position={[-0.061, 0.856, 0.286]}>
        <sphereGeometry args={[0.013, 18, 14]} />
        <meshStandardMaterial color="#111111" roughness={0.8} />
      </mesh>
      <mesh position={[0.061, 0.856, 0.286]}>
        <sphereGeometry args={[0.013, 18, 14]} />
        <meshStandardMaterial color="#111111" roughness={0.8} />
      </mesh>

      <Brows faceId={faceId} />
      <Mouth faceId={faceId} />
      {!helmetActive && <Hair hairStyleId={hairStyleId} hairColor={hairColor} />}
    </group>
  )
}

function Accessory({ accessoryId }: { accessoryId: string | null }) {
  if (!accessoryId || accessoryId === 'accessory-none') return null

  const pouchOnly = accessoryId === 'accessory-pouch-3d'

  return (
    <group>
      {!pouchOnly && (
        <mesh position={[0, 0.405, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.185, 0.014, 12, 42]} />
          <meshStandardMaterial color="#5B3828" roughness={0.9} />
        </mesh>
      )}
      <mesh
        position={[pouchOnly ? 0.155 : -0.155, 0.380, 0.178]}
        rotation={[0, 0, pouchOnly ? -0.10 : 0.10]}
      >
        <boxGeometry args={[0.090, 0.115, 0.045]} />
        <meshStandardMaterial color="#6B442C" roughness={0.92} />
      </mesh>
      {!pouchOnly && (
        <>
          <mesh
            position={[0.155, 0.385, 0.175]}
            rotation={[0, 0, -0.10]}
          >
            <boxGeometry args={[0.082, 0.100, 0.045]} />
            <meshStandardMaterial color="#6B442C" roughness={0.92} />
          </mesh>
          <mesh position={[0.000, 0.395, 0.201]}>
            <boxGeometry args={[0.048, 0.030, 0.020]} />
            <meshStandardMaterial color="#E28A29" roughness={0.82} />
          </mesh>
        </>
      )}
    </group>
  )
}

function AvatarAssembly({
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
  topId,
  bottomId,
  glovesId,
  shoesId,
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
  topId: string | null
  bottomId: string | null
  glovesId: string | null
  shoesId: string | null
}) {
  const helmetActive = Boolean(headwearId && headwearId !== 'helmet-none')

  return (
    <group scale={AVATAR_ROOT_SCALE} position={[0, -AVATAR_HEIGHT_METERS / 2, 0]}>
      <ProductionModel url={modelUrl} />

      <ProceduralHead
        skinColor={skinColor}
        faceId={faceId}
        hairStyleId={hairStyleId}
        hairColor={hairColor}
        helmetActive={helmetActive}
      />

      {helmetActive && (
        <StaticSlot
          url={SLOT_URLS.headwear}
          color={helmetColor}
          position={[0, 1.020, 0.065]}
          scale={[0.38, 0.28, 0.27]}
        />
      )}

      {topId && (
        <StaticSlot
          url={SLOT_URLS.top}
          color={topColor}
          position={[0, 0.505, 0.055]}
          scale={[0.32, 0.345, 0.34]}
        />
      )}

      {bottomId && (
        <StaticSlot
          url={SLOT_URLS.bottom}
          color={bottomColor}
          position={[0, 0.292, 0.055]}
          scale={[0.26, 0.225, 0.30]}
        />
      )}

      {glovesId && (
        <PairedSlot
          url={SLOT_URLS.gloves}
          color={gloveColor}
          leftPosition={[-0.292, 0.415, 0.190]}
          rightPosition={[0.292, 0.415, 0.190]}
          scale={[0.150, 0.140, 0.180]}
        />
      )}

      {shoesId && (
        <PairedSlot
          url={SLOT_URLS.shoes}
          color={shoeColor}
          leftPosition={[-0.116, 0.074, 0.150]}
          rightPosition={[0.116, 0.074, 0.150]}
          scale={[0.175, 0.235, 0.180]}
        />
      )}

      <Accessory accessoryId={accessoryId} />
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
  topId,
  bottomId,
  glovesId,
  shoesId,
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
  topId: string | null
  bottomId: string | null
  glovesId: string | null
  shoesId: string | null
}) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{
        position: [0, 0, CAMERA_DISTANCE],
        fov: 34,
        near: 0.01,
        far: 100,
      }}
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
        <AvatarAssembly
          modelUrl={modelUrl}
          skinColor={skinColor}
          faceId={faceId}
          hairStyleId={hairStyleId}
          hairColor={hairColor}
          topColor={topColor}
          bottomColor={bottomColor}
          helmetColor={helmetColor}
          gloveColor={gloveColor}
          shoeColor={shoeColor}
          accessoryId={accessoryId}
          headwearId={headwearId}
          topId={topId}
          bottomId={bottomId}
          glovesId={glovesId}
          shoesId={shoesId}
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
