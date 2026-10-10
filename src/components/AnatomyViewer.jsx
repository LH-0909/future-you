import React,{useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { organData } from '../data/content.js';
import { evaluateProfile } from '../lib/engine.js';
import { loadAnatomy,makeAnatomy,styleAnatomy } from '../lib/anatomy.js';

const modes=[['cutaway','解剖透视'],['organs','内脏'],['muscle','肌肉'],['skeleton','骨骼'],['surface','体表']];
function FlatBody({selected,onSelect,failed,onRetry}){
  return <div className="flat-body real-flat"><img src="/models/anatomy-preview.png" alt="BodyParts3D 真实人体解剖参考模型的静态视图"/>{Object.entries(organData).map(([id,d])=><button key={id} className={`flat-hotspot ${id} ${selected===id?'selected':''}`} onClick={()=>onSelect?.(id)}>{d.name}</button>)}<span className="flat-caption">{failed?'三维视图暂不可用 · 静态参考视图':'真实模型 · 轻量参考视图'}</span>{failed&&<button className="retry-model" onClick={onRetry}>重新加载三维模型</button>}</div>;
}
export default function AnatomyViewer({profile,selected='heart',onSelect,lowPower=false,reduced=false,focus=false,compact=false,rotate=true,resetKey=0,related=[],experimentHabit=null}){
  const host=useRef(null),labels=useRef({}),live=useRef();
  const [mode,setMode]=useState('cutaway'),[status,setStatus]=useState('loading'),[retry,setRetry]=useState(0),[structure,setStructure]=useState('');
  live.current={profile,selected,onSelect,reduced,focus,rotate,resetKey,mode,related,experimentHabit};
  useEffect(()=>{
    if(lowPower)return;
    const el=host.current;let renderer,canvas,controls,observer,frame,anatomy,disposed=false;const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(39,1,.1,60),raycaster=new THREE.Raycaster();camera.position.set(0,0,8.3);
    let press={x:0,y:0};
    const down=e=>{press={x:e.clientX,y:e.clientY};};
    const up=e=>{
      if(!anatomy||Math.hypot(e.clientX-press.x,e.clientY-press.y)>6)return;
      const r=canvas.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);
      const pick=Object.values(anatomy.groups).map(g=>g.mesh).filter(m=>m.visible&&m.material.opacity>.13&&m.userData.organ);
      const hits=raycaster.intersectObjects(pick,false).filter(hit=>!hit.object.material.clippingPlanes.length||hit.point.x>=0);
      const hit=hits[0];if(hit){live.current.onSelect?.(hit.object.userData.organ);const part=hit.object.userData.sourceParts.find(p=>hit.faceIndex>=p.firstTriangle&&hit.faceIndex<p.firstTriangle+p.triangles);setStructure(part?.name||'');}
    };
    const lost=e=>{e.preventDefault();cleanup();setStatus('failed');};
    const cleanup=()=>{
      disposed=true;cancelAnimationFrame(frame);observer?.disconnect();controls?.dispose();
      canvas?.removeEventListener('pointerdown',down);canvas?.removeEventListener('pointerup',up);canvas?.removeEventListener('webglcontextlost',lost);
      scene.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();});renderer?.dispose();canvas?.remove();
    };
    (async()=>{
      try{
        setStatus('loading');
        renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));renderer.setClearColor(0x000000,0);renderer.localClippingEnabled=true;
        renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
        canvas=renderer.domElement;el.prepend(canvas);
        scene.add(new THREE.AmbientLight('#e7eef1',1.35));
        const key=new THREE.DirectionalLight('#fff0df',3.1);key.position.set(2,5,7);scene.add(key);
        const fill=new THREE.DirectionalLight('#b7d9ee',1.6);fill.position.set(-4,2,3);scene.add(fill);
        const rim=new THREE.DirectionalLight('#a0bdcf',1.5);rim.position.set(3,4,-4);scene.add(rim);
        controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.075;controls.enablePan=false;controls.minDistance=2.7;controls.maxDistance=11;controls.autoRotateSpeed=.33;controls.minPolarAngle=Math.PI*.28;controls.maxPolarAngle=Math.PI*.72;
        canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointerup',up);canvas.addEventListener('webglcontextlost',lost);
        const resize=()=>{const w=el.clientWidth,h=el.clientHeight;renderer.setSize(w,h);camera.aspect=w/Math.max(h,1);camera.updateProjectionMatrix();};observer=new ResizeObserver(resize);observer.observe(el);resize();
        const data=await loadAnatomy();if(disposed)return;
        anatomy=makeAnatomy(data);scene.add(anatomy.body,anatomy.ring);setStatus('ready');el.dataset.modelReady='true';el.dataset.parts=String(anatomy.parts);
        let lastStyle='',lastCamera='',lastRender=0,target=null,distance=8.3,lastReset=resetKey;
        const animate=()=>{
          if(disposed)return;frame=requestAnimationFrame(animate);const now=performance.now();if(now-lastRender<32)return;lastRender=now;
          const props=live.current,styleKey=JSON.stringify([props.profile,props.mode,props.selected,props.focus,props.related,props.experimentHabit]);
          if(props.resetKey!==lastReset){lastReset=props.resetKey;camera.position.set(0,0,8.3);controls.target.set(0,0,0);}
          if(styleKey!==lastStyle){styleAnatomy(anatomy,props.mode,props.selected,props.focus,evaluateProfile(props.profile),props.related,props.experimentHabit);lastStyle=styleKey;}
          const cameraKey=JSON.stringify([props.selected,props.focus,props.resetKey]);
          if(cameraKey!==lastCamera){lastCamera=cameraKey;target=props.focus?anatomy.positions[props.selected].clone():new THREE.Vector3(0,0,0);distance=props.focus?props.selected==='muscle'?5.2:3.6:8.3;}
          if(target){controls.target.lerp(target,props.reduced?1:.065);const dir=camera.position.clone().sub(controls.target).normalize();camera.position.lerp(controls.target.clone().addScaledVector(dir,distance),props.reduced?1:.07);if(controls.target.distanceTo(target)<.002&&Math.abs(camera.position.distanceTo(target)-distance)<.02)target=null;}
          controls.autoRotate=props.rotate&&!props.reduced&&!props.focus;
          controls.update();
          for(const [id,position] of Object.entries(anatomy.positions)){
            const label=labels.current[id];if(!label)continue;
            const v=position.clone().project(camera);label.style.left=`${(v.x*.5+.5)*el.clientWidth}px`;label.style.top=`${(-v.y*.5+.5)*el.clientHeight}px`;
            label.style.visibility=v.z<1&&Math.abs(v.x)<.93&&Math.abs(v.y)<.92?'visible':'hidden';
          }
          renderer.render(scene,camera);
        };animate();
      }catch(e){if(!disposed){console.warn('Reference anatomy unavailable:',e.message);cleanup();setStatus('failed');}}
    })();return cleanup;
  },[lowPower,retry]);
  if(lowPower||status==='failed')return <FlatBody selected={selected} onSelect={onSelect} failed={!lowPower} onRetry={()=>{setStatus('loading');setRetry(retry+1);}}/>;
  return <div className={`body-viewer real-anatomy ${compact?'compact':''}`} ref={host} aria-label="BodyParts3D 真实解剖参考模型，可旋转、缩放、切换解剖层并点击结构">
    <div className="anatomy-layer-picker" aria-label="人体图层">{modes.map(([id,name])=><button key={id} className={mode===id?'active':''} onClick={()=>setMode(id)} aria-pressed={mode===id}>{name}</button>)}</div>
    {status==='loading'&&<div className="model-loading" role="status"><span/><strong>正在加载真实解剖模型</strong><p>首次加载约 12 MB，后续场景共用模型数据。</p></div>}
    {status==='ready'&&Object.entries(organData).map(([id,d])=><button key={id} ref={e=>{labels.current[id]=e;}} className={`organ-label ${id===selected?'active':''} ${evaluateProfile(profile)[related.includes(id)&&experimentHabit?experimentHabit:d.input].attention?'attention':''}`} onClick={()=>{onSelect?.(id);setStructure('');}} aria-label={`查看${d.name}科普`}><span className="organ-marker"/><span className="organ-label-text">{d.name}</span></button>)}
    {structure&&<div className="structure-name">选中结构 · {structure}</div>}
    <span className="model-credit">BodyParts3D + HRA · CC BY 4.0</span>
  </div>;
}
