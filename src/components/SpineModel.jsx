import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const PARTS = [
  ['vertebra', '腰椎'], ['disc', '椎间盘'], ['pelvis', '骶骨与骨盆'], ['muscle', '教学肌束'],
];
const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));
const COLORS = { vertebra: 0xe8d7b5, disc: 0x76c8c0, pelvis: 0xd6c49e, muscle: 0xb96f65, support: 0x536b68 };

// All meshes below are original teaching primitives, not anatomical mesh deformation.
function buildModel(scene) {
  const root = new THREE.Group();
  scene.add(root);
  const pickable = [];
  const materials = [];
  const mesh = (geometry, category, parent, position = [0, 0, 0]) => {
    const material = new THREE.MeshStandardMaterial({
      color: COLORS[category], roughness: 0.65, metalness: 0.02,
      emissive: 0x000000, side: THREE.DoubleSide,
    });
    materials.push(material);
    const item = new THREE.Mesh(geometry, material);
    item.position.set(...position);
    item.userData.category = category;
    parent.add(item);
    if (category !== 'support') pickable.push(item);
    return item;
  };
  const ellipsoid = (category, parent, position, scale) => {
    const item = mesh(new THREE.SphereGeometry(1, 24, 16), category, parent, position);
    item.scale.set(...scale);
    return item;
  };
  const vertebrae = Array.from({ length: 5 }, () => {
    const group = new THREE.Group();
    root.add(group);
    const body = mesh(new THREE.CylinderGeometry(0.68, 0.72, 0.48, 32), 'vertebra', group, [0, 0, 0.19]);
    body.scale.z = 0.78;
    const arch = mesh(new THREE.TorusGeometry(0.43, 0.13, 10, 28), 'vertebra', group, [0, 0, -0.52]);
    arch.rotation.x = Math.PI / 2;
    arch.scale.set(1, 1.13, 1);
    ellipsoid('vertebra', group, [0, 0, -1.02], [0.14, 0.15, 0.38]);
    for (const side of [-1, 1]) {
      const process = ellipsoid('vertebra', group, [side * 0.8, 0, -0.32], [0.43, 0.13, 0.17]);
      process.rotation.y = side * 0.18;
    }
    return group;
  });
  const discs = Array.from({ length: 4 }, () => {
    const group = new THREE.Group();
    root.add(group);
    const ring = mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.19, 32), 'disc', group, [0, 0, 0.19]);
    ring.scale.z = 0.77;
    return group;
  });

  const pelvicRoot = new THREE.Group();
  root.add(pelvicRoot);
  const sacrum = new THREE.Group();
  pelvicRoot.add(sacrum);
  const sacralBody = mesh(new THREE.CylinderGeometry(0.62, 0.24, 1.15, 5), 'pelvis', sacrum);
  sacralBody.rotation.x = -0.2;
  for (const side of [-1, 1]) {
    ellipsoid('pelvis', sacrum, [side * 0.55, 0.33, 0], [0.48, 0.23, 0.29]);
  }
  const wings = [-1, 1].map((side) => {
    const group = new THREE.Group();
    pelvicRoot.add(group);
    const shape = new THREE.Shape();
    shape.moveTo(0.5, 0.15);
    shape.bezierCurveTo(0.78, 0.72, 1.35, 1.02, 1.97, 0.6);
    shape.bezierCurveTo(2.3, 0.15, 1.91, -0.4, 1.45, -0.48);
    shape.bezierCurveTo(1.5, -0.94, 1.11, -1.25, 0.68, -0.96);
    shape.bezierCurveTo(0.42, -0.7, 0.34, -0.2, 0.5, 0.15);
    const hole = new THREE.Path();
    hole.absellipse(0.99, -0.63, 0.23, 0.25, 0, Math.PI * 2, true, 0);
    shape.holes.push(hole);
    const wing = mesh(new THREE.ExtrudeGeometry(shape, {
      depth: 0.3, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.1, bevelThickness: 0.08, curveSegments: 16,
    }), 'pelvis', group, [0, 0, -0.18]);
    wing.scale.x = side;
    wing.rotation.y = -side * 0.23;
    return group;
  });

  const muscleGroups = [-1, 1].map(() => {
    const group = new THREE.Group();
    root.add(group);
    for (let i = 0; i < 5; i += 1) {
      mesh(new THREE.CylinderGeometry(0.12, 0.16, 1, 12), 'muscle', group);
    }
    return group;
  });
  const supportGroup = new THREE.Group();
  root.add(supportGroup);
  const seat = mesh(new THREE.BoxGeometry(4.7, 0.22, 3.25), 'support', supportGroup, [0, -0.97, 0.15]);
  seat.material.roughness = 0.9;
  mesh(new THREE.CylinderGeometry(0.21, 0.3, 1.08, 20), 'support', supportGroup, [0, -1.62, 0.15]);
  mesh(new THREE.CylinderGeometry(1.65, 1.8, 0.14, 32), 'support', supportGroup, [0, -2.23, 0.15]);
  const back = mesh(new THREE.BoxGeometry(3.7, 2.65, 0.2), 'support', supportGroup, [0, 0.18, -1.68]);
  back.rotation.x = -0.09;

  const up = new THREE.Vector3(0, 1, 0);
  const direction = new THREE.Vector3();
  const center = new THREE.Vector3();
  const update = (props) => {
    const spread = clamp(props.explode, 0, 100) / 100;
    const bend = THREE.MathUtils.degToRad(clamp(props.lean, 0, 40));
    const tilt = THREE.MathUtils.degToRad(clamp(props.pelvis, -15, 15));
    const bonesVisible = props.layer !== 'muscles';
    const musclesVisible = props.layer !== 'bones';
    pelvicRoot.position.set(0, 0.18, 0);
    pelvicRoot.rotation.x = tilt;
    pelvicRoot.visible = bonesVisible;
    sacrum.position.set(0, 0, -spread * 0.25);
    wings.forEach((wing, i) => wing.position.set((i === 0 ? -1 : 1) * spread * 0.95, -spread * 0.16, 0));
    let joint = new THREE.Vector3(0, 0.78, 0).applyAxisAngle(new THREE.Vector3(1, 0, 0), tilt);
    joint.add(pelvicRoot.position);
    const nodes = [joint.clone()];
    vertebrae.forEach((vertebra, index) => {
      // Integrate each joint along its own orientation; the chain actually bends.
      const angle = tilt + bend * ((index + 1) / 5) - 0.045 * Math.sin(index / 4 * Math.PI);
      direction.set(0, Math.cos(angle), Math.sin(angle));
      const gap = 0.7 + spread * 0.53;
      center.copy(joint).addScaledVector(direction, gap / 2);
      vertebra.position.copy(center);
      vertebra.rotation.x = angle;
      vertebra.visible = bonesVisible;
      joint = joint.clone().addScaledVector(direction, gap);
      nodes.push(joint.clone());
      if (index < 4) {
        discs[index].position.copy(joint).add(new THREE.Vector3(0, 0, spread * 0.43));
        discs[index].rotation.x = angle;
        discs[index].visible = bonesVisible;
      }
    });
    muscleGroups.forEach((group, sideIndex) => {
      group.visible = musclesVisible;
      const side = sideIndex === 0 ? -1 : 1;
      group.children.forEach((segment, index) => {
        const start = nodes[index].clone();
        const end = nodes[index + 1].clone();
        const offset = side * (0.87 + spread * 0.92);
        start.x += offset;
        end.x += offset;
        start.z -= 0.68;
        end.z -= 0.68;
        direction.subVectors(end, start);
        segment.position.copy(start).add(end).multiplyScalar(0.5);
        segment.scale.set(1 + Math.sin((index + 0.5) / 5 * Math.PI) * 0.3, direction.length() + 0.07, 1);
        segment.quaternion.setFromUnitVectors(up, direction.normalize());
      });
    });
    supportGroup.visible = Boolean(props.support);
    supportGroup.position.y = -spread * 0.6;
    pickable.forEach((item) => {
      const active = item.userData.category === props.selected;
      item.material.emissive.setHex(active ? 0x54786f : 0x000000);
      item.material.emissiveIntensity = active ? 0.48 : 0;
      item.material.color.setHex(active ? 0xf0ca77 : COLORS[item.userData.category]);
    });
  };
  return { root, pickable, materials, update };
}

/** Original simplified geometry for teaching; not a biomechanical calculation. */
export default function SpineModel({
  explode = 0, lean = 0, pelvis = 0, support = true,
  layer = 'all', selected = 'vertebra', onSelect,
}) {
  const hostRef = useRef(null);
  const runtimeRef = useRef(null);
  const propsRef = useRef(null);
  const [failed, setFailed] = useState(false);
  propsRef.current = { explode, lean, pelvis, support, layer, selected, onSelect };

  useEffect(() => {
    const host = hostRef.current;
    let renderer;
    let controls;
    let scene;
    let observer;
    let frame = 0;
    let stopped = false;
    let removeEvents = () => {};
    const dispose = () => {
      stopped = true;
      cancelAnimationFrame(frame);
      observer?.disconnect();
      removeEvents();
      controls?.dispose();
      const geometries = new Set();
      const materials = new Set();
      scene?.traverse((object) => {
        if (object.geometry) geometries.add(object.geometry);
        if (object.material) {
          (Array.isArray(object.material) ? object.material : [object.material]).forEach((material) => materials.add(material));
        }
      });
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      renderer?.dispose();
      renderer?.domElement.remove();
      runtimeRef.current = null;
    };
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      const canvas = renderer.domElement;
      canvas.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;';
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', '可旋转的腰椎教学模型：五枚腰椎、四枚椎间盘、骶骨、左右骨盆、两侧肌束及座椅支撑。可使用下方按钮选择部件。');
      host.appendChild(canvas);
      scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
      camera.position.set(7.7, 5.5, 11.8);
      controls = new OrbitControls(camera, canvas);
      controls.target.set(0, 2.1, 0);
      controls.enableDamping = true;
      controls.dampingFactor = 0.075;
      controls.enablePan = false;
      controls.minDistance = 6;
      controls.maxDistance = 24;
      controls.maxPolarAngle = Math.PI * 0.88;
      controls.update();
      controls.saveState();
      scene.add(new THREE.HemisphereLight(0xffffff, 0x68877b, 2.3));
      const key = new THREE.DirectionalLight(0xfff5e0, 3.3);
      key.position.set(5, 8, 7);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xc5eee5, 1.7);
      rim.position.set(-5, 4, -5);
      scene.add(rim);
      const model = buildModel(scene);
      model.update(propsRef.current);
      const resize = () => {
        const width = Math.max(1, host.clientWidth);
        const height = Math.max(1, host.clientHeight);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };
      resize();
      if (typeof ResizeObserver !== 'undefined') {
        observer = new ResizeObserver(resize);
        observer.observe(host);
      }
      window.addEventListener('resize', resize);
      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();
      let press = null;
      const pointerDown = (event) => {
        press = event.isPrimary !== false && event.button === 0
          ? { x: event.clientX, y: event.clientY, id: event.pointerId } : null;
      };
      const pointerCancel = () => { press = null; };
      const pointerUp = (event) => {
        const origin = press;
        press = null;
        if (!origin || origin.id !== event.pointerId || Math.hypot(event.clientX - origin.x, event.clientY - origin.y) > 5) return;
        const bounds = canvas.getBoundingClientRect();
        if (!bounds.width || !bounds.height) return;
        pointer.set((event.clientX - bounds.left) / bounds.width * 2 - 1, -(event.clientY - bounds.top) / bounds.height * 2 + 1);
        scene.updateMatrixWorld(true);
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObjects(model.pickable, false).find(({ object }) => {
          for (let node = object; node; node = node.parent) if (!node.visible) return false;
          return true;
        });
        if (hit) propsRef.current.onSelect?.(hit.object.userData.category);
      };
      const contextLost = (event) => {
        event.preventDefault();
        stopped = true;
        cancelAnimationFrame(frame);
        setFailed(true);
      };
      canvas.addEventListener('pointerdown', pointerDown);
      canvas.addEventListener('pointerup', pointerUp);
      canvas.addEventListener('pointercancel', pointerCancel);
      canvas.addEventListener('webglcontextlost', contextLost);
      removeEvents = () => {
        window.removeEventListener('resize', resize);
        canvas.removeEventListener('pointerdown', pointerDown);
        canvas.removeEventListener('pointerup', pointerUp);
        canvas.removeEventListener('pointercancel', pointerCancel);
        canvas.removeEventListener('webglcontextlost', contextLost);
      };
      runtimeRef.current = { update: model.update, reset: () => controls.reset() };
      setFailed(false);
      const render = () => {
        if (stopped) return;
        controls.update();
        renderer.render(scene, camera);
        frame = requestAnimationFrame(render);
      };
      render();
    } catch {
      dispose();
      setFailed(true);
    }
    return dispose;
  }, []);

  useEffect(() => {
    runtimeRef.current?.update(propsRef.current);
  }, [explode, lean, pelvis, support, layer, selected]);

  const hiddenPart = (part) => (layer === 'bones' && part === 'muscle') || (layer === 'muscles' && part !== 'muscle');
  const selectedLabel = PARTS.find(([part]) => part === selected)?.[1] || '无';
  const buttonStyle = {
    border: '1px solid #b6c8c1', borderRadius: 16, padding: '7px 11px',
    font: 'inherit', fontSize: 12, cursor: 'pointer', color: '#284d43', background: '#f4f7f3',
  };
  return (
    <figure style={{ margin: 0, width: '100%', color: '#36554a' }}>
      <div style={{ position: 'relative', width: '100%', height: 'clamp(300px, 48vw, 510px)', minHeight: 300, borderRadius: 18, overflow: 'hidden', background: 'radial-gradient(ellipse at 50% 45%, #f7f7ee 0%, #e7eee6 75%)' }}>
        <div ref={hostRef} style={{ position: 'absolute', inset: 0, visibility: failed ? 'hidden' : 'visible' }} />
        <span style={{ position: 'absolute', top: 14, left: 16, fontSize: 11, letterSpacing: '0.08em', pointerEvents: 'none' }}>原创几何 · 腰椎教学示意</span>
        <button type="button" onClick={() => runtimeRef.current?.reset()} disabled={failed} aria-label="复位模型镜头" style={{ ...buttonStyle, position: 'absolute', right: 12, top: 10, opacity: failed ? 0.5 : 1 }}>复位镜头</button>
        {failed && (
          <div role="status" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 36, textAlign: 'center', lineHeight: 1.8 }}>
            <p>3D 视图暂不可用，浏览器未能启用 WebGL 或图形连接已中断。<br />模型包含五枚腰椎、四枚椎间盘、骶骨与左右骨盆、两侧教学肌束及座椅支撑。仍可通过下方按钮选择部件。</p>
          </div>
        )}
        {!failed && <span style={{ position: 'absolute', bottom: 12, left: 16, fontSize: 11, pointerEvents: 'none' }}>拖动旋转 · 滚轮或双指缩放 · 点击选择</span>}
      </div>
      <div role="group" aria-label="选择教学模型部件" style={{ display: 'flex', flexWrap: 'wrap', gap: 7, paddingTop: 12 }}>
        {PARTS.map(([part, label]) => (
          <button key={part} type="button" aria-pressed={selected === part} disabled={hiddenPart(part)} onClick={() => onSelect?.(part)} style={{ ...buttonStyle, background: selected === part ? '#e7c782' : buttonStyle.background, opacity: hiddenPart(part) ? 0.45 : 1, cursor: hiddenPart(part) ? 'default' : 'pointer' }}>{label}</button>
        ))}
      </div>
      <figcaption style={{ marginTop: 10, fontSize: 11, lineHeight: 1.7, color: '#62756c' }}>
        原创简化几何教学示意，非真实解剖比例，非生物力学计算；肌束仅表示位置与走向。腰椎由下至上为 L5–L1，四枚椎间盘位于相邻腰椎之间。前倾与骨盆角度改变关节链形态，拆解参数拉开部件；座椅仅示意支撑位置。
        <span role="status" aria-live="polite" style={{ display: 'block' }}>当前选择：{selectedLabel}。拆解 {Math.round(clamp(explode, 0, 100))}%，前倾 {Math.round(clamp(lean, 0, 40))}°，骨盆 {Math.round(clamp(pelvis, -15, 15))}°；{layer === 'bones' ? '骨骼层' : layer === 'muscles' ? '肌束层' : '全部层'}，座椅支撑{support ? '显示' : '隐藏'}。</span>
      </figcaption>
    </figure>
  );
}
