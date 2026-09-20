import { Suspense, useEffect, useMemo } from 'react'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import {
  Color,
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

function createWardrobeMaterial(
  material: Material,
  topColor: string,
  bottomColor: string,
  helmetColor: string,
  gloveColor: string,
  shoeColor: string,
) {
  const standard = material as MeshStandardMaterial
  if (!standard.isMeshStandardMaterial) return material

  const patched = standard.clone()
  const top = new Color(topColor)
  const bottom = new Color(bottomColor)
  const helmet = new Color(helmetColor)
  const gloves = new Color(gloveColor)
  const shoes = new Color(shoeColor)

  patched.onBeforeCompile = (shader) => {
    shader.uniforms.maTopColor = { value: top }
    shader.uniforms.maBottomColor = { value: bottom }
    shader.uniforms.maHelmetColor = { value: helmet }
    shader.uniforms.maGloveColor = { value: gloves }
    shader.uniforms.maShoeColor = { value: shoes }

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        '#include <common>\nvarying vec3 vMaBindPosition;',
      )
      .replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\nvMaBindPosition = position;',
      )

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
uniform vec3 maTopColor;
uniform vec3 maBottomColor;
uniform vec3 maHelmetColor;
uniform vec3 maGloveColor;
uniform vec3 maShoeColor;
varying vec3 vMaBindPosition;`,
      )
      .replace(
        '#include <map_fragment>',
        `#include <map_fragment>
        vec3 source = diffuseColor.rgb;
        float r = source.r;
        float g = source.g;
        float b = source.b;
        float y = vMaBindPosition.y;
        float luma = dot(source, vec3(0.299, 0.587, 0.114));
        float mx = max(r, max(g, b));
        float mn = min(r, min(g, b));
        float sat = mx > 0.001 ? (mx - mn) / mx : 0.0;

        bool skinLike =
          r > g * 1.02 &&
          g > b * 1.01 &&
          r > 0.34 &&
          g > 0.22 &&
          b > 0.14;

        bool yellowGear =
          r > 0.48 &&
          g > 0.36 &&
          b < 0.32 &&
          r > b * 1.65;

        bool orangeAccent =
          r > 0.45 &&
          g > 0.18 &&
          g < r * 0.78 &&
          b < g * 0.85;

        bool clothCandidate =
          !skinLike &&
          !yellowGear &&
          !orangeAccent &&
          luma < 0.80;

        if (y > 0.79 && yellowGear) {
          float shade = clamp(luma / 0.68, 0.68, 1.18);
          diffuseColor.rgb = clamp(maHelmetColor * shade, 0.0, 1.0);
        } else if (y > 0.30 && y < 0.72 && yellowGear) {
          float shade = clamp(luma / 0.68, 0.66, 1.16);
          diffuseColor.rgb = clamp(maGloveColor * shade, 0.0, 1.0);
        } else if (y >= 0.38 && y < 0.72 && clothCandidate) {
          float shade = clamp(luma / 0.20, 0.52, 1.35);
          diffuseColor.rgb = clamp(maTopColor * shade, 0.0, 1.0);
        } else if (y >= 0.12 && y < 0.42 && clothCandidate) {
          float shade = clamp(luma / 0.20, 0.52, 1.35);
          diffuseColor.rgb = clamp(maBottomColor * shade, 0.0, 1.0);
        } else if (y < 0.16 && !skinLike) {
          float shade = clamp(luma / 0.26, 0.52, 1.35);
          diffuseColor.rgb = clamp(maShoeColor * shade, 0.0, 1.0);
        }`,
      )
  }

  patched.customProgramCacheKey = () =>
    `ma-wardrobe-colors-v3-${topColor}-${bottomColor}-${helmetColor}-${gloveColor}-${shoeColor}`
  patched.needsUpdate = true
  return patched
}

function prepareScene(
  source: Group,
  colors: {
    topColor: string
    bottomColor: string
    helmetColor: string
    gloveColor: string
    shoeColor: string
  },
) {
  const instance = clone(source)

  instance.traverse((child) => {
    const mesh = child as Mesh
    if (!mesh.isMesh) return
    mesh.castShadow = true
    mesh.receiveShadow = true

    if (Array.isArray(mesh.material)) {
      mesh.material = mesh.material.map((material) =>
        createWardrobeMaterial(
          material,
          colors.topColor,
          colors.bottomColor,
          colors.helmetColor,
          colors.gloveColor,
          colors.shoeColor,
        ),
      )
    } else if (mesh.material) {
      mesh.material = createWardrobeMaterial(
        mesh.material,
        colors.topColor,
        colors.bottomColor,
        colors.helmetColor,
        colors.gloveColor,
        colors.shoeColor,
      )
    }
  })

  return instance
}

function ProductionModel({
  url,
  topColor,
  bottomColor,
  helmetColor,
  gloveColor,
  shoeColor,
}: {
  url: string
  topColor: string
  bottomColor: string
  helmetColor: string
  gloveColor: string
  shoeColor: string
}) {
  const { scene } = useGLTF(url)

  const model = useMemo(
    () =>
      prepareScene(scene, {
        topColor,
        bottomColor,
        helmetColor,
        gloveColor,
        shoeColor,
      }),
    [scene, topColor, bottomColor, helmetColor, gloveColor, shoeColor],
  )

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

function Mouth({ faceId }: { faceId: string }) {
  const z = 0.269

  if (faceId === 'face-surprised-3d') {
    return (
      <mesh position={[0, 0.716, z]} rotation={[0, 0, 0]}>
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
        <mesh position={[-0.210, 0.930, 0.105]} scale={[0.55, 1.20, 0.72]} rotation={[0, 0, 0.18]}>
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

function HardHat({
  headwearId,
  helmetColor,
}: {
  headwearId: string | null
  helmetColor: string
}) {
  if (!headwearId || headwearId === 'helmet-none') return null

  return (
    <group>
      <mesh position={[0, 0.928, -0.010]}>
        <sphereGeometry args={[0.258, 36, 22, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={helmetColor} roughness={0.82} />
      </mesh>
      <mesh position={[0, 0.925, 0.010]}>
        <cylinderGeometry args={[0.292, 0.292, 0.025, 42]} />
        <meshStandardMaterial color={helmetColor} roughness={0.82} />
      </mesh>
      <mesh position={[0, 1.100, -0.010]} scale={[0.13, 1, 0.78]}>
        <boxGeometry args={[0.055, 0.085, 0.250]} />
        <meshStandardMaterial color={helmetColor} roughness={0.78} />
      </mesh>
    </group>
  )
}

function ProceduralHead({
  skinColor,
  faceId,
  hairStyleId,
  hairColor,
  headwearId,
  helmetColor,
}: {
  skinColor: string
  faceId: string
  hairStyleId: string
  hairColor: string
  headwearId: string | null
  helmetColor: string
}) {
  const surprised = faceId === 'face-surprised-3d'
  return (
    <group position={[0, 0, 0.025]}>
      <mesh position={[0, 0.835, 0]}>
        <sphereGeometry args={[0.268, 42, 32]} />
        <meshStandardMaterial color={skinColor} roughness={0.92} />
      </mesh>

      <mesh position={[-0.061, 0.858, 0.245]} scale={[1, surprised ? 1.17 : 1.08, 0.75]}>
        <sphereGeometry args={[0.052, 24, 18]} />
        <meshStandardMaterial color="#F6F5F1" roughness={0.94} />
      </mesh>
      <mesh position={[0.061, 0.858, 0.245]} scale={[1, surprised ? 1.17 : 1.08, 0.75]}>
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
      <Hair hairStyleId={hairStyleId} hairColor={hairColor} />
      <HardHat headwearId={headwearId} helmetColor={helmetColor} />
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
      <mesh position={[pouchOnly ? 0.155 : -0.155, 0.380, 0.178]} rotation={[0, 0, pouchOnly ? -0.10 : 0.10]}>
        <boxGeometry args={[0.090, 0.115, 0.045]} />
        <meshStandardMaterial color="#6B442C" roughness={0.92} />
      </mesh>
      {!pouchOnly && (
        <>
          <mesh position={[0.155, 0.385, 0.175]} rotation={[0, 0, -0.10]}>
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
  return (
    <group scale={AVATAR_ROOT_SCALE} position={[0, -AVATAR_HEIGHT_METERS / 2, 0]}>
      <ProductionModel
        url={modelUrl}
        topColor={topColor}
        bottomColor={bottomColor}
        helmetColor={helmetColor}
        gloveColor={gloveColor}
        shoeColor={shoeColor}
      />
      <ProceduralHead
        skinColor={skinColor}
        faceId={faceId}
        hairStyleId={hairStyleId}
        hairColor={hairColor}
        headwearId={headwearId}
        helmetColor={helmetColor}
      />
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
