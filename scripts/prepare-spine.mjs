import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=JSON.parse(fs.readFileSync(path.join(root,'.asset-source/atlas.json'),'utf8'));
const ids=['FJ3157','FJ3159','FJ3162','FJ3165','FJ3168','FJ3212','FJ3214','FJ3215','FJ3216','FJ3217','FJ3393','FJ3152','FJ3288'];
const labels=['L1 第一腰椎','L2 第二腰椎','L3 第三腰椎','L4 第四腰椎','L5 第五腰椎','L1 下方椎间盘','L2 下方椎间盘','L3 下方椎间盘','L4 下方椎间盘','L5 下方椎间盘','骶骨','右髋骨','左髋骨'];
const buffers=new Map(),segments=[];let bytes=0;
const append=b=>{const padding=(4-bytes%4)%4;if(padding){segments.push(Buffer.alloc(padding));bytes+=padding;}const offset=bytes;segments.push(b);bytes+=b.length;return offset;};
const parts=ids.map((id,i)=>{const p=source.parts.find(p=>p.id===id);if(!p)throw Error('Missing '+id);if(!buffers.has(p.chunk))buffers.set(p.chunk,fs.readFileSync(path.join(root,'.asset-source',path.basename(source.chunks[p.chunk].url))));const b=buffers.get(p.chunk);return {id,name:p.name,label:labels[i],conceptId:p.conceptId,category:i<5?'vertebra':i<10?'disc':'pelvis',bounds:p.bounds,vertexCount:p.vertexCount,indexCount:p.indexCount,positions:append(b.subarray(p.positions,p.positions+p.vertexCount*12)),normals:append(b.subarray(p.normals,p.normals+p.vertexCount*6)),indices:append(b.subarray(p.indices,p.indices+p.indexCount*4))};});
const binary=Buffer.concat(segments);const out=path.join(root,'public/models');
fs.writeFileSync(path.join(out,'spine.bin'),binary);
fs.writeFileSync(path.join(out,'spine.json'),JSON.stringify({version:1,binary:'/models/spine.bin',bytes:binary.length,source:'BodyParts3D 4.0 via Human Atlas',license:'CC BY 4.0',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',adaptation:'Original prepared source meshes extracted without additional simplification. Exploded viewing translates parts only; not a motion or biomechanical model.',parts}));
for(const p of parts){const indices=new Uint32Array(binary.buffer,binary.byteOffset+p.indices,p.indexCount);if([...indices].some(i=>i>=p.vertexCount))throw Error('Out of range '+p.id);const pos=new Float32Array(binary.buffer,binary.byteOffset+p.positions,p.vertexCount*3);if([...pos].some(v=>!Number.isFinite(v)))throw Error('Invalid position '+p.id);}
console.log(JSON.stringify({parts:parts.length,vertices:parts.reduce((n,p)=>n+p.vertexCount,0),triangles:parts.reduce((n,p)=>n+p.indexCount/3,0),bytes:binary.length}));
