// 발목(오른쪽) — 모델·시점·자르기 범위·질환 프리셋
// 질환 문구는 원장님이 직접 고치거나 항목을 추가하는 곳
// stage: 0=겉근육부터 보기, 1=속근육부터, 2=인대부터, 3=뼈만
// view: 카메라 방향 [x, y, z]  (-x=바깥쪽(새끼발가락 쪽), +x=안쪽, +z=앞(발끝), -z=뒤(뒤꿈치), +y=위)
// noGhost: 벗긴 층을 흐리게도 남기지 않음

const RETINACULA = ['Superior_extensor_retinaculum_of_ankle', 'Inferior_extensor_retinaculum_of_ankle',
  'Flexor_retinaculum_of_ankle', 'Superior_fibular_retinaculum', 'Inferior_fibular_retinaculum'];
const DELTOID = ['Tibionavicular_ligament', 'Tibiocalcaneal_ligament', 'Posterior_tibiotalar_ligament'];

const PRESETS = [
  {
    id: 'lateral-sprain',
    en: 'Lateral ankle sprain (ATFL · CFL)',
    title: '발목 염좌',
    sub: '바깥쪽 인대 손상(ATFL·CFL)',
    stage: 2,
    noGhost: true,
    hide: RETINACULA,
    highlight: ['Anterior_talofibular_ligament', 'Calcaneofibular_ligament'],
    view: [-1, 0.15, 0.4],
    dist: 0.42,
    desc: '발목이 안쪽으로 꺾이면서 바깥쪽 인대가 늘어나거나 찢어지는 손상이에요. 가장 많이 다치는 인대는 앞쪽의 전거비인대이고, 그다음이 아래쪽의 종비인대예요.',
  },
  {
    id: 'high-sprain',
    en: 'High ankle sprain (syndesmosis)',
    title: '고위 발목 염좌',
    sub: '인대결합(경비인대) 손상',
    stage: 2,
    noGhost: true,
    hide: RETINACULA,
    highlight: ['Anterior_tibiofibular_ligament', 'Posterior_tibiofibular_ligament'],
    view: [-0.75, 0.3, 0.7],
    dist: 0.45,
    desc: '정강이뼈와 종아리뼈 아래쪽을 묶어 주는 인대(인대결합)가 다치는 거예요. 주로 발이 바깥으로 돌아가거나 발등 쪽으로 심하게 꺾일 때 생기고, 일반 발목 염좌보다는 드물어요.',
  },
  {
    id: 'medial',
    en: 'Deltoid ligament injury',
    title: '발목 안쪽 인대 손상',
    sub: '삼각인대 손상',
    stage: 2,
    noGhost: true,
    hide: RETINACULA,
    highlight: DELTOID,
    view: [1, 0.15, 0.2],
    dist: 0.42,
    desc: '발목 안쪽을 부채 모양으로 잡아 주는 튼튼한 인대(삼각인대)예요. 발목이 바깥으로 꺾일 때 다치는데, 바깥쪽 염좌보다 드물어요.',
  },
  {
    id: 'achilles',
    en: 'Achilles tendinopathy / rupture',
    title: '아킬레스건염·파열',
    sub: '아킬레스건(종골건)',
    stage: 0,
    highlight: ['Calcaneal_tendon'],
    view: [-0.6, 0.15, -0.8],
    dist: 0.5,
    desc: '종아리 근육(비복근·가자미근)이 모여 발뒤꿈치뼈에 붙는, 몸에서 가장 굵은 힘줄이에요. 뒤꿈치에서 2~6cm 위쪽은 피가 적게 가는 곳이라 잘 다쳐요. 달리기·점프를 많이 하면 흔하고, 하지에서 가장 많이 끊어지는 힘줄이기도 해요.',
  },
  {
    id: 'plantar',
    en: 'Plantar fasciitis',
    title: '족저근막염',
    sub: '발바닥 근막 손상',
    stage: 0,
    highlight: ['Plantar_aponeurosis'],
    view: [0.55, -0.75, 0.2],
    dist: 0.45,
    desc: '발뒤꿈치뼈 안쪽에서 시작해 발가락까지 펼쳐진 두꺼운 막(족저근막)이에요. 반복되는 부담으로 뒤꿈치 붙는 곳에 미세한 손상이 생기고, 아침에 첫발을 디딜 때 뒤꿈치가 아픈 게 특징이에요. 40~60세에 많아요.',
  },
  {
    id: 'pttd',
    en: 'Posterior tibial tendon dysfunction (adult acquired flatfoot)',
    title: '후경골근건 기능장애',
    sub: '성인 평발의 원인',
    stage: 1,
    hide: RETINACULA,
    highlight: ['Tibialis_posterior_muscle', 'Plantar_calcaneonavicular_ligament'],
    view: [1, 0.05, 0.1],
    dist: 0.5,
    desc: '종아리 가장 깊은 근육(후경골근)의 힘줄은 안쪽 복사뼈 뒤를 돌아 발배뼈에 붙어 발 안쪽 아치를 받쳐요. 이 힘줄이 약해지면 아치를 받치는 스프링 인대까지 늘어나, 어른이 되어 생기는 평발의 가장 흔한 원인이 돼요.',
  },
];

export default {
  id: 'ankle',
  title: '발목',
  centerIds: ['Talus'],
  // 위(종아리) 0.2m, 아래 0.12m 넘는 부분은 자름
  clip: [{ n: [0, 1, 0], o: 0.2 }, { n: [0, -1, 0], o: 0.12 }],
  ligamentLabel: '인대·힘줄',
  viewDist: 0.75,
  views: [
    ['바깥쪽', [-1, 0.15, 0.15]], ['안쪽', [1, 0.15, 0.15]], ['앞', [-0.2, 0.25, 1]], ['뒤', [-0.2, 0.2, -1]], ['발바닥', [0.1, -1, 0.15]],
  ],
  // 평소에 반투명으로 보여줄 구조물: 힘줄 고정띠(지대)는 그 아래 힘줄이 보이도록
  soft: RETINACULA,
  presets: PRESETS,
};
