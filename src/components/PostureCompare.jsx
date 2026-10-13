import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const PRESETS = {
  upright: { label: '有支撑正坐', lean: 0, pelvis: 0, support: true },
  desk: { label: '前倾伏案', lean: 26, pelvis: -7, support: false },
  phone: { label: '瘫坐刷手机', lean: 15, pelvis: -16, support: true },
};
const COLORS = { support: '#6B4C5A', ligament: '#F2C14E', muscle: '#D94838', movement: '#4A90E2' };
const activityAt = minute => (minute >= 45 && minute < 47) || (minute >= 90 && minute < 92);
const activityMinutes = minute => Math.max(0, Math.min(2, minute - 45)) + Math.max(0, Math.min(2, minute - 90));
const css = `
.posture-compare{color:#1d1d1f;font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif;background:#fff;border-radius:24px;overflow:hidden;border:1px solid #e5e5ea}.posture-compare *{box-sizing:border-box}.posture-compare h2,.posture-compare h3,.posture-compare p{margin:0}.pc-heading{padding:30px;text-align:center}.pc-heading h2{font-size:32px;letter-spacing:-.04em;line-height:1.3}.pc-heading p{margin-top:12px;font-size:14px;color:#6e6e73;line-height:1.7}.pc-scenes{display:flex;justify-content:center;gap:9px;flex-wrap:wrap;margin-top:22px}.posture-compare button{font:inherit;font-size:13px;padding:10px 16px;border:1px solid #d2d2d7;border-radius:999px;color:#1d1d1f;background:#fff;cursor:pointer}.posture-compare button[aria-pressed=true]{background:#1d1d1f;color:#fff;border-color:#1d1d1f}.posture-compare button:focus-visible,.posture-compare input:focus-visible{outline:3px solid #7bbaff;outline-offset:3px}.posture-compare .pc-primary{background:#06c;color:#fff;border-color:#06c}.pc-time{margin:0 24px 24px;padding:20px 24px;background:#f5f5f7;border-radius:18px}.pc-time-top{display:flex;align-items:center;justify-content:space-between;gap:15px;flex-wrap:wrap}.pc-time-top strong{font-size:22px}.pc-time input{width:100%;accent-color:#4A90E2;margin:20px 0 10px}.pc-ticks{display:flex;justify-content:space-between;font-size:11px;color:#6e6e73}.pc-time p{font-size:12px;color:#6e6e73;line-height:1.7;margin-top:12px}.pc-panes{display:grid;grid-template-columns:1fr 1fr;gap:16px;padding:0 24px}.pc-pane{background:#f5f5f7;border-radius:18px;overflow:hidden;min-width:0}.pc-pane-title{padding:20px 20px 14px}.pc-pane-title h3{font-size:19px}.pc-pane-title p{font-size:12px;color:#6e6e73;line-height:1.6;margin-top:7px}.pc-stage{height:390px;position:relative;background:linear-gradient(145deg,#fafbfd,#e8edf2)}.pc-canvas{position:absolute;inset:0}.pc-canvas canvas{display:block;touch-action:none}.pc-status{position:absolute;inset:0;display:grid;place-items:center;padding:22px;background:#f5f5f7dd;text-align:center;color:#6e6e73;font-size:13px}.pc-model-caption{position:absolute;bottom:10px;left:12px;right:12px;font-size:10px;color:#6e6e73;pointer-events:none}.pc-state{padding:12px 18px;background:#fff;min-height:57px;font-size:12px;line-height:1.6;border-top:1px solid #e5e5ea}.pc-bill{padding:20px}.pc-bill h4{font-size:14px;margin:0 0 12px}.pc-bill ul{margin:0;padding-left:19px;color:#6e6e73;font-size:13px;line-height:1.9}.pc-intervene{margin-top:16px}.pc-legend{display:flex;gap:16px;flex-wrap:wrap;padding:20px 28px;font-size:11px;color:#6e6e73}.pc-legend i{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:6px}.pc-footer{padding:0 28px 25px;color:#6e6e73;font-size:12px;line-height:1.8}.pc-footer a{color:#06c}.pc-footer .pc-primary{margin-top:15px}.pc-log{margin-top:12px;font-size:12px;color:#06c}.pc-badge{color:#4A90E2;font-weight:600}.pc-reduced{font-size:11px;color:#6e6e73}@media(max-width:760px){.pc-panes{grid-template-columns:1fr;padding:0 14px}.pc-heading{padding:25px 18px}.pc-heading h2{font-size:26px}.pc-time{margin:0 14px 18px;padding:17px}.pc-stage{height:350px}.pc-scenes button{font-size:12px;padding:9px 12px}.pc-legend,.pc-footer{padding-left:18px;padding-right:18px}}
`;

function ModelPane({ preset, pulse, reduced, theme }) {
  const host = useRef(null), live = useRef({ preset, pulse, reduced, theme });
  live.current = { preset, pulse, reduced, theme };
  const [status, setStatus] = useState('loading'), [error, setError] = useState('');
  useEffect(() => {
    const el = host.current;
    let disposed = false, frame, renderer, controls, observer;
    const abort = new AbortController(), scene = new THREE.Scene(), root = new THREE.Group(), aids = new THREE.Group();
    scene.add(root, aids);
    const camera = new THREE.PerspectiveCamera(35, 1, .01, 200);
    const meshes = [], spine = [], pelvic = [], bands = [];
    const axis = new THREE.Vector3(1, 0, 0), center = new THREE.Vector3(), pivot = new THREE.Vector3();
    let scale = 1, ready = false, chair, lastKey = '';
    const add = (geometry, color, position, opacity = 1) => {
      const m = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color, roughness: .65, transparent: opacity < 1, opacity }));
      m.position.set(...position); aids.add(m); return m;
    };
    const fit = () => {
      if (!ready) return;
      const box = new THREE.Box3().setFromObject(root).union(new THREE.Box3().setFromObject(aids));
      const target = box.getCenter(new THREE.Vector3()), size = box.getSize(new THREE.Vector3());
      const half = Math.min(THREE.MathUtils.degToRad(camera.fov / 2), Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect));
      controls.target.copy(target); camera.position.copy(target).addScaledVector(new THREE.Vector3(1, .12, .85).normalize(), size.length() / 2 / Math.sin(half) * 1.1); controls.update();
    };
    const resize = () => {
      if (!renderer || disposed) return;
      const w = Math.max(1, el.clientWidth), h = Math.max(1, el.clientHeight);
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); fit();
    };
    const update = (now) => {
      if (!ready) return;
      const current = live.current, p = PRESETS[current.preset] || PRESETS.upright;
      const progress = current.pulse ? Math.min(1, Math.max(0, (now - current.pulse) / 2000)) : 1;
      const moving = !!current.pulse && progress < 1;
      // Two-second teaching gesture only; source vertices and anatomical volumes stay unchanged.
      const gesture = moving ? current.reduced ? 1 : Math.sin(progress * Math.PI) : 0;
      const lean = THREE.MathUtils.degToRad(p.lean * (1 - gesture)), tilt = THREE.MathUtils.degToRad(p.pelvis * (1 - gesture));
      pelvic.forEach(m => { m.position.copy(m.userData.base).sub(pivot).applyAxisAngle(axis, tilt).add(pivot); m.rotation.set(tilt, 0, 0); });
      spine.forEach((m, i) => { const angle = tilt + lean * (i + 1) / spine.length; m.position.copy(m.userData.base).sub(pivot).applyAxisAngle(axis, angle).add(pivot); m.rotation.set(angle, 0, 0); });
      root.position.copy(center).multiplyScalar(-scale); root.position.y += gesture * .6;
      const top = spine[spine.length - 1].position.clone().sub(center).multiplyScalar(scale); top.y += gesture * .6;
      bands.forEach((m, i) => {
        const x = i < 2 ? (i ? .38 : -.38) : (i === 2 ? -.2 : .2), from = new THREE.Vector3(x, -.7 + gesture * .6, -.25), to = top.clone().add(new THREE.Vector3(x, 0, -.25));
        const d = to.clone().sub(from); m.position.copy(from).add(to).multiplyScalar(.5); m.scale.set(1, d.length(), 1); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
        m.material.color.set(i < 2 ? moving || current.theme === 'activity' ? COLORS.muscle : COLORS.support : COLORS.ligament);
      });
      chair.children[1].visible = p.support;
      const key = `${current.preset}:${moving}:${current.reduced}`;
      if (lastKey !== key) { lastKey = key; fit(); }
    };
    const render = now => { if (disposed) return; update(now); controls.update(); renderer.render(scene, camera); frame = requestAnimationFrame(render); };
    const load = async () => {
      try {
        const r = await fetch('/models/spine.json', { signal: abort.signal }); if (!r.ok) throw Error('模型清单无法读取');
        const manifest = await r.json(), response = await fetch(manifest.binary, { signal: abort.signal }); if (!response.ok) throw Error('模型数据无法读取');
        const buffer = await response.arrayBuffer(); if (disposed) return;
        for (const part of manifest.parts) {
          const pos = new Float32Array(buffer, part.positions, part.vertexCount * 3), normal = new Int16Array(buffer, part.normals, part.vertexCount * 3), indices = new Uint32Array(buffer, part.indices, part.indexCount);
          const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.BufferAttribute(pos.slice(), 3)); geometry.setAttribute('normal', new THREE.BufferAttribute(normal, 3, true)); geometry.setIndex(new THREE.BufferAttribute(indices.slice(), 1)); geometry.computeBoundingBox();
          const base = geometry.boundingBox.getCenter(new THREE.Vector3()); geometry.translate(-base.x, -base.y, -base.z);
          const material = new THREE.MeshStandardMaterial({ color: part.category === 'disc' ? '#c5d5e5' : part.category === 'pelvis' ? '#d7c5a6' : '#e0d0b5', roughness: .65, side: THREE.DoubleSide });
          const mesh = new THREE.Mesh(geometry, material); mesh.position.copy(base); mesh.userData.base = base; root.add(mesh); meshes.push(mesh); (part.category === 'pelvis' ? pelvic : spine).push(mesh);
        }
        spine.sort((a, b) => a.userData.base.y - b.userData.base.y);
        const box = new THREE.Box3().setFromObject(root); box.getCenter(center); scale = 3.6 / (box.max.y - box.min.y); root.scale.setScalar(scale); root.position.copy(center).multiplyScalar(-scale);
        pelvic.forEach(m => pivot.add(m.userData.base)); pivot.multiplyScalar(1 / pelvic.length);
        chair = new THREE.Group(); aids.add(chair);
        for (const [size, pos] of [[[2.9, .12, 2.5], [0, -1.8, .4]], [[2.7, 2, .12], [0, -.8, -.95]], [[.12, 1.2, .12], [-1, -2.4, .4]], [[.12, 1.2, .12], [1, -2.4, .4]]]) chair.attach(add(new THREE.BoxGeometry(...size), '#8894a3', pos, .5));
        for (const x of [-.7, .7]) add(new THREE.CapsuleGeometry(.22, 1.5, 5, 12), '#c7d0dc', [x, -1.4, 1.1], .45).rotation.x = Math.PI / 2;
        for (let i = 0; i < 4; i++) bands.push(add(new THREE.CylinderGeometry(i < 2 ? .07 : .035, i < 2 ? .07 : .035, 1, 12), i < 2 ? COLORS.muscle : COLORS.ligament, [0, 0, 0], .9));
        ready = true; setStatus('ready'); update(performance.now()); fit();
      } catch (e) { if (!disposed && e.name !== 'AbortError') { setError(e.message); setStatus('error'); } }
    };
    const cleanup = () => { disposed = true; abort.abort(); cancelAnimationFrame(frame); observer?.disconnect(); controls?.dispose(); scene.traverse(o => { o.geometry?.dispose(); if (o.material) for (const m of Array.isArray(o.material) ? o.material : [o.material]) m.dispose(); }); renderer?.dispose(); renderer?.domElement.remove(); };
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5)); renderer.setClearColor(0, 0); renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.domElement.setAttribute('role', 'img'); renderer.domElement.setAttribute('aria-label', '真实腰段网格与座椅、教学肌束韧带；拖动旋转，滚轮或双指缩放');
      el.appendChild(renderer.domElement); scene.add(new THREE.HemisphereLight('#ffffff', '#8b9db2', 2.5)); const light = new THREE.DirectionalLight('#ffffff', 3); light.position.set(5, 7, 8); scene.add(light);
      controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.enablePan = false;
      observer = new ResizeObserver(resize); observer.observe(el); resize(); frame = requestAnimationFrame(render); load();
    } catch (e) { cleanup(); setError(e.message); setStatus('error'); }
    return cleanup;
  }, []);
  return <div className="pc-stage"><div className="pc-canvas" ref={host}/><span className="pc-model-caption">真实腰段网格 · 姿势与肌束为教学近似 · 拖动旋转</span>{status !== 'ready' && <div className="pc-status" role={status === 'error' ? 'alert' : 'status'}>{status === 'error' ? `三维暂不可用：${error}。仍可通过下方身体账单比较行为安排。` : '加载真实腰椎与骨盆…'}</div>}</div>;
}

export default function PostureCompare({ onContinue }) {
  const [preset, setPreset] = useState('upright'), [time, setTime] = useState(0), [playing, setPlaying] = useState(false), [pulse, setPulse] = useState(0), [reduced, setReduced] = useState(false), [records, setRecords] = useState([]);
  const previous = useRef(0), pulseTimer = useRef(null);
  useEffect(() => { const media = window.matchMedia('(prefers-reduced-motion: reduce)'); const update = () => setReduced(media.matches); update(); media.addEventListener('change', update); return () => media.removeEventListener('change', update); }, []);
  useEffect(() => {
    const old = previous.current;
    const crossed = [45, 90].some(boundary => old < boundary && time >= boundary);
    if (crossed || (!activityAt(old) && activityAt(time))) {
      clearTimeout(pulseTimer.current); setPulse(performance.now()); pulseTimer.current = setTimeout(() => setPulse(0), 2000);
    }
    previous.current = time;
  }, [time]);
  useEffect(() => () => clearTimeout(pulseTimer.current), []);
  useEffect(() => {
    if (!playing) return;
    let frame, previousFrame;
    const replay = now => { if (previousFrame !== undefined) setTime(value => Math.min(120, value + Math.min(now - previousFrame, 100) / 1000 * 5)); previousFrame = now; frame = requestAnimationFrame(replay); };
    frame = requestAnimationFrame(replay); return () => cancelAnimationFrame(frame);
  }, [playing]);
  useEffect(() => { if (time >= 120) setPlaying(false); }, [time]);
  const elapsed = Math.round(time), active = activityAt(time), plannedMinutes = activityMinutes(time);
  const intervene = () => {
    const record = { atMinute: Number(time.toFixed(1)), durationMinutes: 2, activity: 'walk' };
    const next = [...records, record]; setRecords(next); setPlaying(false);
    try { localStorage.setItem('future-you:posture-interventions', JSON.stringify(next)); } catch {}
    onContinue?.({ elapsedMinutes: Number(time.toFixed(1)), intervention: record, interventions: next });
  };
  return <section className="posture-compare" aria-label="共享时间双屏姿势比较"><style>{css}</style><header className="pc-heading"><h2>同一段学习时间，两种活动安排。</h2><p>选择日常坐姿，再回放持续静坐与计划间歇。<br/>色彩表示教学主题，时间轴只表示行为安排。</p><div className="pc-scenes" role="group" aria-label="日常姿势场景">{Object.entries(PRESETS).map(([id, p]) => <button key={id} aria-pressed={preset === id} onClick={() => setPreset(id)}>{p.label}</button>)}</div></header>
    <div className="pc-time"><div className="pc-time-top"><strong>共享时间 · {elapsed} 分钟</strong><button onClick={() => setPlaying(value => !value)} aria-pressed={playing} disabled={time >= 120}>{playing ? '暂停回放' : '播放回放'}</button>{time >= 120 && <button onClick={() => { setTime(0); setPlaying(false); setPulse(0); }}>从头回放</button>}</div><label><span className="pc-reduced">学习日程进度</span><input type="range" min="0" max="120" step="1" value={time} onChange={e => { setPlaying(false); setTime(Number(e.target.value)); }} aria-label="共享学习时间，0到120分钟"/></label><div className="pc-ticks"><span>0′</span><span>45′ 活动2′</span><span>90′ 活动2′</span><span>120′</span></div><p>回放速度：每秒约5分钟日程。右侧在45与90分钟安排2分钟活动；时点是示例，不是医学安全阈值。{reduced && ' 已尊重减少动画设置：活动以静态姿势和文字提示。'}</p></div>
    <div className="pc-panes"><article className="pc-pane"><header className="pc-pane-title"><h3>持续坐着</h3><p>{PRESETS[preset].label} · 同一姿势场景持续回放</p></header><ModelPane preset={preset} pulse={0} reduced={reduced} theme="support"/><div className="pc-state">已回放 {elapsed} 分钟行为。时间变化不会改变椎间盘形状或计算疲劳。</div><div className="pc-bill"><h4>身体账单 · 观察与机会</h4><ul><li>持续支撑：腰椎、骨盆与躯干肌参与姿势维持。</li><li>活动机会少：这份安排尚未插入走动。</li><li>保持一个姿势后可能僵硬或不适，个体感受不同。</li></ul><button className="pc-primary pc-intervene" onClick={intervene}>现在安排2分钟走动</button>{records.length > 0 && <p className="pc-log" role="status">已记录第{records.length}次干预：在{records[records.length - 1].atMinute}分钟安排走动，已过时间保留。</p>}</div></article>
    <article className="pc-pane"><header className="pc-pane-title"><h3>计划活动间歇</h3><p>相同坐姿起点 · 每45分钟安排2分钟起身活动</p></header><ModelPane preset={preset} pulse={pulse} reduced={reduced} theme="activity"/><div className="pc-state" role="status">{pulse ? <span className="pc-badge">{reduced ? '活动提示：起身舒展（静态展示）' : '正在回放起身舒展 · 约2秒教学动画'}</span> : active ? '日程处于计划活动时段。' : '继续学习，等待下一次计划活动。'}<br/>本段已安排活动 {plannedMinutes.toFixed(1)} 分钟；这是日程分钟，不是身体改善量。</div><div className="pc-bill"><h4>身体账单 · 观察与机会</h4><ul><li>改变姿势：从座椅支撑切换到起身与舒展。</li><li>肌群参与：躯干与下肢共同参与活动。</li><li>增加活动机会：45–47与90–92分钟留下行动空间。</li><li>活动不会让疲劳“清零”，也不能保证抵消久坐风险。</li></ul></div></article></div>
    <div className="pc-legend">{[[COLORS.support,'持续支撑主题'],[COLORS.ligament,'辅助韧带示意'],[COLORS.muscle,'辅助肌束示意'],[COLORS.movement,'活动主题']].map(([color,label])=><span key={label}><i style={{background:color}}/>{label}</span>)}</div><footer className="pc-footer"><p>模型为教学示意，展示支撑关系与活动安排，不用于医学诊断。</p><details><summary>科学与模型说明</summary><p>真实参考网格来自 BodyParts3D / Human Atlas（CC BY 4.0）；坐姿、肌束和韧带为辅助教学近似。网格仅作刚体旋转与平移，不缩小椎间盘，不模拟病理变形、失水或个人受力。</p><p>较多久坐与长期心血管和代谢健康不良结局有关联；单次姿势和日程输入不能用于个体诊断。<a href="https://www.who.int/news-room/fact-sheets/detail/physical-activity" target="_blank" rel="noreferrer"> WHO资料 ↗</a> · <a href="/models/ATTRIBUTION.md" target="_blank" rel="noreferrer">模型署名 ↗</a></p></details><button className="pc-primary" onClick={() => onContinue?.({ elapsedMinutes: Number(time.toFixed(1)), interventions: records })}>去04安排我的活动间歇 →</button></footer>
  </section>;
}
