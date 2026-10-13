import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const manifest=JSON.parse(fs.readFileSync(new URL('../public/models/spine.json',import.meta.url),'utf8'));
const b=fs.readFileSync(new URL('../public/models/spine.bin',import.meta.url));
test('real lumbar model contains five vertebrae, five disks and three pelvic structures',()=>{
 assert.equal(manifest.parts.filter(p=>p.category==='vertebra').length,5);
 assert.equal(manifest.parts.filter(p=>p.category==='disc').length,5);
 assert.equal(manifest.parts.filter(p=>p.category==='pelvis').length,3);
 assert.equal(new Set(manifest.parts.map(p=>p.id)).size,13);
 assert.equal(b.length,manifest.bytes);
 assert.equal(manifest.license,'CC BY 4.0');
});
test('every real source part has valid typed buffers, geometry and identifier',()=>{
 for(const p of manifest.parts){
  assert.match(p.conceptId,/^FMA\d+$/);
  for(const [key,size] of [['positions',p.vertexCount*12],['normals',p.vertexCount*6],['indices',p.indexCount*4]]){assert.equal(p[key]%4,0);assert.ok(p[key]+size<=b.length);}
  const pos=new Float32Array(b.buffer,b.byteOffset+p.positions,p.vertexCount*3);
  assert.ok([...pos].every(Number.isFinite));
  const idx=new Uint32Array(b.buffer,b.byteOffset+p.indices,p.indexCount);
  assert.ok([...idx].every(i=>i<p.vertexCount));assert.equal(idx.length%3,0);
 }
});
