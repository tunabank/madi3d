// 목 — 모델·시점·자르기 범위·자세 애니메이션·질환 프리셋
// 질환 문구는 원장님이 직접 고치거나 항목을 추가하는 곳
// stage: 0=겉근육부터 보기, 1=속근육부터, 2=디스크·인대부터, 3=뼈만
// view: 카메라 방향 [x, y, z]  (-x=오른쪽 옆, +z=앞, -z=뒤, +y=위)
// noGhost: 벗긴 층을 흐리게도 남기지 않음
// posture: 'normal' | 'straight'(일자목) | 'forward'(거북목) — 프리셋을 누르면 그 자세로 바뀜

const SUBOCCIPITAL = ['Rectus_posterior_major_capitis_muscle', 'Rectus_posterior_minor_capitis_muscle',
  'Obliquus_superior_capitis_muscle', 'Obliquus_inferior_capitis_muscle'];
const both = (ids) => ids.flatMap(id => [id, `${id}_L`]);
// 숙인 만큼 머리-C2에서 젖혀 앞을 보게 (머리-C1 60%, C1-C2 40%)
const withGaze = (a) => { const sum = a.reduce((x, y) => x + y, 0); return [...a, -sum * 0.4, -sum * 0.6]; };

const PRESETS = [
  {
    id: 'straight',
    title: '일자목',
    sub: '경추 전만 소실',
    stage: 3,
    posture: 'straight',
    view: [-1, 0.05, 0.05],
    desc: '정상 목뼈는 옆에서 보면 앞으로 볼록한 C자 곡선(전만)이 있어요. 이 곡선이 펴져서 일자처럼 된 상태를 일자목이라고 해요. 아래 숫자에서 곡선 각도(전만각)가 줄어드는 걸 볼 수 있어요.',
  },
  {
    id: 'forward',
    title: '거북목',
    sub: '전방 머리 자세',
    stage: 3,
    posture: 'forward',
    view: [-1, 0.05, 0.05],
    desc: '목 아래쪽 뼈들은 앞으로 숙여지고, 앞을 보려고 목 위쪽(머리와 1·2번 목뼈 사이)은 뒤로 젖혀지면서 머리가 어깨보다 앞으로 나가는 자세예요.',
  },
  {
    id: 'suboccipital',
    title: '뒷목 근육 뭉침',
    sub: '후두하근 단축(거북목)',
    stage: 1,
    posture: 'forward',
    highlight: both(SUBOCCIPITAL),
    view: [-0.55, 0.05, -0.85],
    dist: 0.55,
    desc: '뒤통수 바로 아래의 작은 근육들(후두하근)이에요. 거북목 자세에서는 머리를 뒤로 젖혀 앞을 보느라 이 근육들이 계속 짧아진 채로 버티게 돼요.',
  },
  {
    id: 'disc',
    title: '목 디스크',
    sub: '경추 추간판 탈출증',
    stage: 2,
    posture: 'normal',
    highlight: ['Intervertebral_disc_C5-C6', 'Intervertebral_disc_C6-C7'],
    hide: ['Anterior_longitudinal_ligament', 'Ligamenta_flava', 'Interspinous_ligaments', 'Supraspinous_ligament', 'Nuchal_ligament'],
    noGhost: true, // 겉 근육을 흐리게도 남기지 않음
    view: [-1, -0.05, 0.2],
    dist: 0.45,
    desc: '목뼈 사이의 쿠션(디스크)이 뒤로 밀려 나와 신경을 누르면 목·어깨·팔이 아프거나 저려요. 5-6번, 6-7번 목뼈 사이에서 가장 흔해요.',
  },
  {
    id: 'flexors',
    title: '목 앞 깊은 근육',
    sub: '심부 경부 굴곡근',
    stage: 1,
    posture: 'normal',
    highlight: both(['Longus_colli_muscle', 'Longus_capitis_muscle']),
    hide: both(['Scalenus_anterior_muscle']),
    view: [-0.45, -0.35, 1],
    dist: 0.55,
    desc: '목뼈 바로 앞에 붙어 있는 깊은 근육(경장근·두장근)이에요. 목뼈를 안쪽에서 받쳐 주는 역할을 해요.',
  },
];

// 뼈가 얹힌 관절 단계 (관절 순서는 아래 joints 기준: 1 = C7-T1 위, ... 8 = 머리)
const RIGID = {
  Vertebra_C7: 1, Vertebra_C6: 2, Vertebra_C5: 3, Vertebra_C4: 4, Vertebra_C3: 5,
  'Axis_(C2)': 6, 'Atlas_(C1)': 7, Hyoid_bone: 5,
};

export default {
  id: 'neck',
  title: '목',
  centerIds: ['Intervertebral_disc_C2-C3', 'Intervertebral_disc_C7-T1', 'Axis_(C2)'],
  // 위 0.25m(머리 전체), 아래 0.1m(등 위쪽), 좌우 0.12m 넘는 부분은 자름
  clip: [{ n: [0, 1, 0], o: 0.25 }, { n: [0, -1, 0], o: 0.1 }, { n: [1, 0, 0], o: 0.12 }, { n: [-1, 0, 0], o: 0.12 }],
  ligamentLabel: '디스크·인대',
  viewDist: 0.95,
  views: [
    ['옆', [-1, 0.05, 0.05]], ['비스듬히', [-0.8, 0.25, 0.6]], ['앞', [0.05, 0.05, 1]], ['뒤', [-0.05, 0.1, -1]],
  ],
  soft: [],
  posture: {
    // 아래에서 위로. disc: 그 디스크 중심을 회전 중심으로 / bone+at: 뼈 중심(또는 윗면)
    joints: [
      { name: 'C7-T1', disc: 'Intervertebral_disc_C7-T1' },
      { name: 'C6-C7', disc: 'Intervertebral_disc_C6-C7' },
      { name: 'C5-C6', disc: 'Intervertebral_disc_C5-C6' },
      { name: 'C4-C5', disc: 'Intervertebral_disc_C4-C5' },
      { name: 'C3-C4', disc: 'Intervertebral_disc_C3-C4' },
      { name: 'C2-C3', disc: 'Intervertebral_disc_C2-C3' },
      { name: 'C1-C2', bone: 'Atlas_(C1)', at: 'center' },
      { name: '머리-C1', bone: 'Atlas_(C1)', at: 'top' },
    ],
    rigid: RIGID,
    fixed: ['Vertebra_T1', 'Vertebra_T2', 'Vertebra_T3', 'Manubrium_of_sternum', 'Clavicle', 'Clavicle_L', 'First_rib', 'First_rib_L'],
    cobbUpper: 'Intervertebral_disc_C2-C3',
    cobbLower: 'Intervertebral_disc_C7-T1',
    cobbSegments: [1, 6], // C6-7 ~ C2-3 관절
    headRef: 'Sphenoid_bone',
    // 관절 순서: C7-T1, C6-C7, C5-C6, C4-C5, C3-C4, C2-C3, C1-C2, 머리-C1 (+ = 앞으로 숙임)
    // L = 이 모델의 정상 C2-C7 전만각
    poses: [
      { id: 'normal', label: '정상', angles: () => [0, 0, 0, 0, 0, 0, 0, 0] },
      // 일자목: C2-C7 전만을 0°로 (각 분절을 고르게 숙임), 시선 유지를 위해 머리-C2에서 그만큼 젖힘
      { id: 'straight', label: '일자목', angles: (L) => withGaze([0, L / 5, L / 5, L / 5, L / 5, L / 5]) },
      // 거북목: 중·하부 경추를 더 숙이고(+C7-T1), 상부 경추(머리-C2)에서 젖혀 시선을 유지
      { id: 'forward', label: '거북목', angles: (L) => withGaze([10, L / 5 + 4, L / 5 + 4, L / 5 + 2, L / 5, L / 5 - 2]) },
    ],
    readout: ({ cobb, forwardMm }) => [
      cobb >= 0.5 ? `경추 전만각 ${cobb.toFixed(0)}°` : cobb <= -0.5 ? `경추 후만 ${(-cobb).toFixed(0)}°` : '경추 곡선 0° (일자)',
      forwardMm > 1 ? `머리 앞으로 +${forwardMm.toFixed(0)}mm` : '머리 위치 정상',
    ],
  },
  presets: PRESETS,
};
