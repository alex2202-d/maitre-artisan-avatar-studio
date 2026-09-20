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

const accessors = json.accessors ?? []
const nodes = json.nodes ?? []
const meshes = json.meshes ?? []

console.log('=== MESH POSITION BOUNDS ===')
meshes.forEach((mesh, mi) => {
  ;(mesh.primitives ?? []).forEach((primitive, pi) => {
    const posAccessorIndex = primitive.attributes?.POSITION
    const acc = accessors[posAccessorIndex]
    console.log(JSON.stringify({
      meshIndex: mi,
      meshName: mesh.name ?? null,
      primitiveIndex: pi,
      positionAccessor: posAccessorIndex,
      min: acc?.min ?? null,
      max: acc?.max ?? null,
      count: acc?.count ?? null,
      material: primitive.material ?? null,
    }))
  })
})

console.log('=== NODE TRANSFORMS ===')
nodes.forEach((node, i) => {
  if (node.mesh !== undefined || node.skin !== undefined || node.name === 'Armature' || node.name === 'world') {
    console.log(JSON.stringify({
      index:i,
      name:node.name ?? null,
      mesh:node.mesh ?? null,
      skin:node.skin ?? null,
      translation:node.translation ?? null,
      rotation:node.rotation ?? null,
      scale:node.scale ?? null,
      matrix:node.matrix ?? null,
      children:node.children ?? null
    }))
  }
})

console.log('=== SUMMARY ===')
console.log(JSON.stringify({
  scenes: json.scenes,
  scene: json.scene,
  skins: (json.skins ?? []).map((s,i)=>({index:i,name:s.name ?? null,skeleton:s.skeleton ?? null,joints:s.joints?.length ?? 0})),
  materials:(json.materials ?? []).map((m,i)=>({index:i,name:m.name ?? null})),
}, null, 2))


console.log('=== MORPH TARGETS ===')
meshes.forEach((mesh, mi) => {
  ;(mesh.primitives ?? []).forEach((primitive, pi) => {
    console.log(JSON.stringify({
      meshIndex: mi,
      meshName: mesh.name ?? null,
      primitiveIndex: pi,
      morphTargetCount: primitive.targets?.length ?? 0,
      morphTargetNames: mesh.extras?.targetNames ?? null,
      attributes: primitive.attributes ?? null,
    }))
  })
})

console.log('=== ALL NODE NAMES ===')
nodes.forEach((node, i) => {
  console.log(JSON.stringify({
    index: i,
    name: node.name ?? null,
    mesh: node.mesh ?? null,
    skin: node.skin ?? null,
    translation: node.translation ?? null,
    rotation: node.rotation ?? null,
    scale: node.scale ?? null,
    matrix: node.matrix ?? null,
    children: node.children ?? null,
  }))
})
