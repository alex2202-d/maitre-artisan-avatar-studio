import fs from 'node:fs'

const file = process.argv[2]
if (!file) throw new Error('Usage: node inspect-glb.mjs <file.glb>')

const buffer = fs.readFileSync(file)
if (buffer.toString('utf8', 0, 4) !== 'glTF') throw new Error('Not a GLB file')

let offset = 12
let json = null
let bin = null
while (offset < buffer.length) {
  const chunkLength = buffer.readUInt32LE(offset)
  const chunkType = buffer.readUInt32LE(offset + 4)
  const start = offset + 8
  const end = start + chunkLength
  if (chunkType === 0x4E4F534A) {
    json = JSON.parse(buffer.toString('utf8', start, end).replace(/\u0000+$/g, '').trimEnd())
  } else if (chunkType === 0x004E4942) {
    bin = buffer.subarray(start, end)
  }
  offset = end
}
if (!json || !bin) throw new Error('GLB chunks not found')

const accessors = json.accessors ?? []
const nodes = json.nodes ?? []
const meshes = json.meshes ?? []
const skins = json.skins ?? []
const bufferViews = json.bufferViews ?? []

const COMPONENT = {
  5120: { bytes: 1, read: (b,o)=>b.readInt8(o) },
  5121: { bytes: 1, read: (b,o)=>b.readUInt8(o) },
  5122: { bytes: 2, read: (b,o)=>b.readInt16LE(o) },
  5123: { bytes: 2, read: (b,o)=>b.readUInt16LE(o) },
  5125: { bytes: 4, read: (b,o)=>b.readUInt32LE(o) },
  5126: { bytes: 4, read: (b,o)=>b.readFloatLE(o) },
}
const TYPE_SIZE = { SCALAR:1, VEC2:2, VEC3:3, VEC4:4, MAT2:4, MAT3:9, MAT4:16 }

function readAccessor(index) {
  const acc = accessors[index]
  if (!acc) throw new Error('Accessor not found: ' + index)
  const view = bufferViews[acc.bufferView]
  const component = COMPONENT[acc.componentType]
  const width = TYPE_SIZE[acc.type]
  if (!view || !component || !width) throw new Error('Unsupported accessor: ' + index)
  const stride = view.byteStride ?? component.bytes * width
  const base = (view.byteOffset ?? 0) + (acc.byteOffset ?? 0)
  const out = new Array(acc.count)
  for (let i=0;i<acc.count;i++) {
    const row = new Array(width)
    const rowOffset = base + i * stride
    for (let j=0;j<width;j++) row[j] = component.read(bin, rowOffset + j * component.bytes)
    out[i] = row
  }
  return out
}

function bounds(rows, dimensions) {
  if (!rows.length) return null
  const min = new Array(dimensions).fill(Infinity)
  const max = new Array(dimensions).fill(-Infinity)
  for (const row of rows) {
    for (let i=0;i<dimensions;i++) {
      min[i]=Math.min(min[i],row[i])
      max[i]=Math.max(max[i],row[i])
    }
  }
  return {min,max,count:rows.length}
}

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

console.log('=== SUMMARY ===')
console.log(JSON.stringify({
  scenes: json.scenes,
  scene: json.scene,
  skins: skins.map((s,i)=>({
    index:i,
    name:s.name ?? null,
    skeleton:s.skeleton ?? null,
    joints:(s.joints ?? []).map((nodeIndex,jointIndex)=>({
      jointIndex,
      nodeIndex,
      name:nodes[nodeIndex]?.name ?? null,
    }))
  })),
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

console.log('=== FACE SKINNING / UV ANALYSIS ===')
for (const [meshIndex, mesh] of meshes.entries()) {
  for (const [primitiveIndex, primitive] of (mesh.primitives ?? []).entries()) {
    const attrs = primitive.attributes ?? {}
    if ([attrs.POSITION, attrs.TEXCOORD_0, attrs.JOINTS_0, attrs.WEIGHTS_0].some(v=>v===undefined)) continue

    const positions = readAccessor(attrs.POSITION)
    const uvs = readAccessor(attrs.TEXCOORD_0)
    const joints = readAccessor(attrs.JOINTS_0)
    const weights = readAccessor(attrs.WEIGHTS_0)
    const skin = skins[0]
    const targets = ['headfront','Head','head_end','neck']

    for (const targetName of targets) {
      const nodeIndex = nodes.findIndex(n=>n.name===targetName)
      const jointIndex = (skin?.joints ?? []).indexOf(nodeIndex)
      if (nodeIndex < 0 || jointIndex < 0) {
        console.log(JSON.stringify({targetName,nodeIndex,jointIndex,found:false}))
        continue
      }

      for (const threshold of [0.25,0.5,0.75]) {
        const selected = []
        for (let i=0;i<positions.length;i++) {
          let w=0
          for (let k=0;k<4;k++) if (joints[i][k]===jointIndex) w += weights[i][k]
          if (w >= threshold) selected.push({p:positions[i],uv:uvs[i],weight:w,index:i})
        }
        console.log(JSON.stringify({
          meshIndex,primitiveIndex,targetName,nodeIndex,jointIndex,threshold,
          positionBounds:bounds(selected.map(v=>v.p),3),
          uvBounds:bounds(selected.map(v=>v.uv),2),
          sample:selected.slice(0,8)
        }))
      }
    }
  }
}

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
