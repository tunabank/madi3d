// 척추 자세 애니메이션(목·허리 공용) — 척추를 관절처럼 하나씩 돌리고, 근육·인대·디스크는 높이에 따라 휘게 한다.
//
// 동작 방식 (부위 설정의 posture 항목을 따름)
// - joints: 아래에서 위로 이어진 관절. 각 관절은 앞으로 숙이는 방향(+)으로 회전.
// - 뼈(rigid): 어느 관절 위에 얹혀 있는지(level)에 따라 통째로 움직임. 0 = 고정.
// - 나머지(근육·인대·디스크·척수): 정점 높이(y)에 따라 위·아래 두 단계의 움직임을 섞어서 휨.
import * as THREE from 'three';

const AX = new THREE.Vector3(1, 0, 0); // 좌우 축 (+각도 = 앞으로 숙임)

// 압축된(정수형) 좌표를 실수형 월드 좌표로 바꿔서, 직접 정점을 움직일 수 있게 한다.
export function bakeToWorld(mesh, root) {
  mesh.updateWorldMatrix(true, false);
  const g = mesh.geometry;
  const pos = g.attributes.position, nor = g.attributes.normal;
  const p = new Float32Array(pos.count * 3), n = new Float32Array(pos.count * 3);
  const v = new THREE.Vector3(), nm = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld); v.toArray(p, i * 3);
    if (nor) {
      v.fromBufferAttribute(nor, i).applyMatrix3(nm).normalize();
      if (!Number.isFinite(v.x + v.y + v.z)) v.set(0, 1, 0); // 원본에 깨진 법선이 있는 경우
      v.toArray(n, i * 3);
    }
  }
  const ng = new THREE.BufferGeometry();
  ng.setAttribute('position', new THREE.BufferAttribute(p, 3));
  ng.setAttribute('normal', new THREE.BufferAttribute(n, 3));
  if (g.index) ng.setIndex(g.index.clone());
  ng.groups = g.groups;
  if (!nor) ng.computeVertexNormals();
  mesh.geometry = ng;
  root.attach(mesh); // 부모 변환 없이 root 바로 아래로
  mesh.position.set(0, 0, 0); mesh.quaternion.identity(); mesh.scale.set(1, 1, 1);
  mesh.matrixAutoUpdate = false;
  mesh.matrix.identity();
  mesh.updateMatrixWorld(true);
}

// 디스크 정점에 평면 y = a·x + b·z + c 를 맞춰 앞뒤 기울기(도)를 구한다.
function discTilt(geo) {
  const pos = geo.attributes.position;
  let sxx = 0, sxz = 0, szz = 0, sx = 0, sz = 0, sy = 0, sxy = 0, szy = 0;
  const n = pos.count;
  for (let i = 0; i < n; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    sxx += x * x; sxz += x * z; szz += z * z; sx += x; sz += z; sy += y; sxy += x * y; szy += z * y;
  }
  const A = new THREE.Matrix3().set(sxx, sxz, sx, sxz, szz, sz, sx, sz, n).invert();
  const r = new THREE.Vector3(sxy, szy, sy).applyMatrix3(A); // (a, b, c)
  return THREE.MathUtils.radToDeg(Math.atan(r.y)); // z(앞) 방향 기울기
}

export class Posture {
  constructor(R) {
    const cfg = R.cfg.posture;
    this.cfg = cfg;
    this.R = R;
    const root = R.group;
    for (const m of R.meshes) bakeToWorld(m, root);

    const box = (id) => {
      const b = new THREE.Box3();
      for (const m of R.parts.get(id).meshes) { m.geometry.computeBoundingBox(); b.union(m.geometry.boundingBox); }
      return b;
    };
    // 여러 뼈의 맨 위쪽(depth 이내) 정점들의 평균점
    const topCentroid = (ids, depth) => {
      const geos = ids.flatMap(id => R.parts.get(id).meshes.map(m => m.geometry));
      let top = -Infinity;
      for (const g of geos) { g.computeBoundingBox(); top = Math.max(top, g.boundingBox.max.y); }
      const c = new THREE.Vector3(); let n = 0; const v = new THREE.Vector3();
      for (const g of geos) {
        const pos = g.attributes.position;
        for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i); if (v.y > top - depth) { c.add(v); n++; } }
      }
      return c.divideScalar(Math.max(n, 1));
    };
    // 관절 회전 중심
    this.pivots = cfg.joints.map(j => {
      if (j.disc) return box(j.disc).getCenter(new THREE.Vector3());
      if (j.topOf) return topCentroid(j.topOf, j.depth ?? 0.03); // 예: 양쪽 대퇴골두 → 고관절 중심
      const b = box(j.bone), c = b.getCenter(new THREE.Vector3());
      if (j.at === 'top') c.y = b.max.y;
      return c;
    });
    const nJ = this.pivots.length;

    // 정상 모델의 전만각(Cobb): 위·아래 기준 디스크의 기울기 차이 (목 C2-C7, 허리 L1-S1)
    const geo = (id) => R.parts.get(id).meshes[0].geometry;
    this.baseLordosis = Math.abs(discTilt(geo(cfg.cobbUpper)) - discTilt(geo(cfg.cobbLower)));

    // 단계별 중심 높이 (정점 섞기용)
    const py = this.pivots.map(p => p.y);
    this.levelY = [py[0] - 0.015];
    for (let k = 0; k < nJ - 1; k++) this.levelY.push((py[k] + py[k + 1]) / 2);
    this.levelY.push(py[nJ - 1] + 0.03);

    // 메쉬 분류
    this.rigid = []; this.soft = [];
    for (const m of R.meshes) {
      const { id, layer } = m.userData;
      if (layer === 'bone') {
        const lv = cfg.rigid[id] ?? (cfg.fixed.includes(id) ? 0 : (cfg.defaultLevel ?? nJ));
        this.rigid.push({ m, lv });
      } else {
        const pos = m.geometry.attributes.position;
        const lv = new Uint8Array(pos.count), w = new Float32Array(pos.count);
        for (let i = 0; i < pos.count; i++) {
          const y = pos.getY(i), L = this.levelY;
          if (y <= L[0]) { lv[i] = 0; w[i] = 0; continue; }
          if (y >= L[nJ]) { lv[i] = nJ; w[i] = 0; continue; }
          let k = 0; while (y >= L[k + 1]) k++;
          lv[i] = k; w[i] = (y - L[k]) / (L[k + 1] - L[k]);
        }
        this.soft.push({ m, p0: pos.array.slice(), n0: m.geometry.attributes.normal.array.slice(), lv, w });
      }
    }
    // 머리 위치(앞 이동 거리 계산용)
    this.headPt = box(cfg.headRef).getCenter(new THREE.Vector3());

    this.poses = this.buildPoses();
    this.t = 0;
    this.mats = Array.from({ length: nJ + 1 }, () => new THREE.Matrix4());
    this.apply(0);
  }

  // 자세별 관절 각도(도) — 부위 설정의 poses[].angles(정상 전만각)로 계산
  buildPoses() {
    return this.cfg.poses.map(p => p.angles(this.baseLordosis));
  }

  // t: 0 = 첫 자세, 1 = 둘째 자세, ... (사이 값은 앞뒤 자세를 섞음)
  angles(t) {
    const P = this.poses, i = Math.min(Math.floor(t), P.length - 2), f = t - i;
    if (P.length === 1) return P[0];
    return P[i].map((x, k) => x + (P[i + 1][k] - x) * f);
  }

  apply(t) {
    this.t = t;
    const ang = this.angles(t);
    const R = new THREE.Matrix4(), T = new THREE.Matrix4(), Ti = new THREE.Matrix4();
    this.mats[0].identity();
    ang.forEach((deg, k) => {
      const p = this.pivots[k];
      T.makeTranslation(p.x, p.y, p.z); Ti.makeTranslation(-p.x, -p.y, -p.z);
      R.makeRotationAxis(AX, THREE.MathUtils.degToRad(deg));
      this.mats[k + 1].copy(this.mats[k]).multiply(T).multiply(R).multiply(Ti);
    });

    for (const { m, lv } of this.rigid) { m.matrix.copy(this.mats[lv]); m.matrixWorldNeedsUpdate = true; }

    const va = new THREE.Vector3(), vb = new THREE.Vector3(), na = new THREE.Vector3(), nb = new THREE.Vector3();
    const nmats = this.mats.map(M => new THREE.Matrix3().setFromMatrix4(M)); // 회전만
    for (const s of this.soft) {
      const pos = s.m.geometry.attributes.position, nor = s.m.geometry.attributes.normal;
      const P = pos.array, N = nor.array;
      for (let i = 0; i < pos.count; i++) {
        const k = s.lv[i], w = s.w[i], j = i * 3;
        va.fromArray(s.p0, j); na.fromArray(s.n0, j);
        vb.copy(va).applyMatrix4(this.mats[k]); nb.copy(na).applyMatrix3(nmats[k]);
        if (w > 0) {
          va.applyMatrix4(this.mats[k + 1]).sub(vb).multiplyScalar(w).add(vb);
          na.applyMatrix3(nmats[k + 1]).sub(nb).multiplyScalar(w).add(nb).normalize();
        } else { va.copy(vb); na.copy(nb); }
        va.toArray(P, j); na.toArray(N, j);
      }
      pos.needsUpdate = true; nor.needsUpdate = true;
      s.m.geometry.computeBoundingSphere();
    }

    // 화면에 보여줄 수치
    const [a, b] = this.cfg.cobbSegments; // 전만각에 들어가는 분절(관절 번호 범위)
    const cobb = this.baseLordosis - ang.slice(a, b).reduce((x, y) => x + y, 0);
    const ref = this.headPt.clone().applyMatrix4(this.mats[this.mats.length - 1]);
    return { cobb, forwardMm: (ref.z - this.headPt.z) * 1000, angles: ang };
  }
}
