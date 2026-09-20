import { Suspense, useEffect, useMemo } from 'react'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import {
  Color,
  MeshStandardMaterial,
  type Material,
  type Mesh,
  type SkinnedMesh,
} from 'three'
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
  faceId: string,
  debugBind: boolean,
) {
  const standard = material as MeshStandardMaterial
  if (!standard.isMeshStandardMaterial) return material

  const patched = standard.clone()
  const top = new Color(topColor)
  const bottom = new Color(bottomColor)
  const replaceBakedMouth = faceId !== 'face-classic'

  patched.onBeforeCompile = (shader) => {
    shader.uniforms.avatarTopColor = { value: top }
    shader.uniforms.avatarBottomColor = { value: bottom }
    shader.uniforms.avatarReplaceMouth = { value: replaceBakedMouth ? 1 : 0 }

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
uniform float avatarReplaceMouth;
varying vec3 vAvatarBindPosition;`,
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

        // Remove the baked Meshy mouth directly in the ORIGINAL textured
        // material. This avoids any flat skin-colour patch on the overlay.
        if (avatarReplaceMouth > 0.5) {
          vec3 fp = vAvatarBindPosition;
          float faceFront = smoothstep(0.125, 0.155, fp.z);

          float mouthAreaX =
            1.0 - smoothstep(0.090, 0.112, abs(fp.x));
          float mouthAreaY =
            smoothstep(0.620, 0.635, fp.y) *
            (1.0 - smoothstep(0.696, 0.710, fp.y));
          float mouthArea = mouthAreaX * mouthAreaY * faceFront;

          #ifdef USE_MAP
            vec3 sampleA =
              texture2D(map, vMapUv + vec2( 0.012,  0.000)).rgb;
            vec3 sampleB =
              texture2D(map, vMapUv + vec2(-0.012,  0.000)).rgb;
            vec3 sampleC =
              texture2D(map, vMapUv + vec2( 0.000,  0.014)).rgb;
            vec3 sampleD =
              texture2D(map, vMapUv + vec2( 0.000, -0.014)).rgb;

            vec3 cleanSample = sampleA;
            float cleanLuma =
              dot(cleanSample, vec3(0.299, 0.587, 0.114));

            float lumaB =
              dot(sampleB, vec3(0.299, 0.587, 0.114));
            if (lumaB > cleanLuma) {
              cleanSample = sampleB;
              cleanLuma = lumaB;
            }

            float lumaC =
              dot(sampleC, vec3(0.299, 0.587, 0.114));
            if (lumaC > cleanLuma) {
              cleanSample = sampleC;
              cleanLuma = lumaC;
            }

            float lumaD =
              dot(sampleD, vec3(0.299, 0.587, 0.114));
            if (lumaD > cleanLuma) {
              cleanSample = sampleD;
              cleanLuma = lumaD;
            }

            float currentLuma =
              dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));

            // Only replace pixels that are clearly darker than nearby face
            // texture. Natural skin shading remains untouched.
            float bakedMouthMask =
              mouthArea *
              smoothstep(0.055, 0.145, cleanLuma - currentLuma);

            diffuseColor.rgb =
              mix(diffuseColor.rgb, cleanSample, bakedMouthMask);
          #endif
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
    `ma-wardrobe-v6-${topColor}-${bottomColor}-${faceId}-${debugBind}`
  patched.needsUpdate = true
  return patched
}

function createFaceOverlayMaterial(skinColor: string, faceId: string) {
  const skin = new Color(skinColor)
  const faceIndex = FACE_INDEX[faceId] ?? 0
  const faceLiteral = faceIndex.toFixed(1)

  const material = new MeshStandardMaterial({
    color: '#ffffff',
    roughness: 0.9,
    metalness: 0,
    transparent: true,
    opacity: 1,
    alphaTest: 0.02,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -3,
    polygonOffsetUnits: -3,
  })

  material.onBeforeCompile = (shader) => {
    shader.uniforms.avatarSkinColor = { value: skin }

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        '#include <common>\nvarying vec3 vFaceBindPosition;',
      )
      .replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\nvFaceBindPosition = position;',
      )

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
uniform vec3 avatarSkinColor;
const float avatarFaceExpression = ${faceLiteral};
varying vec3 vFaceBindPosition;

float maEllipse(vec2 p, vec2 center, vec2 radius) {
  vec2 d = (p - center) / radius;
  return 1.0 - smoothstep(0.82, 1.0, dot(d, d));
}

float maSegment(vec2 p, vec2 a, vec2 b, float width) {
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
        vec3 fp = vFaceBindPosition;

        // Preserve the original FAL/Meshy eyes and pupils exactly as authored.
        // Only the mouth and, when needed, very small graphic brow/eyelid marks
        // are changed. This keeps the approved compact South-Park-like DA.
        float front = smoothstep(0.125, 0.155, fp.z);
        vec3 dark = vec3(0.050, 0.036, 0.030);

        // Draw only the selected expression. The baked mouth is removed in
        // the textured base material, so this layer never paints a skin patch.
        float overlayAlpha = 0.0;
        vec3 overlayColor = vec3(0.0);

        bool smiling =
          avatarFaceExpression > 0.5 && avatarFaceExpression < 1.5;
        bool determined =
          avatarFaceExpression > 1.5 && avatarFaceExpression < 2.5;
        bool surprised =
          avatarFaceExpression > 2.5;

        if (smiling) {
          // Same visual language as the classic face: one simple dark curve,
          // only a little wider and more cheerful. No teeth, no extra volume.
          float mx = fp.x;
          float width = 0.061;
          float normalized = clamp(abs(mx) / width, 0.0, 1.0);
          float smileY = 0.649 + 0.020 * normalized * normalized;
          float mouth =
            (1.0 - smoothstep(0.0045, 0.0070, abs(fp.y - smileY))) *
            (1.0 - smoothstep(width - 0.010, width, abs(mx))) *
            front;

          overlayColor = mix(overlayColor, dark, mouth);
          overlayAlpha = max(overlayAlpha, mouth);
        } else if (determined) {
          // Minimal straight mouth.
          float mouth =
            maSegment(
              fp.xy,
              vec2(-0.047, 0.656),
              vec2(0.047, 0.656),
              0.0060
            ) * front;
          overlayColor = mix(overlayColor, dark, mouth);
          overlayAlpha = max(overlayAlpha, mouth);

          // Thin brows only. They sit above the original eyes and do not
          // replace or enlarge them.
          float browL =
            maSegment(
              fp.xy,
              vec2(-0.094, 0.830),
              vec2(-0.029, 0.815),
              0.0045
            ) * front;
          float browR =
            maSegment(
              fp.xy,
              vec2(0.029, 0.815),
              vec2(0.094, 0.830),
              0.0045
            ) * front;
          float brows = max(browL, browR);
          overlayColor = mix(overlayColor, dark, brows);
          overlayAlpha = max(overlayAlpha, brows);

        } else if (surprised) {
          // Small graphic O mouth, deliberately restrained.
          float mouth =
            maEllipse(
              fp.xy,
              vec2(0.0, 0.658),
              vec2(0.014, 0.020)
            ) * front;

          overlayColor = mix(overlayColor, dark, mouth);
          overlayAlpha = max(overlayAlpha, mouth);
        }

        overlayAlpha = clamp(overlayAlpha, 0.0, 1.0);

        diffuseColor.rgb = overlayColor;
        diffuseColor.a = overlayAlpha;`,
      )
  }

  material.customProgramCacheKey = () =>
    `ma-face-overlay-da-v2-${skinColor}-${faceId}`
  material.needsUpdate = true
  return material
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
    const faceOverlays: Array<{
      parent: NonNullable<SkinnedMesh['parent']>
      overlay: SkinnedMesh
    }> = []

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
            faceId,
            debugBind,
          ),
        )
      } else if (mesh.material) {
        mesh.material = createWardrobeMaterial(
          mesh.material,
          topColor,
          bottomColor,
          faceId,
          debugBind,
        )
      }

      const skinned = child as SkinnedMesh
      if (
        faceId !== 'face-classic' &&
        skinned.isSkinnedMesh &&
        skinned.parent
      ) {
        const overlay = skinned.clone(false) as SkinnedMesh
        overlay.name = `${skinned.name || 'avatar'}__face_overlay`
        overlay.material = createFaceOverlayMaterial(skinColor, faceId)
        overlay.castShadow = false
        overlay.receiveShadow = false
        overlay.renderOrder = 30
        overlay.frustumCulled = false

        faceOverlays.push({
          parent: skinned.parent,
          overlay,
        })
      }
    })

    faceOverlays.forEach(({ parent, overlay }) => {
      parent.add(overlay)
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
