// 허리 — 모델·시점·자르기 범위·자세 애니메이션(정상→일자허리)·질환 프리셋
// 질환 문구는 원장님이 직접 고치거나 항목을 추가하는 곳
// stage: 0=겉근육부터 보기, 1=속근육부터, 2=디스크·인대부터, 3=뼈만
// view: 카메라 방향 [x, y, z]  (-x=오른쪽 옆, +z=앞, -z=뒤, +y=위)
// noGhost: 벗긴 층을 흐리게도 남기지 않음 / posture: 'normal' | 'flat'(일자허리)

const both = (ids) => ids.flatMap(id => [id, `${id}_L`]);
const ERECTOR = both(['Iliocostalis_lumborum_muscle', 'Longissimus_thoracis_muscle', 'Spinalis_thoracis_muscle']);
const BACK_LIGS = ['Ligamenta_flava', 'Interspinous_ligaments', 'Supraspinous_ligament'];

// 요추 분절별 전만 기여 비율 (L5-S1, L4-5, L3-4, L2-3, L1-2) — 아시아 성인 324명 연구
const SEG_SHARE = [0.427, 0.252, 0.181, 0.117, 0.023];

const PRESETS = [
  {
    id: 'flat',
    en: 'Flat back (loss of lumbar lordosis)',
    title: '일자허리',
    sub: '요추 전만 감소·소실',
    stage: 3,
    posture: 'flat',
    view: [-1, 0.05, 0.05],
    desc: '정상 허리뼈는 옆에서 보면 앞으로 볼록한 곡선(요추 전만)이 있어요. 이 곡선이 줄거나 없어져 허리가 일자처럼 된 상태로, 골반도 뒤로 기울어져요. 아래 숫자에서 곡선 각도가 줄어드는 걸 볼 수 있어요.',
  },
  {
    id: 'disc',
    en: 'Lumbar disc herniation',
    title: '허리 디스크',
    sub: '요추 추간판 탈출증',
    stage: 2,
    posture: 'normal',
    noGhost: true,
    highlight: ['Intervertebral_disc_L4-L5', 'Intervertebral_disc_L5-S1'],
    hide: ['Anterior_longitudinal_ligament', ...BACK_LIGS, ...both(['Iliolumbar_ligament']), 'Hip_bone'], // 오른쪽 골반뼈가 L5-S1을 가려서 숨김
    view: [-1, 0.05, 0.15],
    dist: 0.6,
    desc: '허리뼈 사이의 쿠션(디스크)이 뒤로 밀려 나와 신경을 누르면 허리·엉덩이·다리가 아프거나 저려요. 90% 이상이 4-5번 허리뼈 사이와 5번 허리뼈-엉치뼈 사이에서 생겨요. (노란색: 신경이 들어 있는 주머니, 오른쪽 골반뼈는 숨김)',
  },
  {
    id: 'stenosis',
    en: 'Lumbar spinal stenosis',
    title: '척추관 협착증',
    sub: '요추 척추관 협착증',
    stage: 2,
    posture: 'normal',
    noGhost: true,
    highlight: ['Ligamenta_flava'],
    hide: ['Interspinous_ligaments', 'Supraspinous_ligament', 'Anterior_longitudinal_ligament'],
    view: [-0.8, 0.35, -0.6],
    dist: 0.6,
    desc: '신경이 지나가는 통로(척추관)가 좁아져 신경을 누르는 병이에요. 디스크가 튀어나오거나 낮아지고, 뒤쪽 노란 인대(황색인대, 빨간 부분)가 두꺼워지고, 관절에 뼈가 자라면서 생겨요. 60세 이상에서 많아요.',
  },
  {
    id: 'erector',
    en: 'Erector spinae',
    title: '척추기립근',
    sub: '허리를 펴는 근육',
    stage: 0,
    posture: 'normal',
    highlight: ERECTOR,
    view: [-0.35, 0.1, -1],
    desc: '척추 양옆을 따라 길게 뻗어 있는 근육들이에요. 허리를 펴고 상체를 세워 주는 역할을 해요.',
  },
  {
    id: 'psoas',
    en: 'Iliopsoas',
    title: '장요근',
    sub: '대요근·장골근',
    stage: 1,
    posture: 'normal',
    highlight: both(['Psoas_major', 'Iliacus_muscle']),
    hide: both(['Transversus_abdominis_muscle']),
    view: [-0.5, 0.1, 1],
    desc: '허리뼈 앞쪽(대요근)과 골반 안쪽(장골근)에서 시작해 허벅지뼈 안쪽에 함께 붙는 근육이에요. 다리를 앞으로 들어 올릴 때 쓰여요.',
  },
  {
    id: 'core',
    en: 'Multifidus & transversus abdominis',
    title: '허리 깊은 근육',
    sub: '다열근·복횡근',
    stage: 1,
    posture: 'normal',
    highlight: both(['Multifidus_lumborum_muscle', 'Transversus_abdominis_muscle']),
    view: [-0.8, 0.2, -0.6],
    desc: '허리뼈 마디마디를 이어 주는 짧은 근육(다열근)과 배를 둘러싸는 가장 깊은 근육(복횡근)이에요. 허리를 안쪽에서 받쳐 주는 근육이라 재활 운동에서 많이 다뤄요.',
  },
];

export default {
  id: 'lumbar',
  title: '허리',
  centerIds: ['Intervertebral_disc_L1-L2', 'Intervertebral_disc_L5-S1', 'Vertebra_L3'],
  // 위 0.22m, 아래 0.25m(골반·허벅지 위쪽), 좌우 0.2m 넘는 부분은 자름
  clip: [{ n: [0, 1, 0], o: 0.22 }, { n: [0, -1, 0], o: 0.25 }, { n: [1, 0, 0], o: 0.2 }, { n: [-1, 0, 0], o: 0.2 }],
  ligamentLabel: '디스크·인대',
  viewDist: 1.15,
  views: [
    ['옆', [-1, 0.05, 0.05]], ['뒤', [-0.1, 0.1, -1]], ['비스듬히', [-0.75, 0.2, -0.65]], ['앞', [0.05, 0.05, 1]],
  ],
  soft: [],
  posture: {
    // 아래에서 위로: 고관절(골반 기울기) → L5-S1 → ... → T10-T11
    joints: [
      { name: '고관절', topOf: ['Femur', 'Femur_L'], depth: 0.03 },
      { name: 'L5-S1', disc: 'Intervertebral_disc_L5-S1' },
      { name: 'L4-L5', disc: 'Intervertebral_disc_L4-L5' },
      { name: 'L3-L4', disc: 'Intervertebral_disc_L3-L4' },
      { name: 'L2-L3', disc: 'Intervertebral_disc_L2-L3' },
      { name: 'L1-L2', disc: 'Intervertebral_disc_L1-L2' },
      { name: 'T12-L1', disc: 'Intervertebral_disc_T12-L1' },
      { name: 'T11-T12', disc: 'Intervertebral_disc_T11-T12' },
      { name: 'T10-T11', disc: 'Intervertebral_disc_T10-T11' },
    ],
    // 뼈가 얹힌 관절 단계 (0 = 고정, 1 = 고관절 위 골반, ...). 나머지 뼈(T10)는 맨 위
    rigid: {
      Hip_bone: 1, Hip_bone_L: 1, Sacrum: 1, Coccyx: 1,
      Vertebra_L5: 2, Vertebra_L4: 3, Vertebra_L3: 4, Vertebra_L2: 5, Vertebra_L1: 6, Vertebra_T12: 7, Vertebra_T11: 8,
    },
    fixed: ['Femur', 'Femur_L'],
    cobbUpper: 'Intervertebral_disc_T12-L1', // L1 윗면
    cobbLower: 'Intervertebral_disc_L5-S1', // S1 윗면
    cobbSegments: [1, 6], // L5-S1 ~ L1-L2 관절
    headRef: 'Vertebra_T10',
    // L = 이 모델의 정상 L1-S1 전만각. + = 앞으로 숙임
    poses: [
      { id: 'normal', label: '정상', angles: () => [0, 0, 0, 0, 0, 0, 0, 0, 0] },
      // 일자허리: 전만을 15° 남기고 펴되(아래 분절일수록 많이), 골반을 그만큼 뒤로 기울여 상체는 똑바로
      {
        id: 'flat', label: '일자허리', angles: (L) => {
          const d = Math.max(L - 15, L * 0.6);
          const seg = SEG_SHARE.map(r => r * d);
          return [-d, ...seg, 0, 0, 0];
        },
      },
    ],
    readout: ({ cobb, angles }) => [
      cobb >= 0.5 ? `요추 전만각 ${cobb.toFixed(0)}°` : `요추 전만 0°`,
      angles[0] < -0.5 ? `골반 뒤로 ${(-angles[0]).toFixed(0)}° 기울어짐` : '골반 기울기 정상',
    ],
  },
  presets: PRESETS,
};
