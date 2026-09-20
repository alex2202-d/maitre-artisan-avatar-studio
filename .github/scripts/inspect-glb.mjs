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


console.log('=== FRONT FACE UV REGIONS ===')
for (const [meshIndex, mesh] of meshes.entries()) {
  for (const [primitiveIndex, primitive] of (mesh.primitives ?? []).entries()) {
    const attrs = primitive.attributes ?? {}
    if (attrs.POSITION === undefined || attrs.TEXCOORD_0 === undefined) continue
    const positions = readAccessor(attrs.POSITION)
    const uvs = readAccessor(attrs.TEXCOORD_0)
    const regions = [
      {name:'face-front-wide', test:(p)=>p[1]>=0.68 && p[1]<=1.04 && p[2]>=0.10 && Math.abs(p[0])<=0.23},
      {name:'face-front-tight', test:(p)=>p[1]>=0.72 && p[1]<=0.99 && p[2]>=0.15 && Math.abs(p[0])<=0.19},
      {name:'eyes-band', test:(p)=>p[1]>=0.82 && p[1]<=0.96 && p[2]>=0.15 && Math.abs(p[0])<=0.18},
      {name:'mouth-band', test:(p)=>p[1]>=0.68 && p[1]<=0.82 && p[2]>=0.15 && Math.abs(p[0])<=0.13},
    ]
    for (const region of regions) {
      const selected=[]
      for (let i=0;i<positions.length;i++) if (region.test(positions[i])) selected.push({p:positions[i],uv:uvs[i],index:i})
      const bins=new Map()
      for (const item of selected) {
        const bx=Math.min(7,Math.max(0,Math.floor(item.uv[0]*8)))
        const by=Math.min(7,Math.max(0,Math.floor(item.uv[1]*8)))
        const key=bx+','+by
        bins.set(key,(bins.get(key)??0)+1)
      }
      const topBins=[...bins.entries()].sort((a,b)=>b[1]-a[1]).slice(0,12)
      console.log(JSON.stringify({
        meshIndex,primitiveIndex,region:region.name,
        positionBounds:bounds(selected.map(v=>v.p),3),
        uvBounds:bounds(selected.map(v=>v.uv),2),
        topUvBins:topBins,
        sample:selected.slice(0,20)
      }))
    }
  }
}


console.log('=== GEOMETRY CONNECTED COMPONENTS ===')
function quantKey(p, eps=1e-5) {
  return [Math.round(p[0]/eps),Math.round(p[1]/eps),Math.round(p[2]/eps)].join(',')
}
for (const [meshIndex, mesh] of meshes.entries()) {
  for (const [primitiveIndex, primitive] of (mesh.primitives ?? []).entries()) {
    const attrs=primitive.attributes ?? {}
    if (attrs.POSITION===undefined || primitive.indices===undefined) continue
    const positions=readAccessor(attrs.POSITION)
    const indices=readAccessor(primitive.indices).map(v=>v[0])
    const parent=new Array(positions.length)
    for(let i=0;i<parent.length;i++) parent[i]=i
    const find=(x)=>{ while(parent[x]!==x){ parent[x]=parent[parent[x]]; x=parent[x] } return x }
    const union=(a,b)=>{ a=find(a); b=find(b); if(a!==b) parent[b]=a }

    // Unify duplicate vertices created by UV seams/normals before triangle adjacency.
    const byPosition=new Map()
    for(let i=0;i<positions.length;i++){
      const k=quantKey(positions[i])
      const prev=byPosition.get(k)
      if(prev===undefined) byPosition.set(k,i)
      else union(i,prev)
    }
    for(let i=0;i+2<indices.length;i+=3){
      const a=indices[i],b=indices[i+1],c=indices[i+2]
      union(a,b); union(b,c); union(c,a)
    }

    const comps=new Map()
    for(let i=0;i<positions.length;i++){
      const root=find(i)
      if(!comps.has(root)) comps.set(root,[])
      comps.get(root).push(i)
    }
    const summary=[...comps.values()].map(ids=>{
      const rows=ids.map(i=>positions[i])
      const b=bounds(rows,3)
      const center=b ? b.min.map((v,j)=>(v+b.max[j])/2) : null
      const size=b ? b.min.map((v,j)=>b.max[j]-v) : null
      return {vertices:ids.length,bounds:b,center,size,sampleIndices:ids.slice(0,12)}
    }).sort((a,b)=>b.vertices-a.vertices)
    console.log(JSON.stringify({meshIndex,primitiveIndex,componentCount:summary.length,components:summary.slice(0,40)}))
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
