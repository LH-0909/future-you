import * as THREE from 'three';
let cached;
export function loadAnatomy(){
  if(!cached)cached=(async()=>{
    const res=await fetch('/models/anatomy.json');if(!res.ok)throw new Error('Anatomy manifest failed');
    const manifest=await res.json();
    const response=await fetch(manifest.gzip);if(!response.ok)throw new Error('Anatomy geometry failed');
    let buffer=await response.arrayBuffer();
    const signature=new Uint8Array(buffer,0,Math.min(buffer.byteLength,2));
    // Some static servers send Content-Encoding:gzip and Fetch decompresses
    // automatically. Other hosts serve a gzip file as ordinary binary data.
    if(signature[0]===31&&signature[1]===139){
      if(typeof DecompressionStream!=='undefined')buffer=await new Response(new Blob([buffer]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
      else{const fallback=await fetch(manifest.binary);if(!fallback.ok)throw new Error('Anatomy geometry failed');buffer=await fallback.arrayBuffer();}
    }
    if(buffer.byteLength!==manifest.bytes)throw new Error('Anatomy geometry incomplete');
    return {manifest,buffer};
  })().catch(e=>{cached=undefined;throw e;});
  return cached;
}
const colors={skin:'#c9a48b',skeleton:'#d5c7ad',muscle:'#9f564e',brain:'#d5bab0',spinal:'#e0cda7',heart:'#a44145',lungs:'#c78e93',bronchi:'#d5c5b1',liver:'#8c5146',digestion:'#cf9d80',kidneys:'#a86050',arteries:'#a24845',veins:'#66899c',eyes:'#e0ded3'};
const topics={brain:'brain',spinal:'brain',heart:'heart',lungs:'lungs',bronchi:'lungs',liver:'metabolism',digestion:'metabolism',kidneys:'metabolism',muscle:'muscle',skeleton:'muscle',arteries:'heart',veins:'heart'};
export function makeAnatomy({manifest,buffer}){
  const body=new THREE.Group(),groups={},positions={};
  for(const d of manifest.groups){
    const geometry=new THREE.BufferGeometry();
    // Data buffers are shared and immutable; every scene owns its GPU geometry.
    geometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(buffer,d.positions,d.vertexCount*3),3));
    geometry.setAttribute('normal',new THREE.BufferAttribute(new Int16Array(buffer,d.normals,d.vertexCount*3),3,true));
    geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(buffer,d.indices,d.indexCount),1));
    geometry.computeBoundingBox();geometry.computeBoundingSphere();
    const material=new THREE.MeshStandardMaterial({color:colors[d.id],roughness:.62,metalness:.02,side:THREE.DoubleSide});
    const mesh=new THREE.Mesh(geometry,material);mesh.name=d.id;mesh.userData.organ=topics[d.id];mesh.userData.sourceParts=d.parts;body.add(mesh);
    groups[d.id]={mesh,material,base:new THREE.Color(colors[d.id]),box:geometry.boundingBox.clone()};
  }
  const reference=groups.skin.box,center=reference.getCenter(new THREE.Vector3()),height=reference.max.y-reference.min.y;
  const scale=5.05/height;body.scale.setScalar(scale);body.position.set(-center.x*scale,-center.y*scale,-center.z*scale);body.updateMatrixWorld(true);
  for(const [topic,id] of Object.entries({brain:'brain',heart:'heart',lungs:'lungs',metabolism:'digestion',muscle:'muscle'})){
    const v=manifest.markers?.[topic] ? new THREE.Vector3(...manifest.markers[topic]) : groups[id].box.getCenter(new THREE.Vector3());body.localToWorld(v);positions[topic]=v;
  }
  const ringPoints=Array.from({length:81},(_,i)=>new THREE.Vector3(Math.cos(i/80*Math.PI*2)*.85,-2.64,Math.sin(i/80*Math.PI*2)*.85));
  const ring=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(ringPoints),new THREE.LineBasicMaterial({color:'#678ea0',transparent:true,opacity:.45}));
  return {body,groups,positions,ring,parts:manifest.groups.reduce((n,g)=>n+g.parts.length,0)};
}
export function styleAnatomy(anatomy,mode,selected,focused,states,related=[],experimentHabit=null){
  const half=new THREE.Plane(new THREE.Vector3(1,0,0),0);
  for(const [id,item] of Object.entries(anatomy.groups)){
    let opacity=1,visible=true,clip=false;
    if(mode==='cutaway'){
      if(id==='skin')opacity=.045;
      if(id==='muscle'){opacity=.96;clip=true;}
      if(id==='skeleton')opacity=.76;
      if(id==='veins'||id==='arteries')opacity=.7;
      if(id==='spinal')opacity=.7;
    }else if(mode==='organs'){
      if(id==='skin')opacity=.035;
      if(id==='muscle')visible=false;
      if(id==='skeleton')opacity=.09;
      if(id==='veins'||id==='arteries')opacity=.5;
    }else if(mode==='muscle'){
      visible=['muscle','eyes','skeleton'].includes(id);
      if(id==='skeleton')opacity=.24;
    }else if(mode==='skeleton')visible=id==='skeleton';
    else if(mode==='surface')visible=['skin','eyes'].includes(id);
    if(focused&&['skin','muscle','skeleton'].includes(id)&&selected!=='muscle')opacity=Math.min(opacity,.06);
    const topic=item.mesh.userData.organ,active=topic===selected&&id!=='skeleton';
    item.material.color.copy(item.base);
    // Anatomy keeps realistic tissue colors. Habit feedback is shown as a restrained highlight.
    if(active&&id!=='muscle')item.material.color.lerp(new THREE.Color(states[topic==='brain'?'sleep':topic==='heart'||topic==='lungs'?'activity':topic==='metabolism'?'diet':'sitting'].attention?'#e1b66e':'#91d8c3'),.16);
    if(related.includes(topic)&&experimentHabit&&id!=='muscle')item.material.color.lerp(new THREE.Color(states[experimentHabit].attention?'#e1b66e':'#91d8c3'),.22);
    item.material.emissive.set(active?'#1d2726':related.includes(topic)?'#123d39':'#000000');item.material.emissiveIntensity=active ? .22 : .32;
    item.material.transparent=opacity<1;item.material.opacity=opacity;item.material.depthWrite=opacity>.5;
    item.material.clippingPlanes=clip?[half]:[];item.material.needsUpdate=true;
    item.mesh.visible=visible;item.mesh.renderOrder=opacity<.1?3:opacity<.6?2:0;
  }
}
