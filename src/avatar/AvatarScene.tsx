import { Suspense, useEffect, useMemo } from 'react'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import { Color, type Material, type Mesh, type MeshStandardMaterial } from 'three'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js'

const AVATAR_ROOT_SCALE = 1
const AVATAR_HEIGHT_METERS = 1.1
const CAMERA_DISTANCE = 3

const FACE_INDEX: Record<string, number> = {
  'face-classic': 0,
  'face-smile': 1,
  'face-determined': 2,
  'face-surprised': 3,
}

function createWardrobeMaterial(
  material: Material,
  topColor: string,
  bottomColor: string,
  skinColor: string,
  faceId: string,
) {
  const standard = material as MeshStandardMaterial
  if (!standard.isMeshStandardMaterial) return material

  const patched = standard.clone()
  const top = new Color(topColor)
  const bottom = new Color(bottomColor)
  const skin = new Color(skinColor)
  const faceIndex = FACE_INDEX[faceId] ?? 0

  patched.onBeforeCompile = (shader) => {
    shader.uniforms.avatarTopColor = { value: top }
    shader.uniforms.avatarBottomColor = { value: bottom }
    shader.uniforms.avatarSkinColor = { value: skin }
    shader.uniforms.avatarExpression = { value: faceIndex }

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
uniform float avatarExpression;
varying vec3 vAvatarBindPosition;

float maEllipse(vec2 p, vec2 center, vec2 radius) {
  vec2 d = (p - center) / radius;
  return 1.0 - smoothstep(0.88, 1.0, dot(d, d));
}

float maSegment(vec2 p, vec2 a, vec2 b, float width) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  float d = length(pa - ba * h);
  return 1.0 - smoothstep(width * 0.72, width, d);
}`,
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
        }

        // Real-time 3D face layer: erase the baked eyes/mouth only on the front
        // of the head, then redraw the selected expression directly on the mesh.
        vec2 faceP = vec2(vAvatarBindPosition.x, vAvatarBindPosition.y);
        bool faceFront =
          vAvatarBindPosition.z > 0.08 &&
          vAvatarBindPosition.y > 0.60 &&
          vAvatarBindPosition.y < 0.95 &&
          abs(vAvatarBindPosition.x) < 0.225;

        bool bakedWhite = r > 0.70 && g > 0.70 && b > 0.70;
        bool bakedDark = r < 0.22 && g < 0.22 && b < 0.22;

        if (faceFront && (bakedWhite || bakedDark)) {
          float skinShade = clamp(0.92 + (vAvatarBindPosition.y - 0.74) * 0.12, 0.84, 1.06);
          diffuseColor.rgb = clamp(avatarSkinColor * skinShade, 0.0, 1.0);
        }

        if (faceFront) {
          bool determined = avatarExpression > 1.5 && avatarExpression < 2.5;
          bool surprised = avatarExpression > 2.5;
          bool smiling = avatarExpression > 0.5 && avatarExpression < 1.5;

          float eyeRy = determined ? 0.052 : (surprised ? 0.078 : 0.068);
          float eyeRx = surprised ? 0.060 : 0.055;
          float eyeY = 0.795;

          float leftEye = maEllipse(faceP, vec2(-0.058, eyeY), vec2(eyeRx, eyeRy));
          float rightEye = maEllipse(faceP, vec2(0.058, eyeY), vec2(eyeRx, eyeRy));
          float eyeMask = max(leftEye, rightEye);

          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.985), eyeMask);

          float pupilY = eyeY + (smiling ? 0.006 : 0.0);
          float pupilRadius = surprised ? 0.012 : 0.014;
          float leftPupil = maEllipse(faceP, vec2(-0.058, pupilY), vec2(pupilRadius));
          float rightPupil = maEllipse(faceP, vec2(0.058, pupilY), vec2(pupilRadius));
          float pupilMask = max(leftPupil, rightPupil);
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.035, 0.032, 0.030), pupilMask);

          if (determined) {
            float browL = maSegment(faceP, vec2(-0.108, 0.868), vec2(-0.018, 0.845), 0.009);
            float browR = maSegment(faceP, vec2(0.018, 0.845), vec2(0.108, 0.868), 0.009);
            diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.060, 0.050, 0.045), max(browL, browR));

            float firmMouth = maSegment(faceP, vec2(-0.040, 0.653), vec2(0.040, 0.653), 0.008);
            diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.055, 0.045, 0.040), firmMouth);
          } else if (surprised) {
            float mouthOuter = maEllipse(faceP, vec2(0.0, 0.650), vec2(0.028, 0.037));
            diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.050, 0.040, 0.038), mouthOuter);
          } else {
            float mouthX = faceP.x;
            float curveY = smiling
              ? 0.640 + 2.25 * mouthX * mouthX
              : 0.650 + 1.65 * mouthX * mouthX;
            float mouthWidth = smiling ? 0.062 : 0.050;
            float mouthBand =
              (1.0 - smoothstep(smiling ? 0.007 : 0.006, smiling ? 0.010 : 0.009, abs(faceP.y - curveY))) *
              (1.0 - smoothstep(mouthWidth - 0.008, mouthWidth, abs(mouthX)));
            diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.055, 0.045, 0.040), mouthBand);
          }
        }`,
      )
  }

  patched.customProgramCacheKey = () =>
    `ma-wardrobe-face-v2-${topColor}-${bottomColor}-${skinColor}-${faceId}`
  patched.needsUpdate = true
  return patched
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
          createWardrobeMaterial(material, topColor, bottomColor, skinColor, faceId),
        )
      } else if (mesh.material) {
        mesh.material = createWardrobeMaterial(
          mesh.material,
          topColor,
          bottomColor,
          skinColor,
          faceId,
        )
      }
    })

    return instance
  }, [scene, topColor, bottomColor, skinColor, faceId])

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
