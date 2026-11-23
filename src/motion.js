// 관절 움직임 애니메이션 (예: 어깨 외전) — 한 뼈(위팔뼈)를 관절 중심으로 돌리고,
// 근육·힘줄·점액낭은 "움직이는 뼈에 얼마나 가까운가"에 따라 따라 움직이게 해서 자연스럽게 늘어나게 한다.
//
// 부위 설정의 motion 항목:
//   moving: 움직이는 뼈 id, fixed: 고정된 뼈 id들
//   pivot: { socket: 관절 소켓 구조물 id, head: 움직이는 뼈, radius: 소켓 면에서 회전 중심까지 거리(m) }
//   axis: 회전축 [x,y,z], poses: [{ label, deg }], hot: { from, to, ids } (이 각도 구간에서 빨갛게)
//   gap: { from: 고정 뼈 id, near: 소켓 중심에서 이 거리(m) 안의 정점만 } — 두 뼈 사이 최소 간격 표시
import * as THREE from 'three';
import { bakeToWorld } from './posture.js';

const CELL = 0.006; // 거리 계산 격자 크기 (6mm)

// 뼈 표면까지의 거리장(3차원 격자) — 각 칸에서 가장 가까운 뼈 정점까지의 대략적인 거리
function distanceField(box, dims, seeds) {
  const [nx, ny, nz] = dims, N = nx * ny * nz;
  const D = new Float32Array(N).fill(1e9);
  const idx = (x, y, z) => x + nx * (y + ny * z);
  const v = new THREE.Vector3();
  for (const geo of seeds) {
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).sub(box.min).divideScalar(CELL);
      const x = Math.min(nx - 1, Math.max(0, v.x | 0)), y = Math.min(ny - 1, Math.max(0, v.y | 0)), z = Math.min(nz - 1, Math.max(0, v.z | 0));
      D[idx(x, y, z)] = 0;
    }
  }
  // 앞뒤 두 번 훑는 거리 변환 (26방향 이웃)
  const nb = [];
  for (let dz = -1; dz <= 1; dz++) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    const o = dx + nx * (dy + ny * dz);
    if (o < 0) nb.push([dx, dy, dz, CELL * Math.hypot(dx, dy, dz)]);
  }
  for (const dir of [1, -1]) {
    const zs = dir > 0 ? [0, nz, 1] : [nz - 1, -1, -1], ys = dir > 0 ? [0, ny, 1] : [ny - 1, -1, -1], xs = dir > 0 ? [0, nx, 1] : [nx - 1, -1, -1];
    for (let z = zs[0]; z !== zs[1]; z += zs[2]) for (let y = ys[0]; y !== ys[1]; y += ys[2]) for (let x = xs[0]; x !== xs[1]; x += xs[2]) {
      const i = idx(x, y, z); let d = D[i];
      for (const [dx, dy, dz, w] of nb) {
        const X = x + dx * dir, Y = y + dy * dir, Z = z + dz * dir;
        if (X < 0 || Y < 0 || Z < 0 || X >= nx || Y >= ny || Z >= nz) continue;
        const c = D[idx(X, Y, Z)] + w; if (c < d) d = c;
      }
      D[i] = d;
    }
  }
  return (p) => {
    const x = Math.min(nx - 1, Math.max(0, ((p.x - box.min.x) / CELL) | 0));
    const y = Math.min(ny - 1, Math.max(0, ((p.y - box.min.y) / CELL) | 0));
    const z = Math.min(nz - 1, Math.max(0, ((p.z - box.min.z) / CELL) | 0));
    return D[idx(x, y, z)];
  };
}

export class Motion {
  constructor(R) {
    const cfg = R.cfg.motion;
    this.cfg = cfg; this.R = R;
    for (const m of R.meshes) bakeToWorld(m, R.group);
    const geos = (id) => R.parts.get(id).meshes.map(m => m.geometry);
    const bbox = (ids) => { const b = new THREE.Box3(); for (const g of ids.flatMap(geos)) { g.computeBoundingBox(); b.union(g.boundingBox); } return b; };

    // 회전 중심: 소켓(관절와) 중심에서 움직이는 뼈 머리 쪽으로 radius만큼
    const sock = bbox([cfg.pivot.socket]).getCenter(new THREE.Vector3());
    const headTop = (() => {
      const top = bbox([cfg.moving]).max.y, c = new THREE.Vector3(), v = new THREE.Vector3(); let n = 0;
      for (const g of geos(cfg.moving)) { const p = g.attributes.position; for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); if (v.y > top - 0.04) { c.add(v); n++; } } }
      return c.divideScalar(n);
    })();
    this.pivot = sock.clone().addScaledVector(headTop.clone().sub(sock).setY(0).normalize(), cfg.pivot.radius);
    this.axis = new THREE.Vector3(...cfg.axis).normalize();

    // 근육 등 연조직: 움직이는 뼈까지 거리(dm)와 고정 뼈까지 거리(df)로 따라 움직일 비율 w 결정
    const box = bbox([cfg.moving, ...cfg.fixed]).expandByScalar(0.06);
    const size = box.getSize(new THREE.Vector3());
    const dims = [size.x, size.y, size.z].map(s => Math.ceil(s / CELL) + 1);
    const dMove = distanceField(box, dims, geos(cfg.moving));
    const dFix = distanceField(box, dims, cfg.fixed.flatMap(geos));

    this.rigid = []; this.soft = [];
    const v = new THREE.Vector3();
    for (const m of R.meshes) {
      const { id, layer } = m.userData;
      if (layer === 'bone') { if (id === cfg.moving) this.rigid.push(m); continue; }
      const pos = m.geometry.attributes.position, w = new Float32Array(pos.count);
      let any = false;
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i);
        const dm = dMove(v) + 0.002, df = dFix(v) + 0.002;
        let k = (df * df) / (df * df + dm * dm);
        k = THREE.MathUtils.smoothstep(k, 0.15, 0.85);
        // 몸 안쪽(가슴·등 가운데)으로 멀리 있는 부분은 고정 (모델에 없는 흉골·척추에 붙는 근육)
        const inward = (v.x - this.pivot.x) * (cfg.inwardSign ?? 1);
        if (inward > 0.05) k *= Math.max(0, 1 - (inward - 0.05) / 0.06);
        w[i] = k; if (k > 0.001) any = true;
      }
      if (any) this.soft.push({ m, p0: pos.array.slice(), n0: m.geometry.attributes.normal.array.slice(), w });
    }

    // 간격 계산용 정점 (소켓 근처만, 간격 조밀하게 솎아서)
    const near = (ids, r, step) => {
      const out = [];
      for (const g of ids.flatMap(geos)) { const p = g.attributes.position; for (let i = 0; i < p.count; i += step) { v.fromBufferAttribute(p, i); if (v.distanceTo(this.pivot) < r) out.push(v.clone()); } }
      return out;
    };
    if (cfg.gap) {
      // 지붕(견봉)만: 회전 중심보다 위(above)이고, 몸 안쪽으로 inner 이상 들어가지 않은 정점 (관절와 가장자리 제외)
      const inSign = cfg.inwardSign ?? 1;
      this.gapFixed = near([cfg.gap.from], cfg.gap.near, 1)
        .filter(p => p.y > this.pivot.y + (cfg.gap.above ?? 0.015) && (p.x - this.pivot.x) * inSign < (cfg.gap.inner ?? 0.01));
      this.gapMove = near([cfg.moving], cfg.gap.near, 1);
    }
    this.hotIds = new Set(cfg.hot?.ids || []);
    this.hotActive = false;
    this.t = 0;
    this.apply(0);
  }

  degAt(t) {
    const P = this.cfg.poses, i = Math.min(Math.floor(t), P.length - 2), f = t - i;
    return P.length === 1 ? P[0].deg : P[i].deg + (P[i + 1].deg - P[i].deg) * f;
  }

  apply(t) {
    this.t = t;
    const deg = this.degAt(t);
    const M = new THREE.Matrix4().makeTranslation(this.pivot.x, this.pivot.y, this.pivot.z)
      .multiply(new THREE.Matrix4().makeRotationAxis(this.axis, THREE.MathUtils.degToRad(deg)))
      .multiply(new THREE.Matrix4().makeTranslation(-this.pivot.x, -this.pivot.y, -this.pivot.z));
    const N = new THREE.Matrix3().setFromMatrix4(M);
    for (const m of this.rigid) { m.matrix.copy(M); m.matrixWorldNeedsUpdate = true; }

    const a = new THREE.Vector3(), b = new THREE.Vector3(), na = new THREE.Vector3(), nb = new THREE.Vector3();
    for (const s of this.soft) {
      const pos = s.m.geometry.attributes.position, nor = s.m.geometry.attributes.normal;
      const P = pos.array, Nn = nor.array;
      for (let i = 0; i < pos.count; i++) {
        const w = s.w[i], j = i * 3;
        if (w <= 0.001) { if (t === 0 || P[j] !== s.p0[j]) { P[j] = s.p0[j]; P[j + 1] = s.p0[j + 1]; P[j + 2] = s.p0[j + 2]; } continue; }
        a.fromArray(s.p0, j); b.copy(a).applyMatrix4(M); a.lerp(b, w); a.toArray(P, j);
        na.fromArray(s.n0, j); nb.copy(na).applyMatrix3(N); na.lerp(nb, w).normalize(); na.toArray(Nn, j);
      }
      pos.needsUpdate = true; nor.needsUpdate = true;
      s.m.geometry.computeBoundingSphere();
    }

    // 견봉-상완골 간격(두 뼈 정점 사이 최소 거리)
    let gapMm = null;
    if (this.gapFixed) {
      let best = Infinity; const q = new THREE.Vector3();
      for (const p of this.gapMove) {
        q.copy(p).applyMatrix4(M);
        for (const f of this.gapFixed) { const d = q.distanceToSquared(f); if (d < best) best = d; }
      }
      gapMm = Math.sqrt(best) * 1000;
    }
    const h = this.cfg.hot;
    this.hotActive = !!h && deg >= h.from && deg <= h.to;
    return { deg, gapMm, hot: this.hotActive };
  }
}
