import React, { Suspense, lazy, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowRight, Bell, BookOpen, Check, ChevronRight, Clock3, Download, Info, Lightbulb, Maximize2, Minimize2, Pause, Play, RotateCcw, Settings2, X, ZoomIn, ZoomOut } from 'lucide-react';
import './reference-experience.css';
import {assetUrl} from '../lib/asset-url.js';

const TeachingBody = lazy(() => import('./TeachingBody.jsx'));
const RealSpineViewer = lazy(() => import('./RealSpineViewer.jsx'));
const WIDTH = 1672, HEIGHT = 941;
const asset = name => assetUrl(`/reference-assets/${name}.webp`);
const moduleNames = ['认识人体', '拆解脊柱', '比较姿势', '活动间歇', '教学挑战', '缓解与行动计划'];
const partNames = { muscle: '腰背肌群', pelvis: '骨盆', disc: '椎间盘', vertebra: '椎体', ligament: '韧带', nerve: '神经根', skin: '皮肤', bone: '骨骼' };
const parts = {
  muscle: { title: '腰背肌群', subtitle: '支撑躯干 · 稳定脊柱 · 协同运动', text: '腰背肌群包括竖脊肌、多裂肌、腰方肌等深浅层肌肉，它们共同维持脊柱的稳定，帮助我们保持正确的姿势，并在弯腰、转身和提物时提供力量与控制。', image: 'lumbar-detail' },
  pelvis: { title: '骨盆', subtitle: '连接躯干与下肢 · 承受与传递力量', text: '骨盆由髋骨、骶骨和尾骨组成，是人体的力学中枢。它上接脊柱，下连双下肢，既承受来自上半身的重量，又将力量传递至下肢，同时保护内部的盆腔脏器。', image: 'pelvis-detail' },
  disc: { title: '椎间盘', subtitle: '缓冲冲击 · 保持灵活 · 维持间隙', text: '椎间盘位于相邻椎体之间，由外层的纤维环和内部的髓核组成，像一个“弹簧垫”，能够吸收日常活动中的冲击力，缓冲压力，并保持脊柱的灵活性和稳定性。', image: 'disc-detail' },
  vertebra: { title: '椎体', subtitle: '组成脊柱 · 连接支撑', text: '椎体是脊柱的主要骨性结构。相邻椎体与椎间盘、韧带和肌群共同参与身体支撑。旋转模型，观察它们之间的连接位置。', image: 'piece-vertebra' },
  ligament: { title: '韧带', subtitle: '连接椎骨 · 帮助稳定', text: '韧带连接相邻的骨性结构，参与脊柱的稳定，并限制过度运动。它与肌群协同，帮助身体维持姿态。', image: 'piece-ligament' },
  nerve: { title: '神经根', subtitle: '传递信息 · 连接身体', text: '神经根从脊柱附近向外走行，传递感觉和运动信息。观察它与椎体、椎间盘之间的空间关系。', image: 'piece-nerve' },
  skin: { title: '皮肤', subtitle: '保护身体 · 感知环境', text: '皮肤覆盖身体表面。通过分层观察，可以认识皮肤下方的肌肉、骨骼和神经结构。', image: 'view-front' },
  bone: { title: '骨骼', subtitle: '身体框架 · 支撑运动', text: '骨骼组成身体的支撑框架，并与肌肉和关节共同完成运动。点击模型，可继续观察腰背和骨盆的结构。', image: 'view-bone' },
};
const movements = [
  { id: 'walk', title: '起身行走', intro: '简单的步行活动可以让下肢肌肉收缩，促进血液循环，同时放松腰背部肌肉，提高身体活力。', points: ['放松肩膀，自然摆臂', '抬胸收腹，保持正直', '步伐自然，速度适中', '持续 2–5 分钟，感受身体放松'], image: 'walking-person' },
  { id: 'stretch', title: '腰部伸展', intro: '缓缓舒展腰背，在舒适的范围内改变身体姿势，保持自然呼吸。', points: ['双脚站稳，自然呼吸', '缓慢伸展，保持舒适', '放松腰背，不追求幅度', '按自己的节奏完成动作'], image: 'exercise-side' },
  { id: 'rotate', title: '胸椎旋转', intro: '活动胸椎，改善含胸驼背，增加脊柱灵活性。', points: ['坐稳或站稳，保持自然', '上身缓慢向一侧转动', '骨盆保持稳定', '左右交替，舒适为宜'], image: 'exercise-twist' },
  { id: 'shoulder', title: '肩颈活动', intro: '放松肩颈肌群，缓解颈部酸痛。', points: ['肩膀自然下沉', '缓慢侧屈颈部', '保持自然呼吸', '左右交替，轻柔活动'], image: 'exercise-neck' },
];
const exercises = [
  { id: 'neck', title: '颈部侧拉伸', time: '20–30 秒', desc: '缓解颈部紧张，放松斜方肌。', instructions: ['自然站立，放松双肩。', '头部缓慢向一侧倾斜，在舒适范围内保持。', '自然呼吸，然后换另一侧。'] },
  { id: 'shoulder', title: '肩膀后展', time: '20–30 秒', desc: '打开肩部，改善含胸圆肩。', instructions: ['自然站立，双手放在身后。', '轻轻展开肩膀，保持胸廓自然。', '放松后重复，不追求过大的幅度。'] },
  { id: 'side', title: '侧腰伸展', time: '20–30 秒', desc: '拉伸侧腰肌群，放松腰背。', instructions: ['双脚平稳站立，双手向上伸展。', '上身缓慢向一侧倾斜。', '保持自然呼吸，再换另一侧。'] },
  { id: 'squat', title: '下蹲激活', time: '10–15 次', desc: '激活臀腿肌群，促进下肢血液循环。', instructions: ['双脚与肩同宽，保持站稳。', '髋部向后，缓慢下蹲到舒适位置。', '平稳站起，按自己的节奏重复。'] },
  { id: 'twist', title: '坐姿转体', time: '20–30 秒', desc: '放松腰背，缓解久坐僵硬。', instructions: ['在椅子上坐稳，双脚踩地。', '上身缓慢向一侧转动。', '返回中间，再换另一侧。'] },
];
const scenarios = [
  { title: '一段 45 分钟学习后，哪种安排更容易转化为行动？', intro: '你刚完成一段 45 分钟的线上课程，感到有些疲劳。下面四种安排中，哪一种更容易真正做起来，并有效缓解久坐带来的身体负担？', answers: [
    ['再坐 30 分钟，先把作业做完', '虽然高效，但会进一步增加久坐时间，肌肉更紧张。'],
    ['刷 20 分钟手机，放松一下', '短期轻松，但仍是久坐，颈肩与腰部负担持续。'],
    ['起身活动 5 分钟，做简单的拉伸或走动', '更容易坚持，能促进血液循环，缓解肌肉疲劳。'],
    ['立即开始下一段 45 分钟的学习', '连续久坐会增加腰背压力，不利于长期健康。'],
  ], correct: 2, explanation: '短时的起身活动是将知识转化为行动的关键一步。把一个简单的动作放在学习单元之间，更容易成为日常习惯。' },
  { title: '使用电脑时，哪种调整能帮助你保持更舒适的坐姿？', intro: '下一节课需要继续使用电脑。请结合刚学到的结构知识，选择一个可以立即落实的调整。', answers: [
    ['把屏幕抬到舒适的视线高度', '双脚有支撑，腰背自然，减少持续低头。'],
    ['一直保持身体前倾', '同一个姿势持续太久，会减少活动机会。'],
    ['把电脑放得更低', '容易让头颈持续向前、向下。'],
    ['只要坐得直，就不需要活动', '坐姿调整和规律的活动间歇可以一起安排。'],
  ], correct: 0, explanation: '先让桌椅、屏幕和身体的位置更舒适，同时保留规律起身的机会。' },
  { title: '怎样让活动间歇成为可执行的学习习惯？', intro: '你已经认识了身体结构，也体验了活动间歇。请选择一个适合带入明天学习安排的小行动。', answers: [
    ['等到很累了再考虑活动', '临时想到的安排，容易被新的学习任务打断。'],
    ['设一个提醒，课间做 2–5 分钟喜欢的动作', '从简单、明确、能做到的行动开始。'],
    ['一次完成所有拉伸，之后一直坐着', '分散安排活动，可以增加日常的姿势变化。'],
    ['把计划写得越复杂越好', '清楚、容易开始的计划更便于日常执行。'],
  ], correct: 1, explanation: '选一个你喜欢、场地允许的动作，放在固定的学习间隙，逐步形成自己的节奏。' },
];
function readPlan() {
  try {
    const p = JSON.parse(localStorage.getItem('future-you:reference-plan'));
    if (!p || ![25, 30, 45, 50, 90].includes(p.study) || ![2, 3, 5, 10].includes(p.break)) return null;
    return { study: p.study, break: p.break, movement: movements.some(m => m.id === p.movement) ? p.movement : 'walk', custom: p.custom === true, actions: Array.isArray(p.actions) ? p.actions.filter(a => ['reminder', 'movement', 'posture', 'water', 'sleep'].includes(a)) : [] };
  } catch { return null; }
}
function currentPage() { const n = Number(location.hash.replace('#', '')); return n >= 1 && n <= 6 ? n : 1; }
function Hotspot({ x, y, w, h, label, onClick, selected, className = '', children, ...rest }) {
  return <button type="button" className={`ref-hotspot ${className}`} style={{ left: x, top: y, width: w, height: h }} aria-label={label} aria-pressed={selected} onClick={onClick} {...rest}>{children || label}</button>;
}
function Button({ children, onClick, className = '', ...rest }) { return <button type="button" className={`ref-button ${className}`} onClick={onClick} {...rest}>{children}</button>; }
function Dialog({ title, subtitle, children, onClose, wide = false }) {
  const dialog = useRef(null), close = useRef(null);
  useEffect(() => {
    const previous = document.activeElement; close.current?.focus();
    const onKey = e => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const nodes = [...dialog.current.querySelectorAll('button, input, select, a[href], [tabindex="0"]')].filter(n => !n.disabled);
        const first = nodes[0], last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = overflow; previous?.focus(); };
  }, [onClose]);
  return <div className="ref-dialog-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}><section ref={dialog} className={`ref-dialog ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-labelledby="ref-dialog-title"><header><div><h2 id="ref-dialog-title">{title}</h2>{subtitle && <p>{subtitle}</p>}</div><button ref={close} className="ref-close" aria-label="关闭窗口" onClick={onClose}><X size={23} /></button></header><div className="ref-dialog-content">{children}</div></section></div>;
}
function SelectRow({ values, selected, onChange, suffix = '分钟', captions = [] }) { return <div className="ref-select-row">{values.map((v, i) => <button type="button" key={v} className={selected === v ? 'selected' : ''} onClick={() => onChange(v)} aria-pressed={selected === v}><strong>{v} {suffix}</strong>{captions[i] && <small>{captions[i]}</small>}</button>)}</div>; }

export default function ReferenceExperience() {
  const [page, setPage] = useState(currentPage);
  const [viewportSize, setViewportSize] = useState(() => ({ width: window.innerWidth, height: window.innerHeight }));
  const [zoom, setZoom] = useState(1), [fullscreen, setFullscreen] = useState(false);
  const root = useRef(null), viewport = useRef(null), zoomAnchor = useRef(null), displayState = useRef(null);
  const fitScale = Math.min(viewportSize.width / WIDTH, viewportSize.height / HEIGHT);
  const maxZoom = Math.max(4, 1 / fitScale);
  const scale = fitScale * zoom;
  const stageWidth = Math.max(viewportSize.width, WIDTH * scale), stageHeight = Math.max(viewportSize.height, HEIGHT * scale);
  displayState.current = { zoom, scale, fitScale, maxZoom, stageWidth, stageHeight, viewportSize };
  const [modal, setModal] = useState(null), [toast, setToast] = useState('');
  const [layer, setLayer] = useState('muscle'), [view, setView] = useState('back');
  const [structure, setStructure] = useState('vertebra'), [structureTab, setStructureTab] = useState(0), [structureEdited, setStructureEdited] = useState(false), [detailPart, setDetailPart] = useState('disc');
  const [placed, setPlaced] = useState(['vertebra', 'disc', 'ligament']), [piece, setPiece] = useState(null), [assemblyEdited, setAssemblyEdited] = useState(false);
  const [pose, setPose] = useState('forward'), [minute, setMinute] = useState(60), [timelineEdited, setTimelineEdited] = useState(false), [playing, setPlaying] = useState(false);
  const [study, setStudy] = useState(25), [breakMinutes, setBreakMinutes] = useState(2), [movement, setMovement] = useState('walk'), [activityEdited, setActivityEdited] = useState(false), [remaining, setRemaining] = useState(120), [running, setRunning] = useState(false), [timerEdited, setTimerEdited] = useState(false);
  const [scenario, setScenario] = useState(0), [answer, setAnswer] = useState(2), [submitted, setSubmitted] = useState(true), [quizEdited, setQuizEdited] = useState(false), [anatomyAnswer, setAnatomyAnswer] = useState('erector');
  const [plan, setPlan] = useState(() => readPlan() || { study: 45, break: 5, actions: [], movement: 'walk', custom: false });
  const [draft, setDraft] = useState(plan), [nickname, setNickname] = useState('同学'), [search, setSearch] = useState('');
  const close = useCallback(() => { setModal(null); setLayer('muscle'); setView('back'); }, []);
  const notify = useCallback(message => setToast(message), []);
  const navigate = useCallback(n => { location.hash = String(n).padStart(2, '0'); setPage(n); setModal(null); setPlaying(false); viewport.current?.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }, []);
  useEffect(() => { const listener = () => { setPage(currentPage()); setModal(null); setPlaying(false); }; addEventListener('hashchange', listener); return () => removeEventListener('hashchange', listener); }, []);
  useEffect(() => {
    const el = viewport.current;
    const resize = () => { const rect = el.getBoundingClientRect(); setViewportSize({ width: rect.width, height: rect.height }); };
    const observer = new ResizeObserver(resize); observer.observe(el); resize();
    return () => observer.disconnect();
  }, []);
  const changeZoom = useCallback((value, point) => {
    const el = viewport.current, d = displayState.current;
    const x = point?.x ?? d.viewportSize.width / 2, y = point?.y ?? d.viewportSize.height / 2;
    zoomAnchor.current = { x, y, logicalX: (el.scrollLeft + x - (d.stageWidth - WIDTH * d.scale) / 2) / d.scale, logicalY: (el.scrollTop + y - (d.stageHeight - HEIGHT * d.scale) / 2) / d.scale };
    setZoom(Math.max(.5, Math.min(d.maxZoom, value)));
  }, []);
  useLayoutEffect(() => {
    if (!zoomAnchor.current) return;
    const a = zoomAnchor.current; zoomAnchor.current = null;
    viewport.current.scrollTo({ left: a.logicalX * scale + (stageWidth - WIDTH * scale) / 2 - a.x, top: a.logicalY * scale + (stageHeight - HEIGHT * scale) / 2 - a.y, behavior: 'instant' });
  }, [scale, stageWidth, stageHeight]);
  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.fullscreenEnabled && root.current.requestFullscreen) { await root.current.requestFullscreen(); zoomAnchor.current = null; setZoom(1); viewport.current?.scrollTo({ top: 0, left: 0 }); }
      else { setToast('当前内嵌预览不支持真正全屏。请用项目里的“全屏启动.cmd”在独立浏览器打开。'); return; }
      setModal(null);
    } catch {
      setToast('当前预览阻止了全屏。请用项目里的“全屏启动.cmd”在独立浏览器打开，再按 F11。');
    }
  }, []);
  useEffect(() => {
    const listener = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', listener);
    return () => document.removeEventListener('fullscreenchange', listener);
  }, []);
  useEffect(() => {
    const el = viewport.current;
    const wheel = e => {
      if (!e.ctrlKey || modal) return;
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      changeZoom(displayState.current.zoom * (e.deltaY < 0 ? 1.1 : 1 / 1.1), { x: e.clientX - rect.left, y: e.clientY - rect.top });
    };
    const key = e => {
      const editing = /INPUT|TEXTAREA|SELECT/.test(e.target?.tagName) || e.target?.isContentEditable;
      if (modal || editing) return;
      if (e.ctrlKey || e.metaKey) {
        if (['+', '=', '-'].includes(e.key)) { e.preventDefault(); changeZoom(displayState.current.zoom * (e.key === '-' ? 1 / 1.25 : 1.25)); }
        if (e.key === '0') { e.preventDefault(); changeZoom(1); }
      } else if (e.key.toLowerCase() === 'f') { e.preventDefault(); toggleFullscreen(); }
    };
    el.addEventListener('wheel', wheel, { passive: false }); window.addEventListener('keydown', key);
    return () => { el.removeEventListener('wheel', wheel); window.removeEventListener('keydown', key); };
  }, [modal, changeZoom, toggleFullscreen]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(''), 4000); return () => clearTimeout(t); }, [toast]);
  useEffect(() => { if (!playing) return; const t = setInterval(() => setMinute(m => { if (m >= 120) { setPlaying(false); return 120; } return m + 1; }), 1000); return () => clearInterval(t); }, [playing]);
  useEffect(() => {
    if (!running || page !== 4) return;
    const t = setInterval(() => setRemaining(s => { if (s <= 1) { setRunning(false); notify('这次活动已完成，带着轻松的身体继续学习吧。'); return 0; } return s - 1; }), 1000);
    return () => clearInterval(t);
  }, [running, page, notify]);
  useEffect(() => { try { localStorage.setItem('future-you:reference-plan', JSON.stringify(plan)); } catch { /* Current-session operation remains available. */ } }, [plan]);
  const inspect = id => setModal({ type: 'part', id });
  const showModel = (kind = 'body', selected = 'vertebra', opts = {}) => setModal({ type: 'model', kind, selected, ...opts });
  const chooseStructure = id => { setStructure(id); setDetailPart(id); setStructureEdited(true); };
  const resetAssembly = () => { setPlaced([]); setPiece(null); setAssemblyEdited(true); setStructure('vertebra'); setDetailPart('disc'); setStructureEdited(false); notify('结构已复位，选择一个部件，再放入对应位置。'); };
  const putPiece = (id, slot) => {
    if (!id) { notify('先选择一个部件，再点击对应的归位位置。'); return; }
    if (id !== slot) { notify(`${partNames[id]}应放入同名位置，再试一次。`); return; }
    if (placed.includes(id)) { notify(`${partNames[id]}已经归位。`); return; }
    const next = [...placed, id]; setPlaced(next); setPiece(null); setAssemblyEdited(true);
    notify(next.length === 5 ? '全部结构已归位！可以继续比较姿势。' : `${partNames[id]}归位成功，已完成 ${next.length}/5。`);
  };
  const chooseMovement = id => { setMovement(id); setActivityEdited(true); setRemaining(breakMinutes * 60); setTimerEdited(true); setRunning(true); };
  const changeBreak = value => { setBreakMinutes(value); setRemaining(value * 60); setTimerEdited(true); setRunning(true); };
  const updateTime = value => { setMinute(value); setTimelineEdited(true); };
  const choosePose = id => { setPose(id); setTimelineEdited(true); setPlaying(false); };
  const toggleAction = id => setPlan(p => ({ ...p, actions: p.actions.includes(id) ? p.actions.filter(a => a !== id) : [...p.actions, id] }));
  const restoreReference = () => {
    setLayer('muscle'); setView('back'); setStructure('vertebra'); setDetailPart('disc'); setStructureTab(0); setStructureEdited(false);
    setPlaced(['vertebra', 'disc', 'ligament']); setPiece(null); setAssemblyEdited(false);
    setPose('forward'); setMinute(60); setTimelineEdited(false); setPlaying(false);
    setStudy(25); setBreakMinutes(2); setMovement('walk'); setActivityEdited(false); setRemaining(120); setRunning(false); setTimerEdited(false);
    setScenario(0); setAnswer(2); setSubmitted(true); setQuizEdited(false); setAnatomyAnswer('erector');
    setPlan({ study: 45, break: 5, actions: [], movement: 'walk', custom: false }); setSearch(''); changeZoom(1); navigate(1);
  };
  const exportPlan = () => {
    const text = `未来的你 · 我的个性化行动方案\n\n学习单元：${plan.study} 分钟\n活动间歇：${plan.break} 分钟\n当前活动：${movements.find(m => m.id === plan.movement)?.title || '起身行走'}\n\n为你推荐的关键行动\n${['设定提醒：在学习单元结束时提醒起身。', '微运动放松：选择喜欢的动作。', '优化坐姿：双脚有支撑，屏幕在舒适的视线高度。', '补充水分：安排日常饮水。', '规律作息：给身体充分的休息。'].map((a, i) => `${i + 1}. ${a}`).join('\n')}\n\n动作图鉴\n${exercises.map(e => `${e.title} · ${e.time}\n${e.instructions.join('\n')}`).join('\n\n')}\n\n数字和色彩为教学情景示意，不是个人医学测量。`;
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = '未来的你-我的行动方案.txt'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); notify('行动方案已导出。');
  };
  const header = () => {
    const common = [1, 3, 4].includes(page);
    const aboutXs = page === 1 ? [650, 714, 808, 907] : page === 3 ? [718, 788, 886, 985] : page === 4 ? [711, 793, 909, 1025] : page === 5 ? [489, 539, 609, 682] : [477, 529, 605, 680];
    return <>
      <Hotspot x={35} y={10} w={165} h={48} label="未来的你 · 返回认识人体" onClick={() => navigate(1)} />
      {page !== 6 && ['首页', '关于项目', '科学依据', '使用说明'].map((name, i) => <Hotspot key={name} x={aboutXs[i]} y={14} w={i ? 78 : 52} h={43} label={name} onClick={() => i === 0 ? navigate(1) : setModal({ type: ['home', 'about', 'science', 'help'][i] })} />)}
      {page === 1 && <><input className={`ref-search ${search ? 'has-value' : ''}`} style={{ left: 1230, top: 20, width: 179, height: 33 }} aria-label="搜索解剖结构或关键词" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && e.currentTarget.value.trim()) { setSearch(e.currentTarget.value.trim()); setModal({ type: 'search' }); } }} /><Hotspot x={1197} y={19} w={34} h={34} label="搜索" onClick={() => { if (search.trim()) setModal({ type: 'search' }); }} /></>}
      {page === 3 && <input className={`ref-search ${search ? 'has-value' : ''}`} style={{ left: 1300, top: 19, width: 250, height: 33 }} aria-label="搜索姿势、腰痛、椎间盘" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && e.currentTarget.value.trim()) { setSearch(e.currentTarget.value.trim()); setModal({ type: 'search' }); } }} />}
      {[1, 6].includes(page) && <Hotspot x={1445} y={16} w={41} h={41} label="活动提醒" onClick={() => setModal({ type: 'reminder' })} />}
      {page !== 4 && <Hotspot x={page === 3 ? 1586 : page === 5 ? 1472 : page === 2 ? 1595 : 1497} y={10} w={page === 2 || page === 3 ? 48 : 145} h={49} label="同学 · 个人设置" onClick={() => setModal({ type: 'profile' })} />}
      {page === 4 && <Hotspot x={1474} y={12} w={155} h={44} label="开始体验" onClick={() => navigate(1)} />}
      {common ? <>{page !== 4 && moduleNames.map((name, i) => {
        const coords = page === 1 ? [43, 85, 266, 66, 264] : [33, 70, 260, 67, 270];
        return <Hotspot key={name} x={coords[0] + i * coords[4]} y={coords[1]} w={coords[2]} h={coords[3]} label={`0${i + 1} ${name}`} selected={page === i + 1} onClick={() => navigate(i + 1)} />;
      })}{page === 4 && moduleNames.map((name, i) => <Hotspot key={name} x={792 + i * 140} y={98} w={140} h={51} label={`0${i + 1} ${name}`} selected={page === i + 1} onClick={() => navigate(i + 1)} />)}</> : moduleNames.map((name, i) => {
        const config = page === 2 ? [763, 12, 100, 35] : page === 5 ? [769, 23, 107, 35] : [500, 17, 113, 39];
        return <Hotspot key={name} x={config[0] + i * config[2]} y={config[1]} w={config[2]} h={config[3]} label={`0${i + 1} ${name}`} selected={page === i + 1} onClick={() => navigate(i + 1)} />;
      })}
    </>;
  };
  const anatomyPage = () => <>
    <Hotspot x={420} y={159} w={451} h={648} label="旋转查看真实人体模型" onClick={() => showModel('body', 'all', { view: 'full' })} />
    {['skin', 'muscle', 'bone', 'ligament', 'disc', 'nerve'].map((id, i) => <Hotspot key={id} x={61} y={417 + i * 62} w={170} h={55} label={`观察${partNames[id]}`} selected={layer === id} onClick={() => { setLayer(id); showModel('body', id === 'bone' ? 'vertebra' : id === 'skin' ? 'all' : id, { view: ['bone', 'muscle', 'skin'].includes(id) ? 'full' : 'regional' }); }} />)}
    {['back', 'front', 'muscle', 'bone', 'nerve', 'compare'].map((id, i) => <Hotspot key={id} x={66 + i * 80} y={816} w={78} h={85} label={['全身后视', '全身前视', '肌肉视图', '骨骼视图', '神经视图', '视图对比'][i]} selected={view === id} onClick={() => { setView(id); id === 'compare' ? setModal({ type: 'views' }) : showModel('body', id === 'bone' ? 'vertebra' : id === 'nerve' ? 'nerve' : id === 'muscle' ? 'muscle' : 'all', { view: id === 'nerve' ? 'regional' : 'full', side: id }); }} />)}
    {[['muscle', 522, 419, 105, 36], ['disc', 704, 528, 92, 36], ['pelvis', 508, 603, 78, 35]].map(([id, x, y, w, h]) => <Hotspot key={id} x={x} y={y} w={w} h={h} label={`了解${partNames[id]}`} onClick={() => inspect(id)} />)}
    {['muscle', 'pelvis', 'disc'].map((id, i) => <Hotspot key={id} x={1510} y={[245, 470, 677][i]} w={104} h={33} label={`查看${partNames[id]}详情`} onClick={() => inspect(id)} />)}
    <Hotspot x={1408} y={859} w={206} h={47} label="进入 02 拆解脊柱" onClick={() => navigate(2)} />
  </>;
  const structurePage = () => {
    const ids = ['vertebra', 'disc', 'ligament', 'muscle', 'nerve'];
    return <>
      <Hotspot x={312} y={61} w={779} h={561} label="旋转观察拆解脊柱模型" onClick={() => showModel('spine', structure, { explode: 65 })} />
      {[['vertebra', 544, 169, 68], ['disc', 521, 244, 85], ['vertebra', 512, 347, 70], ['pelvis', 430, 522, 70], ['ligament', 965, 121, 70], ['muscle', 998, 279, 84], ['nerve', 995, 438, 85]].map(([id, x, y, w], i) => <Hotspot key={i} x={x} y={y} w={w} h={38} label={`观察${partNames[id]}结构`} onClick={() => { chooseStructure(id); }} />)}
      {!structureEdited && ['vertebra', 'disc', 'ligament', 'muscle'].map((id, i) => <Hotspot key={id} x={56} y={325 + i * 45} w={232} h={39} label={`观察模式：${partNames[id]}`} selected={structure === id} onClick={() => { chooseStructure(id); }} />)}
      <Hotspot x={56} y={506} w={232} h={40} label="爆炸视图" onClick={() => showModel('spine', structure, { explode: 100 })} />
      <Hotspot x={56} y={552} w={232} h={40} label="复位结构" onClick={resetAssembly} />
      {structureEdited && <div className="ref-live ref-observe-options" style={{ left: 56, top: 325, width: 232, height: 176 }}>{['vertebra', 'disc', 'ligament', 'muscle'].map((id, i) => <button key={id} className={structure === id ? 'selected' : ''} aria-pressed={structure === id} onClick={() => chooseStructure(id)}><img src={asset(`piece-${id}`)} alt="" />{partNames[id]}<ChevronRight size={18} /></button>)}</div>}
      {!structureEdited && ['结构与位置', '功能作用', '日常影响'].map((text, i) => <Hotspot key={text} x={1365 + i * 90} y={114} w={90} h={37} label={text} selected={structureTab === i} onClick={() => { setStructureTab(i); setStructureEdited(true); }} />)}
      {structureEdited && <div className="ref-live ref-structure-detail" style={{ left: 1101, top: 90, width: 548, height: 518 }}><header><span className="ref-circle"><BookOpen size={27} /></span><h2>{partNames[detailPart]}</h2><div className="ref-small-tabs">{['结构与位置', '功能作用', '日常影响'].map((t, i) => <button key={t} className={structureTab === i ? 'selected' : ''} onClick={() => setStructureTab(i)}>{t}</button>)}</div></header><p>{structureTab === 0 ? parts[detailPart].text : structureTab === 1 ? parts[detailPart].subtitle : '在学习和生活中，给身体留出姿势变化与活动的机会。把结构知识与日常选择连接起来。'}</p><button className="ref-structure-image" aria-label={`查看${partNames[detailPart]}真实模型`} onClick={() => showModel('body', detailPart, { view: 'regional' })}><img src={asset(detailPart === 'disc' ? 'disc-cutaway' : parts[detailPart].image)} alt={`${partNames[detailPart]}解剖图`} /></button><div className="ref-blue-note"><Lightbulb /><div><strong>你知道吗？</strong><p>结构之间共同协作，帮助身体稳定与运动。点击模型，可旋转观察它们的连接关系。</p></div></div></div>}
      {ids.map((id, i) => <Hotspot key={id} x={51 + i * 115} y={747} w={105} h={140} label={`选择${partNames[id]}部件${placed.includes(id) ? '，已归位' : ''}`} selected={piece === id} draggable={!placed.includes(id)} onDragStart={e => { e.dataTransfer.setData('text/plain', id); setPiece(id); }} onClick={() => { if (placed.includes(id)) { notify(`${partNames[id]}已经归位，可点击复位重新练习。`); return; } setPiece(id); notify(`已选择${partNames[id]}，点击或拖入对应的归位位置。`); }} />)}
      {ids.map((id, i) => <Hotspot key={id} x={662 + i * 194} y={727} w={182} h={180} label={`归位位置：${partNames[id]}`} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); putPiece(e.dataTransfer.getData('text/plain'), id); }} onClick={() => putPiece(piece, id)} />)}
      {piece && <span className="ref-selection-outline" style={{ left: 51 + ids.indexOf(piece) * 115, top: 747, width: 105, height: 140 }} />}
      {assemblyEdited && <><div className="ref-live ref-assembly-progress" style={{ left: 1015, top: 645, width: 317, height: 39 }}><strong>{placed.length}/5</strong><span>已完成</span><progress max="5" value={placed.length} />{placed.length === 5 && <Check size={19} />}</div>{ids.map((id, i) => placed.includes(id) && <span key={id} className="ref-placed" style={{ left: 802 + i * 194, top: 735 }}><Check size={20} /></span>)}</>}
      <Hotspot x={1348} y={644} w={89} h={40} label="结构归位提示" onClick={() => notify(piece ? `把${partNames[piece]}放入右侧同名位置。` : '选择下方尚未归位的部件，然后点击右侧同名位置。也支持拖放。')} />
      <Hotspot x={1462} y={644} w={172} h={40} label="进入 03 比较姿势" onClick={() => navigate(3)} />
    </>;
  };
  const posturePage = () => {
    const poseIds = ['standard', 'forward', 'crossed', 'phone'], poseNames = ['标准坐姿', '前倾伏案', '翘腿坐姿', '蜷坐刷手机'];
    const factors = { standard: [.12, .12, .10], forward: [.68, .52, .60], crossed: [.42, .35, .72], phone: [.75, .64, .66] };
    const metrics = factors[pose].map(v => Math.round(v * minute / 60 * 100));
    return <>
      {pose !== 'forward' && <img className="ref-live ref-pose-hero" style={{ left: 31, top: 251, width: 611, height: 536 }} src={asset(`posture-${pose}-full`).replace('.webp', '.png')} alt={`${poseNames[poseIds.indexOf(pose)]}的身体结构示意`} />}
      <Hotspot className={pose !== 'forward' ? 'above-live' : ''} x={31} y={251} w={611} h={536} label="观察当前坐姿的真实脊柱模型" onClick={() => showModel('body', 'all', { view: 'regional', pose })} />
      {pose === 'forward' && poseIds.map((id, i) => <Hotspot key={id} x={674 + i * 238} y={240} w={228} h={95} label={`选择${poseNames[i]}`} selected={pose === id} onClick={() => choosePose(id)} />)}
      {pose !== 'forward' && <div className="ref-live ref-posture-options" style={{ left: 674, top: 239, width: 955, height: 97 }}>{poseIds.map((id, i) => <button key={id} aria-label={`选择${poseNames[i]}`} className={pose === id ? 'selected' : ''} aria-pressed={pose === id} onClick={() => choosePose(id)}><img src={asset(`posture-${id}`)} alt="" /><span><strong>{poseNames[i]}</strong><small>{['脊柱对齐，压力最小', '常见学习姿势', '骨盆不平衡', '腰椎负担大'][i]}</small></span>{pose === id && <span className="ref-option-check"><Check size={16} /></span>}</button>)}</div>}
      <input className={`ref-timeline ${timelineEdited ? 'edited' : ''}`} style={{ left: 950, top: 369, width: 585, height: 42, '--progress': `${minute / 120 * 100}%` }} type="range" min="0" max="120" step="1" value={minute} aria-label="连续久坐时间，分钟" onChange={e => updateTime(Number(e.target.value))} />
      {!timelineEdited && <Hotspot x={1571} y={366} w={47} h={48} label={playing ? '暂停时间轴' : '播放时间轴'} onClick={() => { setPlaying(!playing); setTimelineEdited(true); }} />}
      {timelineEdited && <><span className="ref-live ref-time-label" style={{ left: 681, top: 391, width: 170, height: 43 }}>{minute} 分钟</span><span className="ref-live ref-current-time" style={{ left: 837, top: 460, width: 155, height: 28 }}>（当前：{minute} 分钟）</span><div className="ref-live ref-time-ticks" style={{ left: 948, top: 406, width: 586, height: 30 }}>{[0, 30, 60, 90, 120].map(n => <span key={n} className={minute === n ? 'active' : ''}>{n}{n === 120 ? '（分钟）' : ''}</span>)}</div><button className="ref-live ref-round-button" style={{ left: 1573, top: 368, width: 45, height: 45 }} aria-label={playing ? '暂停时间轴' : '播放时间轴'} onClick={() => setPlaying(!playing)}>{playing ? <Pause size={24} /> : <Play size={24} />}</button>{metrics.map((m, i) => <React.Fragment key={i}><span className="ref-live ref-metric-label" style={{ left: 912 + i * 326, top: 746, width: 60, height: 27 }}>+{m}%</span><span className="ref-live ref-after-time" style={{ left: 872 + i * 326, top: 673, width: 58, height: 20 }}>{minute} 分钟</span><span className="ref-live ref-meter" style={{ left: 685 + i * 326, top: 720, width: 286, height: 29 }}><span style={{ width: `${Math.min(100, m)}%` }} /></span></React.Fragment>)}<div className="ref-live ref-finding-copy" style={{ left: 129, top: 861, width: 665, height: 49 }}>同样是 {minute} 分钟的学习时间，不同坐姿带来的身体变化有所不同。<br />{pose === 'standard' ? '保持自然的腰背支撑，同时给身体留出姿势变化与活动的机会。' : pose === 'forward' ? '前倾伏案需要腰背持续参与支撑。尝试调整屏幕位置，并安排活动间歇。' : pose === 'crossed' ? '翘腿会改变骨盆的位置。双脚有支撑，适时换一种姿态。' : '低头刷手机会改变颈肩与腰背的位置。抬高视线，适时起身活动。'}</div></>}
      {pose === 'standard' && ['muscle', 'disc', 'pelvis'].map((id, i) => <React.Fragment key={id}><img className="ref-live ref-standard-after" style={{ left: 834 + i * 326, top: 566, width: 136, height: 104 }} src={asset(`${id}-before`)} alt="中立位置的结构示意" /><span className="ref-live ref-standard-caption" style={{ left: 834 + i * 326, top: 695, width: 136, height: 20 }}>{['维持自然支撑', '保持正常形态', '骨盆中立位'][i]}</span><span className="ref-live ref-posture-description" style={{ left: 686 + i * 326, top: 539, width: 283, height: 21 }}>{['腰背自然支撑，仍需规律的活动间歇', '相邻椎体间缓冲，保持姿势变化的机会', '双脚有支撑，骨盆保持自然中立'][i]}</span></React.Fragment>)}
      <Hotspot x={1485} y={457} w={152} h={36} label="与标准坐姿对比" onClick={() => setModal({ type: 'compare', minute, pose, metrics })} />
      <Hotspot x={1183} y={809} w={463} h={112} label="去做改变吧，进入 04 活动间歇" onClick={() => navigate(4)} />
    </>;
  };
  const activityPage = () => {
    const selected = movements.find(m => m.id === movement);
    const time = `${String(Math.floor(remaining / 60)).padStart(2, '0')} : ${String(remaining % 60).padStart(2, '0')}`;
    return <>
      {study === 25 && [25, 50, 90].map((v, i) => <Hotspot key={v} x={62 + i * 176} y={335} w={170} h={66} label={`学习时长 ${v} 分钟`} selected={study === v} onClick={() => setStudy(v)} />)}
      {study !== 25 && <div className="ref-live" style={{ left: 62, top: 335, width: 521, height: 66 }}><SelectRow values={[25, 50, 90]} selected={study} onChange={setStudy} captions={['番茄工作法', '深度学习', '完整时段']} /></div>}
      {breakMinutes === 2 && [2, 5, 10].map((v, i) => <Hotspot key={v} x={62 + i * 176} y={448} w={170} h={62} label={`活动时长 ${v} 分钟`} selected={breakMinutes === v} onClick={() => changeBreak(v)} />)}
      {breakMinutes !== 2 && <div className="ref-live" style={{ left: 62, top: 448, width: 521, height: 62 }}><SelectRow values={[2, 5, 10]} selected={breakMinutes} onChange={changeBreak} captions={['快速唤醒', '推荐时长', '全面放松']} /></div>}
      {movement === 'walk' && movements.map((m, i) => <Hotspot key={m.id} x={62} y={557 + i * 80} w={520} h={78} label={`选择活动：${m.title}`} selected={movement === m.id} onClick={() => chooseMovement(m.id)} />)}
      {movement !== 'walk' && <><div className="ref-live ref-movement-options" style={{ left: 62, top: 557, width: 520, height: 303 }}>{movements.map(m => <button key={m.id} className={movement === m.id ? 'selected' : ''} onClick={() => chooseMovement(m.id)} aria-pressed={movement === m.id}><img src={asset(`movement-${m.id}`)} alt="" /><span><strong>{m.title}</strong><small>{m.intro}</small></span><ChevronRight size={20} /></button>)}</div><div className="ref-live ref-movement-detail" style={{ left: 1131, top: 219, width: 489, height: 397 }}><h2>{selected.title}</h2><p>{selected.intro}</p><div className="ref-move-image"><img src={asset(selected.image)} alt={selected.title} /></div><ul>{selected.points.map(point => <li key={point}><Check size={21} />{point}</li>)}</ul></div></>}
      <Hotspot x={621} y={328} w={479} h={397} label="旋转查看活动前后的肌群模型" onClick={() => showModel('body', 'muscle', { view: 'full' })} />
      {movement === 'walk' && <Hotspot x={1147} y={314} w={283} h={302} label={`查看${selected.title}动作说明`} onClick={() => setModal({ type: 'movement', id: movement })} />}
      {!timerEdited && <Hotspot x={1371} y={786} w={214} h={35} label="暂停活动倒计时" onClick={() => { setTimerEdited(true); setRunning(false); }} />}
      {timerEdited && <><div className="ref-live ref-timer-center" style={{ left: 1184, top: 733, width: 130, height: 68 }}><strong>{time}</strong><span>{remaining === 0 ? '已完成' : running ? '活动中' : '已暂停'}</span></div><div className="ref-live ref-current-movement" style={{ left: 1374, top: 720, width: 214, height: 61 }}><span className="ref-circle"><Play size={27} /></span><div><strong>{selected.title}</strong><small>{selected.id === 'walk' ? '放松腰背 · 促进循环' : '舒适活动 · 放松身体'}</small></div></div><button className="ref-live ref-timer-button" style={{ left: 1372, top: 786, width: 213, height: 35 }} onClick={() => { if (remaining === 0) setRemaining(breakMinutes * 60); setRunning(!running); }} aria-label={running ? '暂停活动倒计时' : '继续活动倒计时'}>{running ? <Pause size={16} /> : <Play size={16} />}{running ? '暂停' : remaining === 0 ? '再来一次' : '继续'}</button></>}
      <Hotspot x={1291} y={881} w={346} h={48} label="进入下一模块 05 教学挑战" onClick={() => { if (study !== 25 || breakMinutes !== 2 || movement !== 'walk') setPlan(p => ({ ...p, study, break: breakMinutes, movement, custom: true })); navigate(5); }} />
    </>;
  };
  const quizPage = () => {
    const q = scenarios[scenario], correct = answer === q.correct;
    const submit = () => {
      if (answer === null) { notify('先选择一个答案。'); return; }
      if (submitted && correct) {
        if (scenario === 2) { notify('三个情境已完成，带走你的行动方案吧。'); navigate(6); return; }
        setScenario(scenario + 1); setAnswer(null); setSubmitted(false); setQuizEdited(true); return;
      }
      setSubmitted(true); setQuizEdited(true); notify(correct ? '回答正确！把这个选择带入日常生活。' : '再观察一下，选择一个能增加活动机会的安排。');
    };
    return <>
      {!quizEdited && q.answers.map((a, i) => <Hotspot key={i} x={49} y={375 + i * 86} w={547} h={76} label={`选择 ${'ABCD'[i]}：${a[0]}`} selected={answer === i} onClick={() => { setAnswer(i); setSubmitted(false); setQuizEdited(true); }} />)}
      {quizEdited && <><div className="ref-live ref-quiz-heading" style={{ left: 49, top: 210, width: 547, height: 153 }}><span className="ref-quiz-progress">情景 {scenario + 1} / 3</span><h2>{q.title}</h2><p>{q.intro}</p></div><div className="ref-live ref-quiz-options" style={{ left: 48, top: 375, width: 549, height: 334 }}>{q.answers.map(([title, desc], i) => <button key={i} className={answer === i ? 'selected' : ''} aria-pressed={answer === i} onClick={() => { setAnswer(i); setSubmitted(false); }}><span className="ref-radio">{answer === i && <span />}</span><span><strong>{'ABCD'[i]}．{title}</strong><small>{desc}</small></span></button>)}</div><div className="ref-live ref-quiz-explanation" style={{ left: 48, top: 723, width: 549, height: 92 }}><Lightbulb size={29} /><div><strong>为什么这样选？</strong><p>{submitted ? q.explanation : '选择一个答案，再提交查看解析。把结构知识与可以落实的小行动连接起来。'}</p></div></div><div className={`ref-live ref-quiz-feedback ${submitted && correct ? 'correct' : ''}`} style={{ left: 624, top: 190, width: 494, height: 157 }}><h2>{submitted ? correct ? <><Check size={38} />回答正确！</> : <><Info size={34} />再想一想</> : <><Lightbulb size={35} />做出你的选择</>}</h2><p>{submitted && correct ? '很棒！你选择了更容易坚持且有效的方式。短时活动是打破久坐的关键，能让身体更快恢复到放松状态。' : submitted ? '请重新阅读选项，选择能增加活动机会、可以真正执行的安排。' : '把所学的结构知识与日常选择结合，在真实情境中做出更健康的决定。'}</p></div><span className="ref-live ref-quiz-footer-progress" style={{ left: 484, top: 885, width: 88, height: 23 }}>情景 {scenario + 1} / 3</span></>}
      {!quizEdited && <Hotspot x={902} y={754} w={196} h={55} label="提交答案，进入下一情景" onClick={submit} />}
      {quizEdited && <><button className="ref-live ref-quiz-submit" style={{ left: 902, top: 754, width: 196, height: 55 }} onClick={submit}>{submitted && correct ? scenario === 2 ? '完成挑战' : '下一情景' : '提交答案'}<ArrowRight size={22} /></button><progress className="ref-live ref-quiz-progress-bar" style={{ left: 238, top: 892, width: 228, height: 13 }} value={scenario + 1} max="3" aria-label="教学挑战完成进度" /></>}
      <Hotspot x={1166} y={335} w={228} h={329} label="识别竖脊肌" selected={anatomyAnswer === 'erector'} onClick={() => { setAnatomyAnswer('erector'); notify('选择正确：竖脊肌帮助维持脊柱稳定。'); }} />
      <Hotspot x={1403} y={335} w={226} h={329} label="识别斜方肌" selected={anatomyAnswer === 'trapezius'} onClick={() => { setAnatomyAnswer('trapezius'); }} />
      {anatomyAnswer === 'trapezius' && <div className="ref-live ref-anatomy-answer" style={{ left: 1164, top: 681, width: 466, height: 120 }}><Lightbulb size={26} /><div><strong>斜方肌</strong><p>斜方肌主要参与肩胛骨运动。再点击左侧图中的竖脊肌，认识帮助维持脊柱稳定的肌群。</p></div></div>}
      <Hotspot x={1327} y={857} w={318} h={60} label="继续学习 06 缓解与行动计划" onClick={() => navigate(6)} />
    </>;
  };
  const planPage = () => <>
    <Hotspot x={44} y={462} w={488} h={83} label="设置我的个性化行动方案" onClick={() => { setDraft(plan); setModal({ type: 'plan' }); }} />
    <Hotspot x={43} y={560} w={282} h={143} label="调整建议学习时长" onClick={() => { setDraft(plan); setModal({ type: 'plan' }); }} />
    <Hotspot x={363} y={560} w={271} h={143} label="调整活动时长" onClick={() => { setDraft(plan); setModal({ type: 'plan' }); }} />
    {plan.custom && <><span className="ref-live ref-plan-value" style={{ left: 140, top: 604, width: 174, height: 41 }}>{plan.study} 分钟</span><span className="ref-live ref-plan-value" style={{ left: 463, top: 604, width: 161, height: 41 }}>{plan.break} 分钟</span><p className="ref-live ref-plan-description" style={{ left: 143, top: 648, width: 171, height: 43 }}>建议以 {plan.study} 分钟作为一个学习单元。</p><p className="ref-live ref-plan-description" style={{ left: 464, top: 648, width: 160, height: 43 }}>每完成一个学习单元，进行 {plan.break} 分钟身体活动。</p><p className="ref-live ref-plan-description" style={{ left: 67, top: 833, width: 114, height: 60 }}>开启学习计时，每 {plan.study} 分钟提醒一次活动。</p></>}
    {['reminder', 'movement', 'posture', 'water', 'sleep'].map((id, i) => <React.Fragment key={id}><Hotspot x={44 + i * 166} y={777} w={154} h={132} label={`${plan.actions.includes(id) ? '取消完成' : '完成'}：${['设定提醒', '微运动放松', '优化坐姿', '补充水分', '规律作息'][i]}`} selected={plan.actions.includes(id)} onClick={() => toggleAction(id)} />{plan.actions.includes(id) && <span className="ref-action-done" style={{ left: 44 + i * 166, top: 777, width: 154, height: 132 }}><span><Check size={18} /></span></span>}</React.Fragment>)}
    {exercises.map((e, i) => <Hotspot key={e.id} x={904 + i * 154} y={553} w={141} h={347} label={`动作图鉴：${e.title}，${e.time}`} onClick={() => setModal({ type: 'exercise', id: e.id })} />)}
    <Hotspot x={1488} y={463} w={142} h={37} label="查看更多动作" onClick={() => setModal({ type: 'exercises' })} />
    <Hotspot x={1610} y={681} w={45} h={46} label="查看下一组动作" onClick={() => setModal({ type: 'exercises' })} />
    {Array.from({ length: 5 }, (_, i) => <Hotspot key={i} x={1203 + i * 20} y={902} w={18} h={19} label={`打开动作 ${exercises[i].title}`} onClick={() => setModal({ type: 'exercise', id: exercises[i].id })} />)}
  </>;
  const renderModal = () => {
    if (!modal) return null;
    if (modal.type === 'part') { const p = parts[modal.id]; return <Dialog title={p.title} subtitle={p.subtitle} onClose={close}><div className="ref-part-info"><img src={asset(p.image)} alt={`${p.title}解剖插图`} /><p>{p.text}</p></div><Button onClick={() => showModel('body', modal.id === 'bone' ? 'vertebra' : modal.id === 'skin' ? 'all' : modal.id, { view: 'regional' })}><RotateCcw size={18} />旋转查看真实模型<ArrowRight size={18} /></Button></Dialog>; }
    if (modal.type === 'model') return <Dialog wide title={modal.kind === 'spine' ? '拆解脊柱 · 真实解剖模型' : '认识人体 · 真实解剖模型'} subtitle="拖动旋转 · 滚轮缩放 · 点击结构观察" onClose={close}><Suspense fallback={<div className="ref-loading">正在载入真实解剖模型…</div>}>{modal.kind === 'spine' ? <RealSpineViewer explode={modal.explode || 0} selected={['vertebra', 'disc', 'pelvis'].includes(modal.selected) ? modal.selected : 'vertebra'} onSelect={id => setModal(m => ({ ...m, selected: id }))} /> : <TeachingBody key={`${modal.view}-${modal.side}`} view={modal.view || 'regional'} cameraSide={modal.side === 'back' ? 'back' : 'front'} layer={['all', 'muscle', 'vertebra', 'disc', 'pelvis'].includes(modal.selected) ? modal.selected : 'all'} pose={modal.pose || 'stand'} height={510} focusPart={modal.view === 'full' || ['all', 'ligament', 'nerve'].includes(modal.selected) ? null : modal.selected} onPartSelect={id => notify(`${partNames[id] || id}：拖动可以观察不同角度。`)} />}</Suspense><div className="ref-model-footer"><span>BodyParts3D / Human Atlas · CC BY 4.0</span><a href={assetUrl('/models/ATTRIBUTION.md')} target="_blank" rel="noreferrer">模型来源与许可</a></div></Dialog>;
    if (modal.type === 'views') return <Dialog title="视图对比" subtitle="骨骼与肌肉共同参与身体支撑" onClose={close}><div className="ref-view-comparison">{['front', 'back', 'muscle', 'bone', 'nerve'].map((id, i) => <button key={id} onClick={() => showModel('body', id === 'bone' ? 'vertebra' : id === 'muscle' ? 'muscle' : 'all', { view: 'full', side: id })}><img src={asset(`view-${id}`)} alt="" /><strong>{['全身前视', '全身后视', '肌肉', '骨骼', '神经'][i]}</strong></button>)}</div></Dialog>;
    if (modal.type === 'compare') return <Dialog wide title={`同一段学习时间 · ${minute} 分钟`} subtitle="与标准坐姿对比" onClose={close}><div className="ref-compare-modal">{['muscle', 'disc', 'pelvis'].map((id, i) => <section key={id}><h3>{['肌肉状态', '椎间盘状态', '骨盆 / 姿势'][i]}</h3><div><figure><img src={asset(`${id}-before`)} alt="标准坐姿参考" /><figcaption>标准坐姿</figcaption></figure><ArrowRight size={22} /><figure><img src={asset(`${id}-after`)} alt="当前坐姿参考" /><figcaption>当前坐姿</figcaption></figure></div><p>情景变化示意 <strong>+{modal.metrics[i]}%</strong></p></section>)}</div><p className="ref-note">数字和色彩沿用教学画面的情景示意，用于比较选择，不是个人身体测量。</p></Dialog>;
    if (modal.type === 'movement' || modal.type === 'exercise') {
      const e = modal.type === 'exercise' ? exercises.find(e => e.id === modal.id) : movements.find(m => m.id === modal.id);
      return <Dialog title={e.title} subtitle={e.time || `活动 ${breakMinutes} 分钟`} onClose={close}><div className="ref-exercise-detail"><img src={asset(modal.type === 'exercise' ? `exercise-${e.id}` : e.image)} alt={e.title} /><div><p>{e.desc || e.intro}</p><ol>{(e.instructions || e.points).map(p => <li key={p}>{p}</li>)}</ol><Button onClick={() => { chooseMovement(modal.type === 'exercise' ? e.id === 'neck' ? 'shoulder' : e.id === 'twist' ? 'rotate' : e.id === 'side' ? 'stretch' : 'walk' : e.id); navigate(4); }}><Play size={18} />开始活动计时</Button></div></div></Dialog>;
    }
    if (modal.type === 'exercises') return <Dialog wide title="动作图鉴" subtitle="选择一个喜欢的动作，在学习间隙跟着做一做" onClose={close}><div className="ref-exercise-gallery">{exercises.map(e => <button key={e.id} onClick={() => setModal({ type: 'exercise', id: e.id })}><img src={asset(`exercise-${e.id}`)} alt={e.title} /><strong>{e.title}</strong><span><Clock3 size={15} />{e.time}</span><small>{e.desc}</small></button>)}</div></Dialog>;
    if (modal.type === 'plan') return <Dialog title="我的个性化行动方案" subtitle="从今天开始，用一个能做到的小行动改变学习节奏" onClose={close}><form className="ref-plan-form" onSubmit={e => { e.preventDefault(); setPlan({ ...draft, custom: true }); close(); notify('行动方案已保存到本机。'); }}><label>建议学习时长</label><SelectRow values={[25, 30, 45, 50, 90]} selected={draft.study} onChange={v => setDraft(p => ({ ...p, study: v }))} /><label>活动时长</label><SelectRow values={[2, 3, 5, 10]} selected={draft.break} onChange={v => setDraft(p => ({ ...p, break: v }))} /><label htmlFor="plan-movement">喜欢的活动</label><select id="plan-movement" value={draft.movement} onChange={e => setDraft(p => ({ ...p, movement: e.target.value }))}>{movements.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}</select><div className="ref-form-actions"><button className="ref-button" type="submit"><Check size={18} />保存方案</button><Button className="secondary" onClick={exportPlan}><Download size={18} />导出当前方案</Button></div></form></Dialog>;
    if (modal.type === 'profile') return <Dialog title="你好，同学" subtitle="一起为未来的你积累小小的改变" onClose={close}><section className="ref-display-settings"><h3>画面显示</h3><div className="ref-display-actions"><Button onClick={toggleFullscreen}>{fullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}{fullscreen ? '退出全屏' : '全屏查看'}</Button><Button className="secondary" onClick={() => { changeZoom(1 / fitScale); close(); }}>原始尺寸</Button><Button className="secondary" onClick={() => { changeZoom(1); close(); }}>适应窗口</Button></div><div className="ref-display-zoom"><button type="button" aria-label="缩小画面" onClick={() => changeZoom(zoom / 1.25)} disabled={zoom <= .5}><ZoomOut size={20} /></button><output aria-label="画面缩放比例">{Math.round(zoom * 100)}%</output><button type="button" aria-label="放大画面" onClick={() => changeZoom(zoom * 1.25)} disabled={zoom >= maxZoom}><ZoomIn size={20} /></button><Button className="secondary" onClick={close}>查看画面</Button></div><p>Ctrl + 滚轮或 Ctrl + 加减号可缩放，Ctrl + 0 恢复适应窗口。按 F 切换全屏，Esc 退出。放大后可滚动查看各部分。</p></section><form className="ref-plan-form" onSubmit={e => { e.preventDefault(); close(); notify(`你好，${nickname.trim() || '同学'}！继续加油。`); }}><label htmlFor="ref-name">称呼</label><input id="ref-name" value={nickname} maxLength={16} onChange={e => setNickname(e.target.value)} /><div className="ref-form-actions"><button className="ref-button" type="submit"><Check size={18} />保存</button><Button className="secondary" onClick={restoreReference}><RotateCcw size={18} />恢复参考示例</Button></div></form></Dialog>;
    if (modal.type === 'reminder') return <Dialog title="活动提醒" subtitle="把活动放进学习日程" onClose={close}><div className="ref-blue-note"><Bell size={29} /><div><strong>下一个学习单元</strong><p>学习 {plan.study} 分钟后，安排 {plan.break} 分钟的活动间歇。</p></div></div><Button onClick={() => { navigate(4); setStudy([25, 50, 90].includes(plan.study) ? plan.study : 50); setBreakMinutes(plan.break); setRemaining(plan.break * 60); setTimerEdited(true); setRunning(true); }}><Play size={18} />开始活动</Button></Dialog>;
    if (modal.type === 'search') {
      const matches = Object.entries(parts).filter(([id, p]) => `${p.title}${p.text}`.includes(search.trim()));
      return <Dialog title={`搜索：${search}`} onClose={close}><div className="ref-search-results">{matches.length ? matches.map(([id, p]) => <button key={id} onClick={() => inspect(id)}><img src={asset(p.image)} alt="" /><span><strong>{p.title}</strong><small>{p.subtitle}</small></span><ChevronRight size={20} /></button>) : <p>没有找到相关结构。可以搜索“肌肉”“骨盆”“椎间盘”或“韧带”。</p>}</div></Dialog>;
    }
    const content = {
      about: ['关于项目', <><p>“未来的你”是大学生久坐与脊柱健康科普交互系统。通过认识人体、拆解脊柱、比较姿势、体验活动间歇和情景挑战，把身体知识转化为可执行的日常行动。</p><div className="ref-module-list">{moduleNames.map((name, i) => <button key={name} onClick={() => navigate(i + 1)}><span>0{i + 1}</span>{name}<ArrowRight size={18} /></button>)}</div></>],
      science: ['科学依据', <><p>真实解剖模型来自 BodyParts3D / Human Atlas，采用 CC BY 4.0 许可。模型支持旋转、缩放和结构观察。</p><p>画面中的百分比、时间进度和组织颜色是教学情景示意，不是生理测量，也不用于个人诊断或风险预测。</p><div className="ref-source-links"><a href={assetUrl('/models/ATTRIBUTION.md')} target="_blank" rel="noreferrer">模型署名与许可<ChevronRight size={18} /></a><a href="https://www.who.int/news-room/fact-sheets/detail/physical-activity" target="_blank" rel="noreferrer">WHO 身体活动资料<ChevronRight size={18} /></a></div></>],
      help: ['使用说明', <><ol><li>通过顶部的 01–06 导航，依次进入六个教学模块。</li><li>点击人体标记和“查看详情”，认识结构；点击人体或脊柱主图，打开可旋转的真实模型。</li><li>在拆解脊柱页面，选择或拖动待归位部件，放入对应位置。“复位”可以重新练习。</li><li>调整姿势和时间轴，观察情景变化；播放按钮可以推进时间。</li><li>选择学习、活动时长与活动类型，开启倒计时。支持暂停、继续和重新开始。</li><li>完成情景答题，在最后一个模块保存、导出行动方案，并勾选已完成的关键行动。</li></ol></>],
    }[modal.type];
    return content ? <Dialog title={content[0]} onClose={close}>{content[1]}</Dialog> : null;
  };
  return <div ref={root} className={`reference-experience ${fullscreen ? "is-fullscreen" : ""}`}><div ref={viewport} className="ref-viewport" inert={modal ? true : undefined}><div className="ref-stage" style={{ width: stageWidth, height: stageHeight }}><div className="ref-frame" style={{ width: WIDTH * scale, height: HEIGHT * scale, left: (stageWidth - WIDTH * scale) / 2, top: (stageHeight - HEIGHT * scale) / 2 }}><main className="ref-artboard" style={{ width: WIDTH, height: HEIGHT, transform: `scale(${scale})` }} aria-label={`0${page} ${moduleNames[page - 1]}`}>{moduleNames.map((_, i) => <img key={i} className="ref-original" src={assetUrl(`/reference-pages/${String(i + 1).padStart(2, '0')}.png`)} style={{ visibility: page === i + 1 ? 'visible' : 'hidden' }} alt="" aria-hidden="true" draggable="false" loading="eager" decoding="sync" fetchPriority={i === page - 1 ? 'high' : 'auto'} />)}<h1 className="ref-sr-only">0{page} {moduleNames[page - 1]}</h1>{header()}{[anatomyPage, structurePage, posturePage, activityPage, quizPage, planPage][page - 1]()}</main></div></div></div>{!modal && (zoom !== 1 || fullscreen) && <div className="ref-view-toolbar" role="toolbar" aria-label="画面显示控制"><button type="button" aria-label="缩小画面" onClick={() => changeZoom(zoom / 1.25)} disabled={zoom <= .5}><ZoomOut size={20} /></button><output aria-label="画面缩放比例">{Math.round(zoom * 100)}%</output><button type="button" aria-label="放大画面" onClick={() => changeZoom(zoom * 1.25)} disabled={zoom >= maxZoom}><ZoomIn size={20} /></button><button type="button" onClick={() => changeZoom(1)}>适应窗口</button><button type="button" aria-label={fullscreen ? "退出全屏" : "全屏查看"} onClick={toggleFullscreen}>{fullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}</button></div>}{renderModal()}{toast && <div className="ref-toast" role="status"><Info size={18} />{toast}<button aria-label="关闭提示" onClick={() => setToast('')}><X size={16} /></button></div>}</div>;
}
