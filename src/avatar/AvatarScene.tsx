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
  debugBind: boolean,
) {
  const standard = material as MeshStandardMaterial
  if (!standard.isMeshStandardMaterial) return material

  const patched = standard.clone()
  const top = new Color(topColor)
  const bottom = new Color(bottomColor)
  const skin = new Color(skinColor)
  const faceIndex = FACE_INDEX[faceId] ?? 0
  const faceLiteral = faceIndex.toFixed(1)

  patched.onBeforeCompile = (shader) => {
    shader.uniforms.avatarTopColor = { value: top }
    shader.uniforms.avatarBottomColor = { value: bottom }
    shader.uniforms.avatarSkinColor = { value: skin }

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
const float avatarExpression = ${faceLiteral};
varying vec3 vAvatarBindPosition;

float maEllipseMask(vec2 p, vec2 center, vec2 radius) {
  vec2 d = (p - center) / radius;
  return 1.0 - smoothstep(0.82, 1.0, dot(d, d));
}

float maSegmentMask(vec2 p, vec2 a, vec2 b, float width) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 0.000001), 0.0, 1.0);
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

        // Meshy generated the V2 avatar as one continuous skinned mesh with the
        // classic face baked into its texture. The face slot therefore works
        // directly on the measured bind-pose head surface. These coordinates
        // were decoded from the actual rendered pixels, not guessed:
        // left eye  = (-0.0645, 0.7814, 0.2181)
        // right eye = ( 0.0567, 0.7812, 0.2211)
        // mouth     = ( 0.0010, 0.6631, 0.1567)
        if (avatarExpression > 0.5) {
          vec3 fp = vAvatarBindPosition;
          float front = smoothstep(0.125, 0.155, fp.z);

          vec2 leftEyeCenter = vec2(-0.061, 0.781);
          vec2 rightEyeCenter = vec2(0.061, 0.781);

          float cleanLeft = maEllipseMask(fp.xy, leftEyeCenter, vec2(0.078, 0.071));
          float cleanRight = maEllipseMask(fp.xy, rightEyeCenter, vec2(0.078, 0.071));
          float cleanEyes = max(cleanLeft, cleanRight) * front;

          float mouthXMask = 1.0 - smoothstep(0.102, 0.118, abs(fp.x));
          float mouthYMask =
            smoothstep(0.610, 0.625, fp.y) *
            (1.0 - smoothstep(0.700, 0.715, fp.y));
          float cleanMouth = mouthXMask * mouthYMask * front;

          float cleanFace = max(cleanEyes, cleanMouth);
          if (cleanFace > 0.001) {
            float skinShade = clamp(0.992 + (fp.y - 0.72) * 0.045, 0.965, 1.02);
            vec3 cleanSkin = clamp(avatarSkinColor * skinShade, 0.0, 1.0);
            diffuseColor.rgb = mix(diffuseColor.rgb, cleanSkin, cleanFace);
          }

          bool smiling =
            avatarExpression > 0.5 && avatarExpression < 1.5;
          bool determined =
            avatarExpression > 1.5 && avatarExpression < 2.5;
          bool surprised =
            avatarExpression > 2.5;

          float eyeRy = smiling ? 0.052 : (determined ? 0.038 : 0.066);
          float eyeRx = surprised ? 0.058 : 0.054;

          float leftEye = maEllipseMask(
            fp.xy,
            leftEyeCenter,
            vec2(eyeRx, eyeRy)
          );
          float rightEye = maEllipseMask(
            fp.xy,
            rightEyeCenter,
            vec2(eyeRx, eyeRy)
          );
          float eyeMask = max(leftEye, rightEye) * front;
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.985), eyeMask);

          float pupilY =
            smiling ? 0.784 : (determined ? 0.777 : 0.781);
          float pupilRx = surprised ? 0.0135 : 0.0120;
          float pupilRy = surprised ? 0.0170 : (determined ? 0.0100 : 0.0130);
          float leftPupil = maEllipseMask(
            fp.xy,
            vec2(-0.061, pupilY),
            vec2(pupilRx, pupilRy)
          );
          float rightPupil = maEllipseMask(
            fp.xy,
            vec2(0.061, pupilY),
            vec2(pupilRx, pupilRy)
          );
          float pupilMask = max(leftPupil, rightPupil) * front;
          diffuseColor.rgb = mix(
            diffuseColor.rgb,
            vec3(0.035, 0.026, 0.021),
            pupilMask
          );

          if (determined) {
            float browL = maSegmentMask(
              fp.xy,
              vec2(-0.116, 0.840),
              vec2(-0.016, 0.811),
              0.0090
            );
            float browR = maSegmentMask(
              fp.xy,
              vec2(0.016, 0.811),
              vec2(0.116, 0.840),
              0.0090
            );
            float brows = max(browL, browR) * front;
            diffuseColor.rgb = mix(
              diffuseColor.rgb,
              vec3(0.050, 0.036, 0.030),
              brows
            );

            float mouth = maSegmentMask(
              fp.xy,
              vec2(-0.050, 0.650),
              vec2(0.050, 0.650),
              0.0075
            ) * front;
            diffuseColor.rgb = mix(
              diffuseColor.rgb,
              vec3(0.050, 0.036, 0.030),
              mouth
            );
          } else if (surprised) {
            float mouthOuter = maEllipseMask(
              fp.xy,
              vec2(0.0, 0.651),
              vec2(0.029, 0.037)
            );
            float mouthInner = maEllipseMask(
              fp.xy,
              vec2(0.0, 0.651),
              vec2(0.014, 0.020)
            );
            float mouthRing = clamp(mouthOuter - mouthInner, 0.0, 1.0) * front;
            diffuseColor.rgb = mix(
              diffuseColor.rgb,
              vec3(0.045, 0.031, 0.027),
              mouthRing
            );
          } else if (smiling) {
            float mx = fp.x;
            float width = 0.073;
            float normalized = clamp(abs(mx) / width, 0.0, 1.0);
            // Corners higher, centre lower: a simple graphic smile that stays
            // within the approved compact cartoon direction.
            float curveY = 0.642 + 0.034 * normalized * normalized;
            float mouth =
              (1.0 - smoothstep(0.0055, 0.0090, abs(fp.y - curveY))) *
              (1.0 - smoothstep(width - 0.012, width, abs(mx))) *
              front;
            diffuseColor.rgb = mix(
              diffuseColor.rgb,
              vec3(0.050, 0.036, 0.030),
              mouth
            );
          }
        }`,
      )

    if (debugBind) {
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <dithering_fragment>',
        `#include <dithering_fragment>
        gl_FragColor = vec4(
          clamp(
            vec3(
              (vAvatarBindPosition.x + 0.35) / 0.70,
              vAvatarBindPosition.y / 1.10,
              (vAvatarBindPosition.z + 0.27) / 0.54
            ),
            0.0,
            1.0
          ),
          1.0
        );`,
      )
    }
  }

  patched.customProgramCacheKey = () =>
    `ma-wardrobe-face-slot-v1-${topColor}-${bottomColor}-${skinColor}-${faceId}-${debugBind}`
  patched.needsUpdate = true
  return patched
}

function ProductionModel({
  url,
  topColor,
  bottomColor,
  skinColor,
  faceId,
  debugBind,
}: {
  url: string
  topColor: string
  bottomColor: string
  skinColor: string
  faceId: string
  debugBind: boolean
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
          createWardrobeMaterial(
            material,
            topColor,
            bottomColor,
            skinColor,
            faceId,
            debugBind,
          ),
        )
      } else if (mesh.material) {
        mesh.material = createWardrobeMaterial(
          mesh.material,
          topColor,
          bottomColor,
          skinColor,
          faceId,
          debugBind,
        )
      }
    })

    return instance
  }, [scene, topColor, bottomColor, skinColor, faceId, debugBind])

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
  const debugBind =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('debugBind') === '1'

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
          debugBind={debugBind}
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
