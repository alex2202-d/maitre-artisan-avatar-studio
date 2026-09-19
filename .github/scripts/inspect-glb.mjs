import fs from 'node:fs'

const file = process.argv[2]
if (!file) throw new Error('Usage: node inspect-glb.mjs <file.glb>')

const buffer = fs.readFileSync(file)
if (buffer.toString('utf8', 0, 4) !== 'glTF') throw new Error('Not a GLB file')

let offset = 12
let json = null
while (offset < buffer.length) {
  const chunkLength = buffer.readUInt32LE(offset)
  const chunkType = buffer.readUInt32LE(offset + 4)
  const start = offset + 8
  const end = start + chunkLength
  if (chunkType === 0x4E4F534A) {
    json = JSON.parse(buffer.toString('utf8', start, end).replace(/\u0000+$/g, ''))
    break
  }
  offset = end
}
if (!json) throw new Error('JSON chunk not found')

const summary = {
  asset: json.asset,
  scenes: json.scenes?.length ?? 0,
  nodes: (json.nodes ?? []).map((node, index) => ({
    index,
    name: node.name ?? null,
    mesh: node.mesh ?? null,
    skin: node.skin ?? null,
    children: node.children ?? [],
  })),
  meshes: (json.meshes ?? []).map((mesh, index) => ({
    index,
    name: mesh.name ?? null,
    primitives: (mesh.primitives ?? []).map((primitive, pIndex) => ({
      index: pIndex,
      material: primitive.material ?? null,
      mode: primitive.mode ?? 4,
      attributes: Object.keys(primitive.attributes ?? {}),
    })),
  })),
  materials: (json.materials ?? []).map((material, index) => ({
    index,
    name: material.name ?? null,
    baseColorFactor: material.pbrMetallicRoughness?.baseColorFactor ?? null,
    baseColorTexture: material.pbrMetallicRoughness?.baseColorTexture?.index ?? null,
    metallicFactor: material.pbrMetallicRoughness?.metallicFactor ?? null,
    roughnessFactor: material.pbrMetallicRoughness?.roughnessFactor ?? null,
    normalTexture: material.normalTexture?.index ?? null,
  })),
  textures: json.textures?.length ?? 0,
  images: (json.images ?? []).map((image, index) => ({
    index,
    name: image.name ?? null,
    mimeType: image.mimeType ?? null,
    uri: image.uri ?? null,
    bufferView: image.bufferView ?? null,
  })),
  skins: (json.skins ?? []).map((skin, index) => ({
    index,
    name: skin.name ?? null,
    joints: skin.joints?.length ?? 0,
    skeleton: skin.skeleton ?? null,
  })),
}

console.log(JSON.stringify(summary, null, 2))
