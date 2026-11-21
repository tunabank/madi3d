// 어깨(오른쪽) — 모델·시점·자르기 범위·질환 프리셋
// 질환 문구는 원장님이 직접 고치거나 항목을 추가하는 곳
// stage: 0=겉근육부터 보기, 1=속근육부터, 2=인대부터, 3=뼈만
// view: 카메라 방향 [x, y, z]  (-x=바깥쪽(팔 쪽), +x=몸 안쪽, +z=앞, -z=뒤, +y=위)
// highlight: 빨갛게 강조 / hide: 숨김 / ghost: 반투명 / dist: 카메라 거리

const DELTOID = ['Clavicular_part_of_deltoid_muscle', 'Acromial_part_of_deltoid_muscle', 'Scapular_spinal_part_of_deltoid_muscle'];
const PEC_MAJOR = ['Clavicular_head_of_pectoralis_major_muscle', 'Sternocostal_head_of_pectoralis_major_muscle'];
const CUFF = ['Supraspinatus_muscle', 'Infraspinatus_muscle', 'Teres_minor_muscle', 'Subscapularis_muscle'];

const PRESETS = [
  {
    id: 'cuff',
    title: '회전근개란?',
    sub: '극상근·극하근·소원근·견갑하근',
    stage: 1,
    highlight: CUFF,
    view: [-1, 0.35, 0.1],
    desc: '어깨뼈에서 시작해 위팔뼈 머리를 앞·위·뒤로 감싸는 네 개의 근육과 힘줄이에요. 팔을 들고 돌릴 때 위팔뼈 머리를 관절 소켓에 붙잡아 두는 역할을 해요.',
  },
  {
    id: 'cuff-tear',
    title: '회전근개 파열',
    sub: '극상근 힘줄 파열',
    stage: 1,
    highlight: ['Supraspinatus_muscle'],
    view: [-0.75, 0.85, 0.15],
    dist: 0.6,
    desc: '회전근개 중 어깨 위쪽을 지나는 극상근 힘줄이 가장 흔하게 찢어져요. 팔을 옆으로 들어 올릴 때 아프거나 힘이 빠지고, 밤에 아파서 잠을 깨기도 해요.',
  },
  {
    id: 'impingement',
    title: '어깨 충돌 증후군',
    sub: '견봉하 충돌 증후군',
    stage: 1,
    highlight: ['Supraspinatus_muscle', 'Subacromial_bursa', 'Subdeltoid_bursa', 'Coraco-acromial_ligament'],
    view: [-1, 0.45, 0.45],
    dist: 0.6,
    desc: '어깨 지붕(견봉과 오구견봉인대) 아래 좁은 공간을 극상근 힘줄과 물주머니(점액낭)가 지나가요. 팔을 들 때 이 공간에서 힘줄과 물주머니가 끼이고 부딪히면서 염증과 통증이 생겨요.',
  },
  {
    id: 'frozen',
    title: '오십견',
    sub: '유착성 관절낭염',
    stage: 2,
    highlight: ['Articular_capsule_of_glenohumeral_joint'],
    view: [-0.6, 0.15, 1],
    dist: 0.55,
    desc: '어깨 관절을 감싸는 주머니(관절낭)에 염증이 생기고 두꺼워지며 쪼그라드는 병이에요. 아픈 것과 함께 팔이 여러 방향으로 잘 안 움직이게 돼요.',
  },
  {
    id: 'biceps',
    title: '이두근 장두건염',
    sub: '상완이두근 장두건염',
    stage: 0,
    hide: [...DELTOID, ...PEC_MAJOR],
    highlight: ['Long_head_of_biceps_brachii', 'Transverse_humeral_ligament'],
    view: [-0.35, 0.15, 1],
    desc: '알통 근육(이두근)의 긴 힘줄은 위팔뼈 앞쪽 홈을 따라 올라가 어깨 관절 안까지 들어가요. 이 힘줄에 염증이 생기면 어깨 앞쪽이 아프고, 팔을 앞으로 들거나 물건을 들 때 심해져요.',
  },
  {
    id: 'labrum',
    title: '관절와순 파열',
    sub: '관절와순 손상(SLAP 등)',
    stage: 2,
    hide: ['Humerus', 'Articular_capsule_of_glenohumeral_joint', 'Coracohumeral_ligament',
      'Superior_glenohumeral_ligament', 'Middle_glenohumeral_ligament', 'Inferior_glenohumeral_ligament',
      'Subacromial_bursa', 'Subdeltoid_bursa', 'Subcutaneous_acromial_bursa', 'Transverse_humeral_ligament'],
    highlight: ['Glenoid_labrum'],
    view: [-1, 0.1, 0.2],
    dist: 0.5,
    desc: '어깨 관절 소켓(관절와) 가장자리를 둘러싼 연골 테두리예요. 넘어지면서 팔을 짚거나, 던지는 동작을 반복하면 찢어질 수 있고, 어깨가 걸리거나 빠질 것 같은 느낌이 생겨요. (위팔뼈를 숨기고 소켓을 정면에서 본 모습)',
  },
  {
    id: 'ac',
    title: '견봉쇄골관절 손상',
    sub: 'AC 관절 탈구·염좌',
    stage: 2,
    hide: ['Subcutaneous_acromial_bursa'],
    highlight: ['Acromioclavicular_ligament', 'Articular_capsule_of_acromioclavicular_joint', 'Trapezoid_ligament', 'Conoid_ligament'],
    view: [-0.35, 1, 0.5],
    dist: 0.6,
    desc: '빗장뼈(쇄골) 끝과 어깨뼈 끝(견봉)이 만나는 관절이에요. 어깨 쪽으로 넘어지면 이곳 인대가 늘어나거나 끊어지고, 심하면 빗장뼈 끝이 위로 튀어나와요.',
  },
];

export default {
  id: 'shoulder',
  title: '어깨',
  centerIds: ['Glenoid_labrum', 'Subacromial_bursa', 'Coraco-acromial_ligament'],
  // 위(목 쪽) 0.12m, 아래(팔) 0.26m, 몸 안쪽 0.16m 넘는 부분은 자름
  clip: [{ n: [0, 1, 0], o: 0.12 }, { n: [0, -1, 0], o: 0.26 }, { n: [1, 0, 0], o: 0.16 }],
  ligamentLabel: '인대·관절낭',
  viewDist: 0.8,
  views: [
    ['앞', [-0.35, 0.1, 1]], ['바깥쪽', [-1, 0.15, 0.15]], ['뒤', [-0.35, 0.15, -1]], ['위', [-0.3, 1, 0.15]],
  ],
  // 평소에 반투명으로 보여줄 구조물(안쪽을 가리는 관절낭)
  soft: ['Articular_capsule_of_glenohumeral_joint'],
  presets: PRESETS,
};
