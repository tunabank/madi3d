import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { PRESETS } from './presets.js';

const BASE = import.meta.env.BASE_URL;
const LAYERS = ['skin', 'muscle_sup', 'muscle_deep', 'ligament', 'bone']; // 바깥 → 안
const HI_COLOR = new THREE.Color(0xef4444);
const SEL_COLOR = new THREE.Color(0xf59e0b);
const GRAY = new THREE.Color(0x8a9099);

const state = {
  stage: 0, ghost: true, medical: false,
  preset: null, selected: null,
};

// ---------- 렌더러·씬 ----------
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.localClippingEnabled = true;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, 1, 0.01, 10);
scene.add(new THREE.HemisphereLight(0xffffff, 0x404858, 1.6));
const key = new THREE.DirectionalLight(0xffffff, 2.2);
camera.add(key); key.position.set(0.4, 0.6, 0.2);
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 0.15;
controls.maxDistance = 1.4;

// 무릎 주변만 보이도록 위·아래 자르기 (center 기준 ±CLIP)
const CLIP = 0.24;
const clipTop = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
const clipBottom = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

function resize() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize);

// ---------- 색 ----------
function baseColor(layer, mat) {
  if (/^Bone/.test(mat)) return 0xeadfc8;
  if (mat === 'Cartilage') return 0x8ec9e6;
  if (mat === 'Tendon') return 0xe6dfcb;
  if (mat === 'Ligament') return 0xd9c27a;
  if (mat === 'Bursa') return 0xb79ad6;
  if (mat === 'Fat') return 0xf0cf6a;
  if (/^Skin/.test(mat)) return 0xe3ad8f;
  if (layer === 'muscle_sup') return 0xb4483f;
  if (layer === 'muscle_deep') return 0x9a3a4a; // 속근육은 약간 짙은 색
  return 0xcccccc;
}

// ---------- 모델 로드 ----------
const parts = new Map(); // id -> { meta, meshes: [] }
const meshes = [];
const center = new THREE.Vector3();
let radius = 0.5;

const meta = await fetch(`${BASE}models/parts.json`).then(r => r.json());
for (const m of meta) parts.set(m.id, { meta: m, meshes: [] });

const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);
// 일반 배포: knee.glb / Claude 아티팩트 미리보기: .glb를 못 올려서 base64 JSON으로 감싼 파일 사용
async function loadModel() {
  if (import.meta.env.VITE_MODEL_JSON) {
    const { glb } = await fetch(`${BASE}models/knee.glb.json`).then(r => r.json());
    const bytes = Uint8Array.from(atob(glb), c => c.charCodeAt(0));
    return loader.parseAsync(bytes.buffer, '');
  }
  return loader.loadAsync(`${BASE}models/knee.glb`);
}
const gltf = await loadModel();
scene.add(gltf.scene);

gltf.scene.traverse(o => {
  if (!o.isMesh) return;
  let p = o, id = null;
  while (p) { if (parts.has(p.name)) { id = p.name; break; } p = p.parent; }
  if (!id) return;
  const part = parts.get(id);
  const matName = o.material?.name || '';
  const color = new THREE.Color(baseColor(part.meta.layer, matName));
  o.material = new THREE.MeshStandardMaterial({
    color, roughness: part.meta.layer === 'bone' ? 0.75 : 0.55, metalness: 0,
    side: THREE.DoubleSide, clippingPlanes: [clipTop, clipBottom],
  });
  o.userData = { id, layer: part.meta.layer, matName, base: color };
  part.meshes.push(o);
  meshes.push(o);
});

// 무릎 중심 = 연골판 + 십자인대의 중심
{
  const box = new THREE.Box3();
  for (const id of ['Medial_meniscus', 'Lateral_meniscus', 'Anterior_cruciate_ligament', 'Posterior_cruciate_ligament'])
    for (const m of parts.get(id)?.meshes || []) box.expandByObject(m);
  box.getCenter(center);
  radius = 0.5;
  clipTop.constant = center.y + CLIP;
  clipBottom.constant = -(center.y - CLIP);
}
document.getElementById('loading').remove();
resize();

// ---------- 화면 상태 반영 ----------
function refresh() {
  const pr = state.preset;
  const hi = new Set(pr?.highlight || []);
  const hiMat = pr?.highlightMaterial || null;
  const hide = new Set(pr?.hide || []);
  const ghost = new Set(pr?.ghost || []);
  const anyHi = hi.size > 0 || !!hiMat || !!state.selected;

  for (const m of meshes) {
    const { id, layer, matName, base } = m.userData;
    const li = LAYERS.indexOf(layer);
    const mat = m.material;
    let mode = 'solid';
    if (hide.has(id)) mode = 'hidden';
    else if (li < state.stage) // 벗긴 층: 바로 바깥 한 층만 흐리게 남기고 나머지는 숨김
      mode = state.ghost && li === state.stage - 1 ? 'ghost' : 'hidden';
    else if (ghost.has(id)) mode = 'ghost';

    const soft = mode === 'solid' && matName === 'Bursa' && !hi.has(id) && state.selected !== id;
    m.visible = mode !== 'hidden';
    mat.transparent = mode === 'ghost' || soft;
    mat.opacity = mode === 'ghost' ? (layer === 'skin' ? 0.08 : 0.13) : soft ? 0.35 : 1;
    mat.depthWrite = !mat.transparent;
    m.renderOrder = mat.transparent ? 2 : 0;

    const isSel = state.selected === id;
    const isHi = mode === 'solid' && (hi.has(id) || (hiMat && matName === hiMat));
    if (isSel && mode !== 'hidden') {
      mat.color.copy(SEL_COLOR); mat.emissive.set(0x5a3000);
    } else if (isHi) {
      mat.color.copy(HI_COLOR); mat.emissive.set(0x4a0a0a);
    } else {
      mat.emissive.set(0x000000);
      mat.color.copy(base);
      if (anyHi && mode === 'solid') mat.color.lerp(GRAY, 0.45); // 강조 대상 외에는 흐리게
    }
    mat.needsUpdate = true;
  }
  document.querySelectorAll('#stageSeg button').forEach(b =>
    b.classList.toggle('on', +b.dataset.stage === state.stage));
  document.querySelectorAll('.preset').forEach(b =>
    b.classList.toggle('on', b.dataset.id === pr?.id));
}

// ---------- 카메라 ----------
const VIEWS = {
  front: [0.15, 0.1, 1], medial: [1, 0.1, 0.15], lateral: [-1, 0.1, 0.15],
  back: [-0.1, 0.1, -1], top: [0.1, 1, 0.35],
};
let camGoal = null;
const VIEW_DIST = 0.78;
function lookFrom(dir, dist = VIEW_DIST) {
  camGoal = { dir: new THREE.Vector3(...dir).normalize(), dist };
}
// 다리 속을 뚫고 지나가지 않도록 무릎 중심을 기준으로 빙 돌아서 이동
function stepCamera() {
  if (!camGoal) return;
  controls.target.lerp(center, 0.15);
  const off = camera.position.clone().sub(controls.target);
  const d = off.length();
  const dir = off.normalize().lerp(camGoal.dir, 0.12).normalize();
  camera.position.copy(controls.target).addScaledVector(dir, d + (camGoal.dist - d) * 0.12);
  if (dir.angleTo(camGoal.dir) < 0.003 && Math.abs(d - camGoal.dist) < 0.002) camGoal = null;
}
controls.addEventListener('start', () => { camGoal = null; });

// ---------- 정보 카드 ----------
const info = document.getElementById('info');
function showInfo(title, sub, desc) {
  document.getElementById('infoTitle').textContent = title;
  document.getElementById('infoSub').textContent = sub || '';
  document.getElementById('infoDesc').textContent = desc || '';
  info.classList.remove('hidden');
}
function hideInfo() { info.classList.add('hidden'); }
document.getElementById('infoClose').onclick = () => { hideInfo(); state.selected = null; refresh(); };

function partLabel(id) {
  const m = parts.get(id).meta;
  return state.medical ? [m.ko, m.easy] : [m.easy, m.ko];
}

// ---------- 프리셋 ----------
const list = document.getElementById('presetList');
for (const p of PRESETS) {
  const b = document.createElement('button');
  b.className = 'preset'; b.dataset.id = p.id;
  b.innerHTML = `<b>${p.title}</b><small>${p.sub}</small>`;
  b.onclick = () => applyPreset(state.preset?.id === p.id ? null : p);
  list.appendChild(b);
}
function applyPreset(p) {
  state.preset = p; state.selected = null;
  if (p) {
    state.stage = p.stage;
    lookFrom(p.view, p.dist);
    showInfo(p.title, p.sub, p.desc);
  } else hideInfo();
  refresh();
}

// ---------- 컨트롤 ----------
document.querySelectorAll('#stageSeg button').forEach(b => b.onclick = () => {
  state.stage = +b.dataset.stage; refresh();
});
document.getElementById('ghostChk').onchange = e => { state.ghost = e.target.checked; refresh(); };
document.querySelectorAll('[data-view]').forEach(b => b.onclick = () => lookFrom(VIEWS[b.dataset.view]));
const termBtn = document.getElementById('termToggle');
termBtn.onclick = () => {
  state.medical = !state.medical;
  termBtn.textContent = state.medical ? '의학 용어' : '쉬운 말';
  termBtn.classList.toggle('on', state.medical);
  if (state.selected) { const [t, s] = partLabel(state.selected); showInfo(t, s, ''); }
};
document.getElementById('resetBtn').onclick = () => {
  state.stage = 0; state.preset = null; state.selected = null; hideInfo(); refresh(); lookFrom(VIEWS.front);
};
const credit = document.getElementById('credit');
document.getElementById('creditBtn').onclick = () => credit.classList.remove('hidden');
document.getElementById('creditClose').onclick = () => credit.classList.add('hidden');

// ---------- 터치해서 이름 보기 ----------
const ray = new THREE.Raycaster();
let down = null;
canvas.addEventListener('pointerdown', e => { down = [e.clientX, e.clientY]; });
canvas.addEventListener('pointerup', e => {
  if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6) return;
  const r = canvas.getBoundingClientRect();
  ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
  const targets = meshes.filter(m => m.visible && (!m.material.transparent || m.userData.matName === 'Bursa'));
  const hit = ray.intersectObjects(targets, false)
    .find(h => Math.abs(h.point.y - center.y) < CLIP); // 잘려서 안 보이는 부분은 무시
  if (!hit) { state.selected = null; if (!state.preset) hideInfo(); refresh(); return; }
  state.selected = hit.object.userData.id;
  const [t, s] = partLabel(state.selected);
  showInfo(t, s, '');
  refresh();
});

// ---------- 시작 ----------
camera.position.copy(center).add(new THREE.Vector3(0.5, 0.2, 1).normalize().multiplyScalar(VIEW_DIST * 1.3));
controls.target.copy(center);
lookFrom(VIEWS.front);
refresh();
renderer.setAnimationLoop(() => { stepCamera(); controls.update(); renderer.render(scene, camera); });

// 앱 설치(PWA)·오프라인 저장 — 배포 버전에서만, 미리보기 환경에서는 조용히 건너뜀
if (import.meta.env.PROD && !import.meta.env.VITE_MODEL_JSON && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register(`${BASE}sw.js`).catch(() => {});
}

// 테스트·디버그용
window.__knee = { state, applyPreset, refresh, PRESETS, lookFrom, VIEWS, ready: true };
