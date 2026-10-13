import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {assetUrl} from '../lib/asset-url.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const CATEGORY = { vertebra: '腰椎', disc: '椎间盘', pelvis: '骨盆与骶骨', muscle: '肌肉' };
const COLORS = { vertebra: 0xe3d6bc, disc: 0x93b9dc, pelvis: 0xdbcfb9, muscle: 0xc88582 };
const caption = part => part.label || part.name || part.id;
const clampExplode = value => Math.max(0, Math.min(100, Number(value) || 0)) / 100;
const styles = `
.real-spine{width:100%;color:#253246;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#fff;border:1px solid #e7eaf0;border-radius:22px;overflow:hidden;box-sizing:border-box}
.real-spine *{box-sizing:border-box}.real-spine button,.real-spine input{font:inherit}.real-spine button{background:#f4f6f9;border:1px solid #e2e6ed;border-radius:10px;color:#34445a;padding:8px 12px;cursor:pointer;line-height:1.35}.real-spine button:hover{background:#e8eff9}.real-spine button:disabled{opacity:.42;cursor:default}.real-spine button[aria-pressed=true]{background:#e7f0ff;border-color:#9abcf4;color:#185cb9}.real-spine :focus-visible{outline:3px solid #4285ed;outline-offset:2px}
.real-spine-toolbar{display:flex;flex-wrap:wrap;gap:7px;padding:14px 16px;border-bottom:1px solid #edf0f5}.real-spine-stage{height:470px;width:100%;position:relative;background:linear-gradient(160deg,#fafbfd,#eef2f7);overflow:hidden}.real-spine-canvas{height:100%;width:100%}.real-spine-canvas canvas{display:block;touch-action:none;outline-offset:-4px!important}.real-spine-labels{position:absolute;inset:0;pointer-events:none;overflow:hidden}.real-spine-label{position:absolute;top:0;left:0;padding:4px 7px;border:1px solid #d8e0ed;background:rgba(255,255,255,.92);border-radius:7px;font-size:11px;color:#34445a;white-space:nowrap;box-shadow:0 2px 6px #2532460c}.real-spine-label.is-selected{border-color:#6096e9;color:#185cb9}.real-spine-hint{position:absolute;bottom:12px;left:14px;margin:0;color:#718096;font-size:11px;pointer-events:none}.real-spine-status{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:24px;background:#f6f8fbe8;text-align:center;color:#61718a}.real-spine-bottom{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:18px;padding:16px}.real-spine-search{display:block;width:100%;padding:10px 12px;border:1px solid #dfe5ee;background:#f8f9fc;border-radius:11px;color:#253246}.real-spine-list{display:flex;flex-direction:column;gap:5px;max-height:180px;overflow:auto;margin-top:9px;padding:2px}.real-spine-list button{text-align:left;display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:12px}.real-spine-list small{color:#78869a;flex-shrink:0}.real-spine-detail h3{margin:0 0 8px;font-size:16px}.real-spine-detail dl{margin:0;font-size:12px;line-height:1.65;overflow-wrap:anywhere}.real-spine-detail dt{color:#7a879a;margin-top:5px}.real-spine-detail dd{margin:0}.real-spine-empty{color:#7a879a;font-size:12px}.real-spine-credit{padding:0 16px 14px;font-size:11px;color:#7a879a;line-height:1.6}.real-spine-credit a{color:#5278ad}.real-spine-detail p{font-size:11px;color:#7a879a;line-height:1.6;margin:10px 0 0}@media(max-width:560px){.real-spine-toolbar{padding:10px;gap:5px}.real-spine button{padding:7px 9px;font-size:12px}.real-spine-bottom{grid-template-columns:1fr;gap:14px;padding:12px}.real-spine-list{max-height:140px}.real-spine-label{font-size:10px}.real-spine-credit{padding:0 12px 12px}}
`;

export default function RealSpineViewer({ explode = 0, selected = 'vertebra', onSelect }) {
  const host = useRef(null);
  const engine = useRef(null);
  const labelsRef = useRef(new Map());
  const selectCallback = useRef(onSelect);
  const selectionRef = useRef(null);
  const [parts, setParts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [hidden, setHidden] = useState(() => new Set());
  const [isolated, setIsolated] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
  const [notice, setNotice] = useState('');
  selectCallback.current = onSelect;
  selectionRef.current = selectedId;
  const active = parts.find(part => part.id === selectedId);

  function choose(part) {
    setSelectedId(part.id);
    selectCallback.current?.(part.category);
  }

  useEffect(() => {
    const current = parts.find(part => part.id === selectionRef.current);
    if (current?.category === selected) return;
    setSelectedId((parts.find(part => part.category === selected) || parts[0])?.id ?? null);
  }, [parts, selected]);

  useEffect(() => {
    const container = host.current;
    if (!container) return undefined;
    let disposed = false;
    let renderer, controls, observer, frame;
    const abort = new AbortController();
    const scene = new THREE.Scene();
    const root = new THREE.Group();
    const meshes = [];
    scene.add(root);
    const camera = new THREE.PerspectiveCamera(38, 1, 0.01, 200);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x8b9cb3, 2.4));
    const light = new THREE.DirectionalLight(0xffffff, 3.1);
    light.position.set(5, 8, 9);
    scene.add(light);
    const fill = new THREE.DirectionalLight(0xdbe8ff, 1.5);
    fill.position.set(-6, 2, -7);
    scene.add(fill);
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let press = null;
    const pointers = new Set();
    const projected = new THREE.Vector3();
    const screenBounds = new THREE.Box3();
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();

    function fit(view) {
      if (!meshes.length || !controls || !renderer) return;
      screenBounds.makeEmpty();
      root.updateMatrixWorld(true);
      meshes.filter(mesh => mesh.visible).forEach(mesh => screenBounds.expandByObject(mesh));
      if (screenBounds.isEmpty()) meshes.forEach(mesh => screenBounds.expandByObject(mesh));
      screenBounds.getCenter(center);
      screenBounds.getSize(size);
      const direction = camera.position.clone().sub(controls.target).normalize();
      if (view === 'front') direction.set(0, 0, 1);
      if (view === 'back') direction.set(0, 0, -1);
      if (view === 'side') direction.set(1, 0, 0);
      if (!direction.lengthSq()) direction.set(0, 0, 1);
      // A bounding sphere fits every orbit angle, including the full exploded view.
      const radius = Math.max(size.length() / 2, 0.25);
      const vertical = THREE.MathUtils.degToRad(camera.fov / 2);
      const horizontal = Math.atan(Math.tan(vertical) * camera.aspect);
      const distance = radius / Math.sin(Math.min(vertical, horizontal)) * 1.14;
      controls.target.copy(center);
      camera.position.copy(center).addScaledVector(direction, distance);
      camera.near = Math.max(0.005, distance / 1000);
      camera.far = Math.max(100, distance + radius * 10);
      camera.updateProjectionMatrix();
      controls.minDistance = radius * 0.3;
      controls.maxDistance = distance * 5;
      controls.update();
    }
    function resize() {
      const width = Math.max(container.clientWidth, 1);
      const height = Math.max(container.clientHeight, 1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      fit();
    }
    function down(event) {
      pointers.add(event.pointerId);
      if (pointers.size > 1) { press = null; return; }
      press = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false, time: performance.now() };
    }
    function move(event) {
      if (press && Math.hypot(event.clientX - press.x, event.clientY - press.y) > 6) press.moved = true;
    }
    function cancel(event) { pointers.delete(event.pointerId); press = null; }
    function up(event) {
      pointers.delete(event.pointerId);
      const start = press;
      press = null;
      if (!start || start.id !== event.pointerId || start.moved || performance.now() - start.time > 650 || event.button > 0) return;
      if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 6) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(meshes.filter(mesh => mesh.visible), false)[0];
      if (hit) {
        const part = hit.object.userData.part;
        setSelectedId(part.id);
        selectCallback.current?.(part.category);
      }
    }
    function render() {
      if (disposed) return;
      controls.update();
      renderer.render(scene, camera);
      meshes.forEach(mesh => {
        const node = labelsRef.current.get(mesh.userData.part.id);
        if (!node) return;
        mesh.getWorldPosition(projected);
        projected.project(camera);
        const visible = mesh.visible && projected.z > -1 && projected.z < 1 && Math.abs(projected.x) < 1 && Math.abs(projected.y) < 1;
        node.style.display = visible ? 'block' : 'none';
        node.style.transform = `translate(${(projected.x + 1) * container.clientWidth / 2}px,${(1 - projected.y) * container.clientHeight / 2}px) translate(-50%,-50%)`;
      });
      frame = requestAnimationFrame(render);
    }
    async function load() {
      try {
        const response = await fetch(assetUrl('/models/spine.json'), { signal: abort.signal });
        if (!response.ok) throw new Error(`模型清单请求失败（${response.status}）`);
        const manifest = await response.json();
        if (!Array.isArray(manifest.parts) || !manifest.parts.length || !manifest.binary) throw new Error('模型清单缺少 binary 或 parts');
        const binaryResponse = await fetch(assetUrl(manifest.binary), { signal: abort.signal });
        if (!binaryResponse.ok) throw new Error(`模型数据请求失败（${binaryResponse.status}）`);
        const buffer = await binaryResponse.arrayBuffer();
        if (disposed) return;
        const ids = new Set();
        manifest.parts.forEach(part => {
          if (part.id == null || ids.has(part.id) || !CATEGORY[part.category]) throw new Error('模型部件 ID 或分类无效');
          ids.add(part.id);
          const vertexCount = Number(part.vertexCount), indexCount = Number(part.indexCount);
          if (!Number.isInteger(vertexCount) || vertexCount < 3 || !Number.isInteger(indexCount) || indexCount < 3 || indexCount % 3) throw new Error(`部件 ${part.id} 的网格计数无效`);
          function attribute(Type, offset, count) {
            const start = typeof offset === 'object' && offset !== null ? offset.byteOffset : offset;
            if (!Number.isInteger(start) || start < 0 || start % Type.BYTES_PER_ELEMENT || start + count * Type.BYTES_PER_ELEMENT > buffer.byteLength) throw new Error(`部件 ${part.id} 的缓冲区偏移无效`);
            return new Type(buffer, start, count);
          }
          const positions = attribute(Float32Array, part.positions, vertexCount * 3);
          const normals = attribute(Int16Array, part.normals, vertexCount * 3);
          const indices = attribute(Uint32Array, part.indices, indexCount);
          if (!positions.every(Number.isFinite) || indices.some(index => index >= vertexCount)) throw new Error(`部件 ${part.id} 的坐标或索引无效`);
          const geometry = new THREE.BufferGeometry();
          // Copy positions: geometry.center() must not mutate the shared source buffer.
          geometry.setAttribute('position', new THREE.BufferAttribute(positions.slice(), 3));
          geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3, true));
          geometry.setIndex(new THREE.BufferAttribute(indices, 1));
          geometry.computeBoundingBox();
          const originalCenter = geometry.boundingBox.getCenter(new THREE.Vector3());
          geometry.translate(-originalCenter.x, -originalCenter.y, -originalCenter.z);
          geometry.computeBoundingSphere();
          const material = new THREE.MeshStandardMaterial({ color: COLORS[part.category], roughness: 0.62, metalness: 0.02, side: THREE.DoubleSide });
          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.copy(originalCenter);
          mesh.userData = { part, originalCenter, offset: new THREE.Vector3() };
          meshes.push(mesh);
          root.add(mesh);
        });
        const bounds = new THREE.Box3().setFromObject(root);
        const originalHeight = bounds.max.y - bounds.min.y;
        if (!Number.isFinite(originalHeight) || originalHeight <= 0) throw new Error('模型高度无效');
        const scale = 5 / originalHeight;
        const originalCenter = bounds.getCenter(new THREE.Vector3());
        root.scale.setScalar(scale);
        root.position.copy(originalCenter).multiplyScalar(-scale);
        const spine = meshes.filter(mesh => ['vertebra', 'disc'].includes(mesh.userData.part.category)).sort((a, b) => a.userData.originalCenter.y - b.userData.originalCenter.y);
        let previousTop = meshes.filter(mesh => mesh.userData.part.category === 'pelvis').reduce((top, mesh) => Math.max(top, mesh.geometry.boundingBox.max.y + mesh.userData.originalCenter.y), -Infinity);
        if (!Number.isFinite(previousTop)) previousTop = null;
        spine.forEach(mesh => {
          const box = mesh.geometry.boundingBox;
          const originalBottom = box.min.y + mesh.userData.originalCenter.y;
          const originalTop = box.max.y + mesh.userData.originalCenter.y;
          const offset = previousTop === null ? 0 : Math.max(0, previousTop + 0.2 / scale - originalBottom);
          mesh.userData.offset.y = offset;
          previousTop = originalTop + offset;
        });
        const pelvis = meshes.filter(mesh => mesh.userData.part.category === 'pelvis');
        const pelvisMiddle = pelvis.length ? pelvis.reduce((sum, mesh) => sum + mesh.userData.originalCenter.x, 0) / pelvis.length : originalCenter.x;
        pelvis.forEach(mesh => {
          const text = `${mesh.userData.part.id} ${mesh.userData.part.name} ${mesh.userData.part.label || ''}`;
          const sacrum = /sacrum|sacral|coccyx|骶|尾骨/i.test(text);
          if (sacrum) return;
          const delta = mesh.userData.originalCenter.x - pelvisMiddle;
          if (Math.abs(delta) > originalHeight * 0.01) mesh.userData.offset.x = Math.sign(delta) * 1.65 / scale;
        });
        setParts(manifest.parts.map(part => ({ ...part, source: part.source || manifest.source || 'BodyParts3D' })));
        setStatus('ready');
        fit('front');
      } catch (failure) {
        if (disposed || failure.name === 'AbortError') return;
        setError(failure.message || '无法读取真实解剖模型');
        setStatus('error');
      }
    }
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setClearColor(0xffffff, 0);
      renderer.domElement.setAttribute('aria-label', '真实腰椎与骨盆三维模型；拖动旋转，双指缩放，点击选择部件。也可使用下方部件列表。');
      renderer.domElement.setAttribute('role', 'img');
      renderer.domElement.tabIndex = 0;
      container.appendChild(renderer.domElement);
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.enablePan = true;
      camera.position.set(0, 0, 12);
      engine.current = { meshes, root, scene, renderer, camera, controls, fit };
      renderer.domElement.addEventListener('pointerdown', down);
      renderer.domElement.addEventListener('pointermove', move);
      renderer.domElement.addEventListener('pointerup', up);
      renderer.domElement.addEventListener('pointercancel', cancel);
      observer = new ResizeObserver(resize);
      observer.observe(container);
      resize();
      render();
      load();
    } catch (failure) {
      setError(`无法启动三维查看器：${failure.message}`);
      setStatus('error');
    }
    return () => {
      disposed = true;
      abort.abort();
      cancelAnimationFrame(frame);
      observer?.disconnect();
      if (renderer) {
        const canvas = renderer.domElement;
        canvas.removeEventListener('pointerdown', down);
        canvas.removeEventListener('pointermove', move);
        canvas.removeEventListener('pointerup', up);
        canvas.removeEventListener('pointercancel', cancel);
        canvas.remove();
      }
      controls?.dispose();
      meshes.forEach(mesh => { mesh.geometry.dispose(); mesh.material.dispose(); });
      renderer?.dispose();
      renderer?.forceContextLoss();
      if (engine.current?.renderer === renderer) engine.current = null;
    };
  }, []);

  useEffect(() => {
    const current = engine.current;
    if (!current || status !== 'ready') return;
    const fraction = clampExplode(explode);
    current.meshes.forEach(mesh => {
      const part = mesh.userData.part;
      mesh.position.copy(mesh.userData.originalCenter).addScaledVector(mesh.userData.offset, fraction);
      mesh.visible = !hidden.has(part.id) && (!isolated || part.id === selectedId);
      const isSelected = part.id === selectedId;
      mesh.material.color.setHex(isSelected ? 0x75a7e8 : COLORS[part.category]);
      mesh.material.emissive.setHex(isSelected ? 0x16417a : 0x000000);
      mesh.material.emissiveIntensity = isSelected ? 0.22 : 0;
    });
    current.fit();
  }, [explode, selectedId, hidden, isolated, status]);

  function screenshot() {
    try {
      const current = engine.current;
      if (!current) return;
      current.controls.update();
      current.renderer.render(current.scene, current.camera);
      const canvas = current.renderer.domElement;
      if (!canvas) return;
      const anchor = document.createElement('a');
      anchor.href = canvas.toDataURL('image/png');
      anchor.download = 'BodyParts3D-spine.png';
      anchor.click();
      setNotice('已下载模型截图（PNG）。');
    } catch { setNotice('截图生成失败，请重试。'); }
  }
  const filtered = parts.filter(part => `${part.label || ''} ${part.name || ''} ${part.id}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  const ready = status === 'ready';
  return <section className="real-spine" aria-label="真实解剖脊柱查看器">
    <style>{styles}</style>
    <div className="real-spine-toolbar" role="group" aria-label="模型显示与镜头控制">
      <button disabled={!ready || !active} aria-pressed={isolated} onClick={() => setIsolated(value => !value)}>隔离选中</button>
      <button disabled={!ready || !active || hidden.has(selectedId)} onClick={() => setHidden(previous => new Set([...previous, selectedId]))}>隐藏选中</button>
      <button disabled={!ready} onClick={() => { setHidden(new Set()); setIsolated(false); }}>显示全部</button>
      <button disabled={!ready} aria-pressed={showLabels} onClick={() => setShowLabels(value => !value)}>标签</button>
      {[['front', '正面'], ['back', '背面'], ['side', '侧面']].map(([view, label]) => <button key={view} disabled={!ready} onClick={() => engine.current?.fit(view)}>{label}</button>)}
      <button disabled={!ready} onClick={() => { setHidden(new Set()); setIsolated(false); setQuery(''); engine.current?.fit('front'); setNotice('已复位镜头与显示；拆解程度由课程滑块控制。'); }}>复位</button>
      <button disabled={!ready} onClick={screenshot}>下载截图</button>
    </div>
    <div className="real-spine-stage">
      <div className="real-spine-canvas" ref={host} />
      <div className="real-spine-labels" aria-hidden="true">{showLabels && parts.map(part => <span key={part.id} ref={node => { if (node) labelsRef.current.set(part.id, node); else labelsRef.current.delete(part.id); }} className={`real-spine-label${part.id === selectedId ? ' is-selected' : ''}`}>{caption(part)}</span>)}</div>
      <p className="real-spine-hint">拖动旋转 · 滚轮 / 双指缩放 · 点击选中</p>
      {status !== 'ready' && <div className="real-spine-status" role={status === 'error' ? 'alert' : 'status'}>{status === 'error' ? `模型加载失败：${error}。请检查 /models/spine.json 与模型二进制文件。` : '正在加载真实腰椎、椎间盘与骨盆网格…'}</div>}
    </div>
    <div className="real-spine-bottom">
      <div><div className="real-spine-list" role="group" aria-label="解剖部件列表">{filtered.map(part => <button key={part.id} aria-pressed={selectedId === part.id} onClick={() => choose(part)}><span>{caption(part)}</span><small>{hidden.has(part.id) ? '已隐藏' : CATEGORY[part.category]}</small></button>)}{ready && !filtered.length && <p className="real-spine-empty">没有匹配的部件</p>}</div></div>
      <div className="real-spine-detail" aria-live="polite">{active ? <><h3>{caption(active)}</h3><p>{active.category==='disc'?'像减震垫：连接相邻椎体，帮助缓冲和分担载荷。':active.category==='pelvis'?'像地基：把躯干与下肢联系起来，参与传递载荷和支撑。':'像叠起来的支撑块：与椎间盘和关节共同支持躯干，并允许一定活动。'}</p><details><summary style={{fontSize:11,cursor:'pointer',color:'#7a879a'}}>学术信息</summary><dl><dt>英文名称 / Name</dt><dd>{active.name || '未提供'}</dd><dt>FMA ID / conceptId</dt><dd>{active.conceptId ?? '清单未提供'}</dd><dt>部件 ID</dt><dd>{active.id}</dd><dt>来源 / Source</dt><dd>{typeof active.source === 'object' ? JSON.stringify(active.source) : active.source || 'BodyParts3D'}</dd></dl></details></> : <p className="real-spine-empty">选择一个部件，查看名称与来源。</p>}<p>真实网格仅作平移拆解，0% 完全恢复原始空间关系。颜色用于辨认部件；复位保留课程拆解滑块的当前值。</p><p role="status">{notice}</p></div>
    </div>
    <div className="real-spine-credit">解剖数据：<a href="https://lifesciencedb.jp/bp3d/" target="_blank" rel="noreferrer">BodyParts3D / Anatomography</a>，© Database Center for Life Science，<a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0 原许可</a>。显示处理：网格居中、整体等比缩放、配色与平移拆解。</div>
  </section>;
}
