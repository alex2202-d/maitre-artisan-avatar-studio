import { Suspense, useEffect, useMemo } from 'react'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import {
  BoxGeometry,
  CircleGeometry,
  Color,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  TorusGeometry,
  type Material,
} from 'three'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js'

const AVATAR_ROOT_SCALE = 1
const AVATAR_HEIGHT_METERS = 1.1
const CAMERA_DISTANCE = 3

function createWardrobeMaterial(
  material: Material,
  topColor: string,
  bottomColor: string,
) {
  const standard = material as MeshStandardMaterial
  if (!standard.isMeshStandardMaterial) return material

  const patched = standard.clone()
  const top = new Color(topColor)
  const bottom = new Color(bottomColor)

  patched.onBeforeCompile = (shader) => {
    shader.uniforms.avatarTopColor = { value: top }
    shader.uniforms.avatarBottomColor = { value: bottom }

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
        '#include <common>\nuniform vec3 avatarTopColor;\nuniform vec3 avatarBottomColor;\nvarying vec3 vAvatarBindPosition;',
      )
      .replace(
        '#include <map_fragment>',
        `#include <map_fragment>
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
    `ma-wardrobe-v2-${topColor}-${bottomColor}`
  patched.needsUpdate = true
  return patched
}

function makeFaceDisc(
  radius: number,
  material: Material,
  x: number,
  y: number,
  z: number,
  scaleX = 1,
  scaleZ = 1,
) {
  const mesh = new Mesh(new CircleGeometry(radius, 48), material)
  mesh.position.set(x, y, z)
  mesh.rotation.x = -Math.PI / 2
  mesh.scale.set(scaleX, scaleZ, 1)
  mesh.renderOrder = 20
  mesh.userData.generatedFace = true
  return mesh
}

function makeFaceBox(
  width: number,
  height: number,
  material: Material,
  x: number,
  y: number,
  z: number,
  angle = 0,
) {
  const mesh = new Mesh(new BoxGeometry(width, 0.42, height), material)
  mesh.position.set(x, y, z)
  mesh.rotation.y = angle
  mesh.renderOrder = 22
  mesh.userData.generatedFace = true
  return mesh
}

function makeSmile(
  radius: number,
  material: Material,
  x: number,
  y: number,
  z: number,
  width = 0.42,
) {
  const mesh = new Mesh(new TorusGeometry(radius, width, 8, 36, Math.PI), material)
  mesh.position.set(x, y, z)
  mesh.rotation.x = -Math.PI / 2
  mesh.rotation.y = Math.PI
  mesh.renderOrder = 22
  mesh.userData.generatedFace = true
  return mesh
}

function createFaceRig(faceId: string, skinColor: string) {
  const face = new Group()
  face.name = 'MA_FACE_RIG'

  const skin = new MeshStandardMaterial({
    color: new Color(skinColor),
    roughness: 0.92,
    metalness: 0,
  })
  const white = new MeshBasicMaterial({ color: '#ffffff' })
  const black = new MeshBasicMaterial({ color: '#171717' })

  // The GLB has no morph targets. The dedicated "headfront" bone is therefore
  // used as the stable attachment point for the visible face module.
  //
  // headfront local axes:
  // X = horizontal, Y = outward from the face, Z = vertical (negative = up).
  // Small skin-colored discs erase the baked eyes/mouth before the selected
  // 3D expression is drawn a few millimetres in front of them.
  const eyeY = 0.34
  const eyeZ = -18.1
  const leftX = -4.15
  const rightX = 4.15

  face.add(makeFaceDisc(1, skin, leftX, 0.18, eyeZ, 5.4, 6.8))
  face.add(makeFaceDisc(1, skin, rightX, 0.18, eyeZ, 5.4, 6.8))
  face.add(makeFaceDisc(1, skin, 0, 0.18, -7.4, 5.6, 3.2))

  const isSmile = faceId === 'face-smile'
  const isDetermined = faceId === 'face-determined'
  const isSurprised = faceId === 'face-surprised'

  const eyeScaleX = isSurprised ? 4.5 : isDetermined ? 4.1 : 4.15
  const eyeScaleZ = isSurprised ? 6.4 : isDetermined ? 3.7 : isSmile ? 4.9 : 5.7

  face.add(makeFaceDisc(1, white, leftX, eyeY, eyeZ, eyeScaleX, eyeScaleZ))
  face.add(makeFaceDisc(1, white, rightX, eyeY, eyeZ, eyeScaleX, eyeScaleZ))

  const pupilRadiusX = isSurprised ? 0.92 : 1.05
  const pupilRadiusZ = isDetermined ? 0.92 : 1.12
  const pupilZ = eyeZ + (isSmile ? 0.6 : isDetermined ? -0.2 : 0)

  face.add(makeFaceDisc(1, black, leftX, 0.54, pupilZ, pupilRadiusX, pupilRadiusZ))
  face.add(makeFaceDisc(1, black, rightX, 0.54, pupilZ, pupilRadiusX, pupilRadiusZ))

  if (isDetermined) {
    face.add(makeFaceBox(4.5, 0.62, black, -4.1, 0.58, -24.8, -0.24))
    face.add(makeFaceBox(4.5, 0.62, black, 4.1, 0.58, -24.8, 0.24))
    face.add(makeFaceBox(7.5, 0.58, black, 0, 0.58, -7.2, 0))
  } else if (isSurprised) {
    face.add(makeFaceDisc(1, black, 0, 0.56, -7.0, 1.75, 2.35))
  } else if (isSmile) {
    face.add(makeSmile(4.5, black, 0, 0.58, -6.3, 0.48))
  } else {
    face.add(makeSmile(3.7, black, 0, 0.58, -6.6, 0.36))
  }

  return face
}

function ProductionModel({
  url,
  topColor,
  bottomColor,
  skinColor,
  faceId,
}: {
  url: string
  topColor: string
  bottomColor: string
  skinColor: string
  faceId: string
}) {
  const { scene } = useGLTF(url)

  const model = useMemo(() => {
    const instance = clone(scene)

    instance.traverse((child) => {
      const mesh = child as Mesh
      if (!mesh.isMesh) return

      mesh.castShadow = true
      mesh.receiveShadow = true

      if (Array.isArray(mesh.material)) {
        mesh.material = mesh.material.map((material) =>
          createWardrobeMaterial(material, topColor, bottomColor),
        )
      } else if (mesh.material) {
        mesh.material = createWardrobeMaterial(
          mesh.material,
          topColor,
          bottomColor,
        )
      }
    })

    const headFront = instance.getObjectByName('headfront')
    if (headFront) {
      headFront.add(createFaceRig(faceId, skinColor))
    } else {
      console.warn('[AvatarStudio] headfront bone not found; face module skipped.')
    }

    return instance
  }, [scene, topColor, bottomColor, skinColor, faceId])

  useEffect(() => {
    return () => {
      model.traverse((child) => {
        const mesh = child as Mesh
        if (!mesh.isMesh) return

        if (mesh.userData.generatedFace) {
          mesh.geometry?.dispose()
        }

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
  topColor = '#D93636',
  bottomColor = '#D93636',
  skinColor = '#BC7F58',
  faceId = 'face-classic',
}: {
  modelUrl: string
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
          skinColor={skinColor}
          faceId={faceId}
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
