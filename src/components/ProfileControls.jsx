import React from 'react';
import Icon from './Icon.jsx';
import { dietOptions } from '../data/content.js';
import { DEMO_PROFILES } from '../lib/engine.js';
const fields={sleep:{title:'每晚睡眠',icon:'moon',unit:'小时',min:4,max:9,step:.5,hint:'一般建议至少 7 小时'},activity:{title:'每周中等强度活动',icon:'activity',unit:'分钟',min:0,max:420,step:10,hint:'一般建议 150–300 分钟 / 周'},sitting:{title:'每日久坐',icon:'chair',unit:'小时',min:0,max:14,step:.5,hint:'尝试用活动替代部分久坐'}};
export default function ProfileControls({profile,onChange,only=null,showDemos=true}){
  const update=(key,value)=>onChange({...profile,[key]:value});
  return <div className="profile-controls">
    {showDemos&&<div className="demo-picker"><span>快速体验</span><button onClick={()=>onChange(DEMO_PROFILES.student)}>忙碌学生</button><button onClick={()=>onChange(DEMO_PROFILES.active)}>活力日常</button></div>}
    {Object.entries(fields).filter(([id])=>!only||id===only).map(([id,f])=><div className="input-block" key={id}>
      <div className="input-heading"><label htmlFor={`range-${id}`}><Icon name={f.icon} size={17}/>{f.title}</label><span><strong>{profile[id]}</strong> {f.unit}</span></div>
      <input id={`range-${id}`} type="range" min={f.min} max={f.max} step={f.step} value={profile[id]} onChange={e=>update(id,Number(e.target.value))} style={{'--range':`${(profile[id]-f.min)/(f.max-f.min)*100}%`}}/>
      <div className="range-extents"><span>{f.min} {f.unit}</span><span>{f.max} {f.unit}</span></div><p className="input-hint">{f.hint}</p>
    </div>)}
    {(!only||only==='diet')&&<div className="input-block"><div className="input-heading"><label htmlFor="diet-choice"><Icon name="leaf" size={17}/>饮食习惯</label></div><select id="diet-choice" value={profile.diet} onChange={e=>update('diet',e.target.value)}>{dietOptions.map(d=><option key={d.value} value={d.value}>{d.label}</option>)}</select><p className="input-hint">选择最接近你的日常场景</p></div>}
    {(!only||only==='sitting')&&<label className="switch-row"><span>久坐时安排活动间歇</span><input type="checkbox" checked={profile.breaks} onChange={e=>update('breaks',e.target.checked)}/><span className="switch" aria-hidden="true"/></label>}
  </div>;
}
