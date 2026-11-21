// 팔꿈치(오른쪽) — 모델·시점·자르기 범위·질환 프리셋
// 질환 문구는 원장님이 직접 고치거나 항목을 추가하는 곳
// stage: 0=겉근육부터 보기, 1=속근육부터, 2=인대부터, 3=뼈만
// view: 카메라 방향 [x, y, z]  (-x=바깥쪽(엄지 쪽), +x=안쪽(몸 쪽), +z=앞(손바닥 쪽), -z=뒤, +y=위)
// noGhost: 벗긴 층을 흐리게도 남기지 않음 / ghost: 반투명으로 남길 구조물

const BICEPS = ['Long_head_of_biceps_brachii', 'Short_head_of_biceps_brachii'];

const PRESETS = [
  {
    id: 'tennis',
    en: 'Lateral epicondylitis (tennis elbow)',
    title: '테니스엘보',
    sub: '외측상과염',
    stage: 0,
    ghost: ['Extensor_carpi_radialis_longus', 'Brachioradialis_muscle'],
    highlight: ['Extensor_carpi_radialis_brevis'],
    view: [-1, 0.15, 0.25],
    dist: 0.5,
    desc: '팔꿈치 바깥쪽 뼈(외측상과)에 붙는 손목 펴는 힘줄, 특히 단요측수근신근 힘줄이 반복되는 부담으로 상하는 병이에요. 물건을 쥐거나 손목을 펴는 동작을 반복할 때 생기고, 실제로 테니스 선수는 환자의 10% 정도예요.',
  },
  {
    id: 'golfer',
    en: "Medial epicondylitis (golfer's elbow)",
    title: '골프엘보',
    sub: '내측상과염',
    stage: 0,
    highlight: ['Superficial_head_of_pronator_teres', 'Flexor_carpi_radialis'],
    view: [1, 0.15, 0.3],
    dist: 0.5,
    desc: '팔꿈치 안쪽 뼈(내측상과)에 함께 붙는 손목 굽히는 근육·아래팔 돌리는 근육의 힘줄이 상하는 병이에요. 원회내근과 요측수근굴근이 가장 흔히 관여하고, 손목 굽히기와 아래팔을 안쪽으로 돌리는 동작을 반복할 때 생겨요. 테니스엘보보다는 드물어요.',
  },
  {
    id: 'ucl',
    en: 'Ulnar collateral ligament (UCL) injury',
    title: '팔꿈치 안쪽 인대 손상',
    sub: '내측측부인대(UCL) 손상',
    stage: 2,
    noGhost: true,
    highlight: ['Ulnar_collateral_ligament'],
    view: [1, 0.1, 0.2],
    dist: 0.42,
    desc: '공을 던질 때 팔꿈치 안쪽이 벌어지려는 힘을 막아 주는 가장 중요한 인대예요. 그래서 투수처럼 머리 위로 던지는 운동을 하는 사람에게 가장 흔히 다치는 인대예요.',
  },
  {
    id: 'pulled',
    en: "Radial head subluxation (nursemaid's elbow)",
    title: '소아 팔꿈치 빠짐',
    sub: '요골두 아탈구(당김 팔꿈치)',
    stage: 2,
    noGhost: true,
    highlight: ['Annular_ligament_of_radius'],
    hide: ['Articular_capsule_of_elbow_joint', 'Bicipitoradial_bursa'],
    view: [-0.7, 0.1, 0.7],
    dist: 0.38,
    desc: '노뼈 머리를 감싸 자뼈에 붙잡아 두는 고리 모양 인대(윤상인대)예요. 어린아이의 팔을 잡아당기거나 한 팔로 들어 올리면 노뼈 머리가 이 인대 밑으로 미끄러져 빠질 수 있어요. 1~4세에 흔하고, 대개 진료실에서 간단히 맞출 수 있어요.',
  },
  {
    id: 'distal-biceps',
    en: 'Distal biceps tendon rupture',
    title: '이두근 힘줄 파열(아래쪽)',
    sub: '원위 이두근건 파열',
    stage: 0,
    highlight: BICEPS,
    view: [0.25, 0.05, 1],
    dist: 0.55,
    desc: '알통 근육의 아래쪽 힘줄이 노뼈에 붙는 곳에서 끊어지는 손상이에요. 팔꿈치를 굽힌 채 버티다 억지로 펴질 때 생기고, 환자의 대부분이 35~54세 남성이에요.',
  },
];

export default {
  id: 'elbow',
  title: '팔꿈치',
  centerIds: ['Articular_capsule_of_elbow_joint'],
  // 위(위팔) 0.2m, 아래(아래팔) 0.22m 넘는 부분은 자름
  clip: [{ n: [0, 1, 0], o: 0.2 }, { n: [0, -1, 0], o: 0.22 }],
  ligamentLabel: '인대·관절낭',
  viewDist: 0.75,
  views: [
    ['앞', [-0.2, 0.1, 1]], ['바깥쪽', [-1, 0.1, 0.15]], ['안쪽', [1, 0.1, 0.15]], ['뒤', [-0.1, 0.1, -1]],
  ],
  // 평소에 반투명으로 보여줄 구조물(안쪽 인대를 가리는 관절낭)
  soft: ['Articular_capsule_of_elbow_joint'],
  presets: PRESETS,
};
