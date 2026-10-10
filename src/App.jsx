import React,{useState,useEffect} from 'react';
import Icon from './components/Icon.jsx';
import BodyViewer from './components/AnatomyViewer.jsx';
import ProfileControls from './components/ProfileControls.jsx';
import Experience from './components/Experience.jsx';
import { experimentGoals } from './lib/experiment.js';
import { dateKey } from './lib/engine.js';
import { DEFAULT_PROFILE, normalizeProfile, evaluateProfile } from './lib/engine.js';
import { loadState, saveState } from './lib/storage.js';
import { organData, sources } from './data/content.js';
import { Labs,ActionPlan,Quiz,Sources } from './components/Scenes.jsx';

const nav=[['experience','sparkles','我的改变实验','01'],['overview','orbit','数字人体','02'],['labs','flask','习惯实验室','03'],['time','clock','时间机器','04'],['parallel','fork','平行人生','05'],['plan','calendar','七日行动','06'],['quiz','help','知识挑战','07'],['sources','book','科学依据','08']];
export default function App(){
  const [saved]=useState(()=>loadState());
  const [profile,setProfile]=useState(saved?.profile||DEFAULT_PROFILE);
  const [settings,setSettings]=useState(saved?.settings||{lowPower:false,reduced:window.matchMedia('(prefers-reduced-motion: reduce)').matches});
  const [plan,setPlan]=useState(saved?.plan||null);
  const [run,setRun]=useState(saved?.run||null);
  const [view,setView]=useState('experience'),[selected,setSelected]=useState('heart'),[focus,setFocus]=useState(false),[rotate,setRotate]=useState(true),[reset,setReset]=useState(0),[menu,setMenu]=useState(false),[toast,setToast]=useState('');
  const states=evaluateProfile(profile),organ=organData[selected];
  useEffect(()=>{if(!saveState({profile,settings,plan,run}))setToast('当前浏览器无法保存数据，本次体验仍可继续。');},[profile,settings,plan,run]);
  useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(''),4500);return()=>clearTimeout(t);},[toast]);
  const navigate=id=>{if((id==='time'||id==='parallel')&&run)setRun({...run,step:2});setView(id);setMenu(false);setFocus(false);window.scrollTo({top:0,behavior:'instant'});};
  const select=id=>{setSelected(id);setFocus(true);};
  const change=p=>setProfile(normalizeProfile(p));
  return <div className={`app ${settings.reduced?'reduced-motion':''}`}>
    <aside className={`sidebar ${menu?'open':''}`}>
      <a href="#overview" className="brand" onClick={e=>{e.preventDefault();navigate('overview');}}><span className="brand-mark"><Icon name="activity" size={28}/></span><span>未来的你<small>FUTURE YOU</small></span></a>
      <div className="sidebar-caption">你的健康探索空间</div>
      <nav aria-label="主导航">{nav.map(([id,icon,label,num])=><button key={id} className={`nav-item ${view===id?'active':''}`} onClick={()=>navigate(id)} aria-current={view===id?'page':undefined}><Icon name={icon}/><span>{label}</span><small>{num}</small></button>)}</nav>
      <div className="sidebar-bottom"><div className="sidebar-note"><Icon name="sparkles"/><p>改变，从一次<br/><strong>小小的选择开始。</strong></p></div><span className="edition">青年健康科普 · 体验版 01</span></div>
    </aside>
    {menu&&<button className="menu-scrim" aria-label="关闭导航" onClick={()=>setMenu(false)}/>}
    <div className="workspace"><header className="topbar"><div className="breadcrumb"><button className="mobile-menu icon-button" aria-label="打开导航" onClick={()=>setMenu(!menu)}><Icon name="menu"/></button><span>健康探索</span><Icon name="right" size={14}/><strong>{nav.find(n=>n[0]===view)[2]}</strong></div><div className="topbar-right"><span className="local-badge"><Icon name="shield" size={15}/>数据仅存本机</span><button className={`mode-button ${settings.lowPower?'on':''}`} onClick={()=>setSettings({...settings,lowPower:!settings.lowPower})} aria-pressed={settings.lowPower}><Icon name="monitor" size={16}/><span>轻量模式</span></button></div></header>
      <main id="main-content"><div className="page-heading"><div><span className="eyebrow">MEET YOUR FUTURE SELF</span><h1>{view==='overview'?'你的每个选择，身体都在回应。':nav.find(n=>n[0]===view)[2]}</h1><p>{view==='overview'?'从今天的习惯出发，探索一个更有活力的自己。':'探索生活方式，理解身体，找到可行的下一步。'}</p></div><button className="text-button" onClick={()=>navigate('sources')}><Icon name="info" size={17}/>关于这次体验</button></div>
      {['experience','time','parallel'].includes(view)?<Experience profile={profile} onChange={change} settings={settings} run={run} setRun={setRun} hasPlan={!!plan} navigate={navigate} onAdopt={(baseline,target,habit)=>{setPlan({start:dateKey(),goals:experimentGoals(baseline,target,habit),checks:{}});navigate('plan');setToast('已将实验中选定的改变写入七日计划。');}}/>:view==='overview'?<>
        <div className="overview-grid"><section className="body-panel panel"><div className="panel-heading"><div><span className="eyebrow">YOUR DIGITAL BODY</span><h2>我的数字人体 <span className="pill">实时联动</span></h2></div><span className="subtle">真实解剖模型</span></div>
          <div className="body-stage"><div className="stage-grid"/><div className="stage-label">REFERENCE ANATOMY<span>真实解剖 · 科普情景</span></div><div className="body-coordinates">Y<br/>│<br/>└─ X</div><BodyViewer profile={profile} selected={selected} onSelect={select} lowPower={settings.lowPower} reduced={settings.reduced} focus={focus} rotate={rotate} resetKey={reset}/><div className="stage-footnote">拖动旋转 · 滚轮缩放 · 点击器官探索</div><div className="viewer-tools"><button className="icon-button" aria-label={rotate?'暂停自动旋转':'开启自动旋转'} onClick={()=>setRotate(!rotate)}><Icon name={rotate?'pause':'play'} size={17}/></button><button className="icon-button" aria-label="恢复全身视角" onClick={()=>{setFocus(false);setReset(reset+1);}}><Icon name="reset" size={17}/></button><button className={`icon-button ${focus?'on':''}`} aria-label="切换器官近景" aria-pressed={focus} onClick={()=>setFocus(!focus)}><Icon name="maximize" size={17}/></button></div></div>
          <div className="organ-tabs" aria-label="选择器官">{Object.entries(organData).map(([id,d])=><button className={selected===id?'active':''} key={id} onClick={()=>select(id)} aria-pressed={selected===id}><Icon name={d.icon} size={17}/>{d.name}</button>)}</div>
        </section><section className="parameter-panel panel"><div className="panel-heading"><div><span className="eyebrow">TODAY'S HABITS</span><h2>今天的生活画像</h2></div><Icon name="sliders" size={20}/></div><p className="panel-intro">调整习惯，看看身体里的故事。</p><ProfileControls profile={profile} onChange={change}/><div className="privacy-note"><Icon name="shield" size={16}/><span>无需姓名和病史，可随时修改。</span></div></section></div>
        <div className="insights-grid"><section className="organ-insight panel"><div className={`organ-icon ${states[organ.input].attention?'amber':''}`}><Icon name={organ.icon} size={26}/></div><div className="insight-content"><span className="eyebrow">{organ.en} / {organ.topic}</span><h3>{states[organ.input].label}</h3><p>{organ.description}</p><a href={sources[organ.source].url} target="_blank" rel="noreferrer" className="source-link">{sources[organ.source].name}<Icon name="external" size={13}/></a></div></section><button className="journey-card" onClick={()=>navigate('parallel')}><div className="journey-top"><span className="eyebrow">TWO CHOICES. TWO STORIES.</span><Icon name="fork" size={24}/></div><h3>如果，换一种生活？</h3><p>保持原习惯，或从小改变开始。<br/>在平行人生里，看看两种选择。</p><span className="journey-cta">进入平行人生 <Icon name="right" size={17}/></span><span className="journey-orbit"/></button></div>
        <div className="habit-summary">{Object.entries(states).map(([id,s])=><div key={id}><span className={`status-line ${s.attention?'amber':''}`}/><span>{id==='sleep'?'睡眠与恢复':id==='activity'?'心肺与活动':id==='diet'?'饮食与营养':'久坐与活动'}</span><strong>{s.label}</strong></div>)}</div>
      </>:view==='labs'?<Labs profile={profile} onChange={change} settings={settings}/>:view==='plan'?<ActionPlan profile={profile} plan={plan} setPlan={setPlan} notify={setToast}/>:view==='quiz'?<Quiz navigate={navigate}/>:<Sources onClear={()=>{setProfile(DEFAULT_PROFILE);setPlan(null);setRun(null);setSettings({lowPower:false,reduced:window.matchMedia('(prefers-reduced-motion: reduce)').matches});setToast('本机体验数据已清除，已恢复默认画像。');}}/>}
      <footer className="footer"><span><Icon name="info" size={14}/>科普情景模拟，颜色不代表器官损伤，不提供诊断或个人风险预测。</span><button onClick={()=>setSettings({...settings,reduced:!settings.reduced})} aria-pressed={settings.reduced}>{settings.reduced?'已减少动画':'减少动画'}</button></footer></main>
    </div>{toast&&<div role="status" className="toast"><Icon name="info" size={18}/>{toast}<button aria-label="关闭提示" onClick={()=>setToast('')}><Icon name="x" size={16}/></button></div>}
  </div>;
}

