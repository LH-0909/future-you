// Model-data adaptation only. Geometry remains BodyParts3D, CC BY 4.0.
// Repack selected systems into a few render batches and reduce detail for WebGL.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { MeshoptSimplifier } from 'meshoptimizer';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const input=path.join(root,'.asset-source'),output=path.join(root,'public','models');
fs.mkdirSync(output,{recursive:true});
const source=JSON.parse(fs.readFileSync(path.join(input,'atlas.json'),'utf8'));
const provenance=JSON.parse(fs.readFileSync(path.join(input,'provenance.json'),'utf8'));
const chunks=source.chunks.map(c=>fs.readFileSync(path.join(input,path.basename(c.url))));
await MeshoptSimplifier.ready;
function category(p){
  if(p.system==='skeletal')return 'skeleton';
  if(p.system==='muscular')return 'muscle';
  if(p.system==='integumentary'&&p.name==='Skin')return 'skin';
  if(p.system==='cardiac')return 'heart';
  if(p.system==='respiratory')return /bronch|trachea/i.test(p.name)?'bronchi':/lung|pulmonary|lobe|segment/i.test(p.name)?'lungs':null;
  if(p.system==='nervous'&&/gyrus|brain|cereb|hippoc|thalam|corpus|cortex|medulla|pons/i.test(p.name))return 'brain';
  if(p.system==='nervous'&&/spinal cord/i.test(p.name))return 'spinal';
  if(p.system==='digestive')return /liver|hepatic/i.test(p.name)?'liver':'digestion';
  if(p.system==='urinary'&&/kidney/i.test(p.name))return 'kidneys';
  if(p.system==='arterial'&&/aorta|common carotid|subclavian|brachiocephalic|common iliac|femoral artery|pulmonary trunk/i.test(p.name))return 'arteries';
  if(p.system==='venous'&&/vena cava|jugular|subclavian vein|common iliac vein|femoral vein/i.test(p.name))return 'veins';
  if(p.system==='sensory'&&/eyeball|sclera|cornea/i.test(p.name))return 'eyes';
  return null;
}
const buckets=new Map();let sourceTriangles=0,triangles=0,maximumError=0;
function includePart(part,group,buffer){
  const positions=new Float32Array(buffer.buffer,buffer.byteOffset+part.positions,part.vertexCount*3);
  const normals=new Int16Array(buffer.buffer,buffer.byteOffset+part.normals,part.vertexCount*3);
  const indices=new Uint32Array(buffer.buffer,buffer.byteOffset+part.indices,part.indexCount);
  const goal=Math.max(72,Math.floor(indices.length*.42/3)*3);
  const [reduced,error]=MeshoptSimplifier.simplify(indices,positions,3,Math.min(goal,indices.length),.006);
  const [remap,count]=MeshoptSimplifier.compactMesh(reduced);
  const pos=new Float32Array(count*3),normal=new Int16Array(count*3);
  for(let i=0;i<remap.length;i++){const next=remap[i];if(next===0xffffffff)continue;for(let axis=0;axis<3;axis++){pos[next*3+axis]=positions[i*3+axis];normal[next*3+axis]=normals[i*3+axis];}}
  if(!buckets.has(group))buckets.set(group,[]);
  buckets.get(group).push({part,pos,normal,indices:reduced,count});
  sourceTriangles+=indices.length/3;triangles+=reduced.length/3;maximumError=Math.max(maximumError,error);
}
for(const part of source.parts){const group=category(part);if(group)includePart(part,group,chunks[part.chunk]);}
const lungSource=JSON.parse(fs.readFileSync(path.join(input,'hra-lung.json'),'utf8'));
const lungBuffer=fs.readFileSync(path.join(input,'hra-lung.bin'));
for(const part of lungSource.parts)includePart(part,'lungs',lungBuffer);
const segments=[];let bytes=0;const append=array=>{const padding=(4-bytes%4)%4;if(padding){segments.push(Buffer.alloc(padding));bytes+=padding;}const offset=bytes,b=Buffer.from(array.buffer,array.byteOffset,array.byteLength);segments.push(b);bytes+=b.length;return offset;};
const groups=[];
for(const [id,entries] of buckets){
  const vertices=entries.reduce((n,e)=>n+e.count,0),indexCount=entries.reduce((n,e)=>n+e.indices.length,0);
  const positions=new Float32Array(vertices*3),normals=new Int16Array(vertices*3),indices=new Uint32Array(indexCount);let v=0,i=0;
  const parts=[];
  for(const e of entries){positions.set(e.pos,v*3);normals.set(e.normal,v*3);for(let n=0;n<e.indices.length;n++)indices[i+n]=e.indices[n]+v;parts.push({id:e.part.id,name:e.part.name,conceptId:e.part.conceptId,firstTriangle:i/3,triangles:e.indices.length/3});v+=e.count;i+=e.indices.length;}
  groups.push({id,positions:append(positions),normals:append(normals),indices:append(indices),vertexCount:vertices,indexCount,parts});
}
const binary=Buffer.concat(segments),compressed=gzipSync(binary,{level:9});
fs.writeFileSync(path.join(output,'anatomy.bin'),binary);
fs.writeFileSync(path.join(output,'anatomy.bin.gz'),compressed);
const markers={};
for(const [topic,pattern] of Object.entries({brain:/gyrus|cerebral hemisphere/i,heart:/ventricle|atrium/i,metabolism:/^stomach$/i,muscle:/^right rectus femoris$/i})){
 const candidates=source.parts.filter(p=>pattern.test(p.name)&&(topic!=='heart'||p.system==='cardiac')&&(topic!=='brain'||p.system==='nervous'));
 const min=[0,1,2].map(a=>Math.min(...candidates.map(p=>p.bounds[0][a]))),max=[0,1,2].map(a=>Math.max(...candidates.map(p=>p.bounds[1][a])));
 if(candidates.length)markers[topic]=min.map((n,a)=>(n+max[a])/2);
}
const manifest={version:1,source:'BodyParts3D 4.0 / Human Atlas + Human Reference Atlas lungs',sourceRepository:provenance.repository,sourceCommit:provenance.commit,lungSource:{...lungSource,parts:undefined},markers,license:'CC BY 4.0',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',binary:'/models/anatomy.bin',gzip:'/models/anatomy.bin.gz',bytes:binary.length,groups,triangles,sourceTriangles,adaptation:'Selected systems; merged render batches; additional mesh simplification at maximum 0.6% relative geometric error; display materials changed; HRA male lung tissue aligned to the reference bronchial tree. Educational composite, not an individual scan or clinical registration.'};
fs.writeFileSync(path.join(output,'anatomy.json'),JSON.stringify(manifest));
fs.copyFileSync(path.join(input,'ATTRIBUTION.md'),path.join(output,'UPSTREAM-ATTRIBUTION.md'));
console.log(JSON.stringify({groups:groups.length,parts:groups.reduce((n,g)=>n+g.parts.length,0),triangles,sourceTriangles,bytes:binary.length,gzipBytes:compressed.length,maximumError}));
