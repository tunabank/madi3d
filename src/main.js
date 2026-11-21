import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { REGIONS } from './regions/index.js';
import { Posture } from './posture.js';

const BASE = import.meta.env.BASE_URL;
const LAYERS = ['muscle_sup', 'muscle_deep', 'ligament', 'bone']; // 바깥 → 안
const HI_COLOR = new THREE.Color(0xef4444);
const SEL_COLOR = new THREE.Color(0xf59e0b);
const GRAY = new THREE.Color(0x8a9099);

const state = {
  region: null, // 현재 부위 (아래 loaded 항목)
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

function resize() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
resize();

// ---------- 색 ----------
function baseColor(layer, mat) {
  if (/^(Bone|Suture)/.test(mat)) return 0xeadfc8;
  if (mat === 'Teeth') return 0xf6f3ea;
  if (/^(Teeth-roots|Dentine)/.test(mat)) return 0xe8dcc0;
  if (mat === 'White matter') return 0xf2d675; // 척수(신경)
  if (mat === 'Cartilage') return 0x8ec9e6;
  if (mat === 'Tendon') return 0xe6dfcb;
  if (mat === 'Ligament') return 0xd9c27a;
  if (mat === 'Articular capsule') return 0xd8cfb8;
  if (mat === 'Bursa') return 0xb79ad6;
  if (mat === 'Fat') return 0xf0cf6a;
  if (layer === 'muscle_sup') return 0xb4483f;
  if (layer === 'muscle_deep') return 0x9a3a4a; // 속근육은 약간 짙은 색
  return 0xcccccc;
}

// ---------- 부위 모델 로드 ----------
const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);
const loaded = new Map(); // region id -> { cfg, group, parts, meshes, center, planes, softIds }
const loadingEl = document.getElementById('loading');

// 일반 배포: <부위>.glb / Claude 아티팩트 미리보기: .glb를 못 올려서 base64 JSON으로 감싼 파일 사용
async function loadGltf(id) {
  if (import.meta.env.VITE_MODEL_JSON) {
    const { glb } = await fetch(`${BASE}models/${id}.glb.json`).then(r => r.json());
    const bytes = Uint8Array.from(atob(glb), c => c.charCodeAt(0));
    return loader.parseAsync(bytes.buffer, '');
  }
  return loader.loadAsync(`${BASE}models/${id}.glb`);
}

async function loadRegion(cfg) {
  if (loaded.has(cfg.id)) return loaded.get(cfg.id);
  loadingEl.classList.remove('hidden');
  const [meta, gltf] = await Promise.all([
    fetch(`${BASE}models/${cfg.id}.json`).then(r => r.json()),
    loadGltf(cfg.id),
  ]);
  const parts = new Map(meta.map(m => [m.id, { meta: m, meshes: [] }]));
  const meshes = [];
  const planes = cfg.clip.map(() => new THREE.Plane());

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
      side: THREE.DoubleSide, clippingPlanes: planes,
    });
    o.userData = { id, layer: part.meta.layer, matName, base: color };
    part.meshes.push(o);
    meshes.push(o);
  });

  // 화면 중심 + 자르기 면
  const box = new THREE.Box3();
  for (const id of cfg.centerIds) for (const m of parts.get(id)?.meshes || []) box.expandByObject(m);
  const center = box.getCenter(new THREE.Vector3());
  cfg.clip.forEach(({ n, o }, i) => {
    // n 방향으로 o 이상 나간 부분을 자름: 보이는 쪽은 -n·(p-center) + o >= 0
    const normal = new THREE.Vector3(...n).negate();
    planes[i].set(normal, o - normal.dot(center));
  });

  gltf.scene.visible = false;
  scene.add(gltf.scene);
  const r = { cfg, group: gltf.scene, parts, meshes, center, planes, softIds: new Set(cfg.soft || []) };
  if (cfg.posture) r.posture = new Posture(r);
  loaded.set(cfg.id, r);
  loadingEl.classList.add('hidden');
  return r;
}

// ---------- 화면 상태 반영 ----------
function refresh() {
  const R = state.region; if (!R) return;
  const pr = state.preset;
  const hi = new Set(pr?.highlight || []);
  const hiMat = pr?.highlightMaterial || null;
  const hide = new Set(pr?.hide || []);
  const ghost = new Set(pr?.ghost || []);
  const anyHi = hi.size > 0 || !!hiMat || !!state.selected;

  for (const m of R.meshes) {
    const { id, layer, matName, base } = m.userData;
    const li = LAYERS.indexOf(layer);
    const mat = m.material;
    let mode = 'solid';
    if (hide.has(id)) mode = 'hidden';
    else if (li < state.stage) // 벗긴 층: 바로 바깥 한 층만 흐리게 남기고 나머지는 숨김
      mode = state.ghost && !pr?.noGhost && li === state.stage - 1 ? 'ghost' : 'hidden';
    else if (ghost.has(id)) mode = 'ghost';

    // 물주머니·관절낭처럼 안쪽을 가리는 것은 평소 반투명 (강조·선택되면 진하게)
    const soft = mode === 'solid' && (matName === 'Bursa' || R.softIds.has(id)) && !hi.has(id) && state.selected !== id;
    m.visible = mode !== 'hidden';
    mat.transparent = mode === 'ghost' || soft;
    mat.opacity = mode === 'ghost' ? 0.13 : soft ? 0.35 : 1;
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
let camGoal = null;
function lookFrom(dir, dist) {
  camGoal = { dir: new THREE.Vector3(...dir).normalize(), dist: dist ?? state.region.cfg.viewDist };
}
// 몸 속을 뚫고 지나가지 않도록 중심을 기준으로 빙 돌아서 이동
function stepCamera() {
  if (!camGoal || !state.region) return;
  controls.target.lerp(state.region.center, 0.15);
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
  const m = state.region.parts.get(id).meta;
  return state.medical ? [m.ko, m.easy] : [m.easy, m.ko];
}

// ---------- 프리셋 ----------
function applyPreset(p) {
  state.preset = p; state.selected = null;
  if (p) {
    state.stage = p.stage;
    lookFrom(p.view, p.dist);
    if (p.posture && state.region.posture) poseTo(POSE_T[p.posture]);
    showInfo(p.title, p.sub, p.desc);
  } else hideInfo();
  refresh();
}

// ---------- 부위 전환 ----------
const tabs = document.getElementById('regionTabs');
for (const cfg of REGIONS) {
  const b = document.createElement('button');
  b.textContent = cfg.title; b.dataset.region = cfg.id;
  b.onclick = () => selectRegion(cfg.id);
  tabs.appendChild(b);
}

async function selectRegion(id) {
  const cfg = REGIONS.find(r => r.id === id) || REGIONS[0];
  const R = await loadRegion(cfg);
  if (state.region) state.region.group.visible = false;
  const first = !state.region;
  state.region = R;
  R.group.visible = true;
  state.stage = 0; state.preset = null; state.selected = null;
  hideInfo();

  tabs.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.region === cfg.id));
  document.title = `Madi 3D · ${cfg.title}`;
  try { history.replaceState(null, '', `#${cfg.id}`); } catch { /* 미리보기 환경 등 */ }

  // 시점 버튼
  const views = document.getElementById('views');
  views.innerHTML = '';
  for (const [label, dir] of cfg.views) {
    const b = document.createElement('button');
    b.textContent = label; b.onclick = () => lookFrom(dir);
    views.appendChild(b);
  }
  // 질환 버튼
  const list = document.getElementById('presetList');
  list.innerHTML = '';
  for (const p of cfg.presets) {
    const b = document.createElement('button');
    b.className = 'preset'; b.dataset.id = p.id;
    b.innerHTML = `<b>${p.title}</b><small>${p.sub}</small>`;
    b.onclick = () => applyPreset(state.preset?.id === p.id ? null : p);
    list.appendChild(b);
  }
  // 자세 패널 (목만)
  postureEl.classList.toggle('hidden', !R.posture);
  if (R.posture) { poseQueue = []; setPose(0); }

  // 층 버튼 이름: 인대 층에 무엇이 들어있는지 부위마다 다름 (무릎=연골판, 어깨=관절낭, 목=디스크)
  document.querySelector('#stageSeg [data-stage="2"]').textContent = cfg.ligamentLabel || '인대';

  // 카메라: 처음엔 바로 배치, 부위를 바꿀 땐 새 중심으로 부드럽게
  if (first) {
    camera.position.copy(R.center).add(new THREE.Vector3(...cfg.views[0][1]).normalize().multiplyScalar(cfg.viewDist * 1.3));
    controls.target.copy(R.center);
  }
  lookFrom(cfg.views[0][1]);
  refresh();
}

// ---------- 자세 애니메이션 (목) ----------
const POSE_T = { normal: 0, straight: 1, forward: 2 };
const postureEl = document.getElementById('posturePanel');
const slider = document.getElementById('poseSlider');
let poseQueue = []; // [{ to, hold }] 차례로 이동
function setPose(t) {
  const P = state.region?.posture; if (!P) return;
  const { cobb, forwardMm } = P.apply(t);
  slider.value = t;
  document.getElementById('cobbVal').textContent =
    cobb >= 0.5 ? `경추 전만각 ${cobb.toFixed(0)}°` : cobb <= -0.5 ? `경추 후만 ${(-cobb).toFixed(0)}°` : '경추 곡선 0° (일자)';
  document.getElementById('fwdVal').textContent = forwardMm > 1 ? `머리 앞으로 +${forwardMm.toFixed(0)}mm` : '머리 위치 정상';
  document.querySelectorAll('#poseSeg button').forEach(b => b.classList.toggle('on', Math.abs(+b.dataset.pose - t) < 0.01));
}
function poseTo(t) { poseQueue = [{ to: t, hold: 0 }]; }
function stepPose(dt) {
  const P = state.region?.posture; if (!P || !poseQueue.length) return;
  const q = poseQueue[0];
  if (Math.abs(P.t - q.to) < 1e-3) {
    q.hold -= dt; if (q.hold <= 0) poseQueue.shift();
    return;
  }
  const speed = 0.6; // 초당 자세 단계
  const next = P.t + Math.sign(q.to - P.t) * Math.min(Math.abs(q.to - P.t), speed * dt);
  setPose(next);
}
document.querySelectorAll('#poseSeg button').forEach(b => b.onclick = () => poseTo(+b.dataset.pose));
slider.oninput = () => { poseQueue = []; setPose(+slider.value); };
document.getElementById('posePlay').onclick = () => {
  setPose(0);
  poseQueue = [{ to: 0, hold: 0.6 }, { to: 1, hold: 1.2 }, { to: 2, hold: 0 }];
};

// ---------- 컨트롤 ----------
document.querySelectorAll('#stageSeg button').forEach(b => b.onclick = () => {
  state.stage = +b.dataset.stage; refresh();
});
document.getElementById('ghostChk').onchange = e => { state.ghost = e.target.checked; refresh(); };
const termBtn = document.getElementById('termToggle');
termBtn.onclick = () => {
  state.medical = !state.medical;
  termBtn.textContent = state.medical ? '의학 용어' : '쉬운 말';
  termBtn.classList.toggle('on', state.medical);
  if (state.selected) { const [t, s] = partLabel(state.selected); showInfo(t, s, ''); }
};
document.getElementById('resetBtn').onclick = () => {
  state.stage = 0; state.preset = null; state.selected = null; hideInfo(); refresh();
  if (state.region.posture) poseTo(0);
  lookFrom(state.region.cfg.views[0][1]);
};
const credit = document.getElementById('credit');
document.getElementById('creditBtn').onclick = () => credit.classList.remove('hidden');
document.getElementById('creditClose').onclick = () => credit.classList.add('hidden');

// ---------- 터치해서 이름 보기 ----------
const ray = new THREE.Raycaster();
let down = null;
canvas.addEventListener('pointerdown', e => { down = [e.clientX, e.clientY]; });
canvas.addEventListener('pointerup', e => {
  const R = state.region;
  if (!R || !down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6) return;
  const rect = canvas.getBoundingClientRect();
  ray.setFromCamera(new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1), camera);
  const targets = R.meshes.filter(m => m.visible && (!m.material.transparent || m.userData.matName === 'Bursa' || R.softIds.has(m.userData.id)));
  const hit = ray.intersectObjects(targets, false)
    .find(h => R.planes.every(pl => pl.distanceToPoint(h.point) >= 0)); // 잘려서 안 보이는 부분은 무시
  if (!hit) { state.selected = null; if (!state.preset) hideInfo(); refresh(); return; }
  state.selected = hit.object.userData.id;
  const [t, s] = partLabel(state.selected);
  showInfo(t, s, '');
  refresh();
});

// ---------- 시작 ----------
const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.1);
  stepPose(dt); stepCamera(); controls.update(); renderer.render(scene, camera);
});
await selectRegion(location.hash.slice(1) || REGIONS[0].id);
addEventListener('hashchange', () => {
  const id = location.hash.slice(1);
  if (id && id !== state.region?.cfg.id && REGIONS.some(r => r.id === id)) selectRegion(id);
});

// 앱 설치(PWA)·오프라인 저장 — 배포 버전에서만, 미리보기 환경에서는 조용히 건너뜀
if (import.meta.env.PROD && !import.meta.env.VITE_MODEL_JSON && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register(`${BASE}sw.js`).catch(() => {});
}

// 테스트·디버그용
window.__madi = { state, applyPreset, selectRegion, refresh, lookFrom, REGIONS, setPose, ready: true };
