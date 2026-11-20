// 질환 프리셋 — 원장님이 직접 문구를 고치거나 항목을 추가하는 파일
// stage: 0=피부부터 보기, 1=근육부터, 2=인대·연골판부터, 3=뼈만
// view: 카메라 방향 [x, y, z]  (+x=안쪽, -x=바깥쪽, +z=앞, -z=뒤, +y=위)
// highlight: 빨갛게 강조할 구조물 id / highlightMaterial: 재질 이름으로 강조(연골 등)
// hide: 숨길 구조물 / ghost: 반투명으로 남길 구조물 / dist: 카메라 거리(기본 0.78, 작을수록 가까이)

const FRONT_SOFT = [
  'Medial_patellar_retinaculum', 'Lateral_patellar_retinaculum', 'Infrapatellar_fat_pad',
  'Subcutaneous_prepatellar_bursa', 'Deep_infrapatellar_bursa', 'Suprapatellar_bursa',
];

export const PRESETS = [
  {
    id: 'acl',
    title: '앞 십자인대 파열',
    sub: '전방십자인대(ACL) 손상',
    stage: 2,
    hide: ['Patella', ...FRONT_SOFT],
    ghost: ['Femur'],
    highlight: ['Anterior_cruciate_ligament'],
    view: [0.35, 0.05, 1],
    dist: 0.42,
    desc: '무릎 한가운데 깊은 곳에서 허벅지뼈와 정강이뼈를 이어, 정강이뼈가 앞으로 밀려나지 않게 잡아주는 인대예요. 방향을 갑자기 바꾸거나 점프 후 착지할 때 잘 다쳐요.',
  },
  {
    id: 'meniscus',
    title: '연골판 파열',
    sub: '내측 반월상연골 손상',
    stage: 2,
    hide: ['Femur', 'Patella', ...FRONT_SOFT, 'Oblique_popliteal_ligament'],
    highlight: ['Medial_meniscus'],
    view: [0.1, 1, 0.3],
    dist: 0.5,
    desc: '허벅지뼈와 정강이뼈 사이에서 쿠션 역할을 하는 C자 모양 연골이에요. 무릎을 굽힌 채 비틀 때 잘 찢어지고, 나이가 들면 작은 힘에도 손상될 수 있어요. (허벅지뼈를 숨기고 위에서 본 모습)',
  },
  {
    id: 'oa',
    title: '퇴행성 관절염',
    sub: '관절 연골 마모',
    stage: 3,
    ghost: ['Patella'],
    highlightMaterial: 'Cartilage',
    view: [0.6, 0.15, 1],
    desc: '뼈 끝을 덮어 매끄럽게 움직이게 해주는 연골(빨간 부분)이 닳으면서 통증과 붓기가 생겨요. 주로 안쪽 연골이 먼저 닳는 경우가 많아요.',
  },
  {
    id: 'mcl',
    title: '안쪽 인대 손상',
    sub: '내측측부인대(MCL) 손상',
    stage: 2,
    hide: ['Anserine_bursa'],
    highlight: ['Superficial_part_of_tibial_collateral_ligament', 'Deep_part_of_tibial_collateral_ligament'],
    view: [1, 0.1, 0.25],
    desc: '무릎 안쪽 벽을 잡아주는 인대예요. 무릎 바깥쪽에서 힘을 받아 안쪽이 벌어질 때 늘어나거나 찢어져요.',
  },
  {
    id: 'pes',
    title: '거위발 건염',
    sub: '거위발 점액낭염·건염',
    stage: 1,
    highlight: ['Sartorius_muscle', 'Gracilis_muscle', 'Semitendinosus_muscle', 'Anserine_bursa'],
    view: [1, 0, 0.45],
    desc: '허벅지 안쪽의 세 근육(봉공근·박근·반건양근) 힘줄이 정강이뼈 안쪽 아래에 함께 붙는 자리예요. 이곳 힘줄이나 물주머니에 염증이 생기면 무릎 안쪽 아래가 아파요.',
  },
  {
    id: 'itb',
    title: '장경인대 증후군',
    sub: '장경인대 마찰 증후군',
    stage: 1,
    highlight: ['Iliotibial_tract'],
    view: [-1, 0.05, 0.25],
    desc: '허벅지 바깥쪽을 따라 무릎 아래까지 내려오는 두꺼운 띠예요. 달리기처럼 무릎을 반복해서 굽혔다 펼 때 무릎 바깥쪽에 통증이 생길 수 있어요.',
  },
];
