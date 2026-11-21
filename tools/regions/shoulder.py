# 어깨 뷰어에 들어갈 구조물 목록 (Z-Anatomy 오른쪽, ".r")
# layer: skin / muscle_sup(겉근육) / muscle_deep(속근육) / ligament(인대·관절낭·연골·점액낭) / bone
# easy: 환자용 쉬운 이름, ko: 의학 용어

PARTS = [
    # --- 뼈 ---
    ("Scapula.r", "bone", "어깨뼈(날개뼈)", "견갑골"),
    ("Clavicle.r", "bone", "빗장뼈", "쇄골"),
    ("Humerus.r", "bone", "위팔뼈", "상완골"),

    # --- 인대·관절낭·연골·점액낭 ---
    ("Glenoid labrum.r", "ligament", "어깨 관절 테두리 연골", "관절와순"),
    ("Articular capsule of glenohumeral joint.r", "ligament", "어깨 관절 주머니", "견관절 관절낭"),
    ("Superior glenohumeral ligament.r", "ligament", "어깨 관절 인대(위)", "상관절상완인대"),
    ("Middle glenohumeral ligament.r", "ligament", "어깨 관절 인대(가운데)", "중관절상완인대"),
    ("Inferior glenohumeral ligament.r", "ligament", "어깨 관절 인대(아래)", "하관절상완인대"),
    ("Coracohumeral ligament.r", "ligament", "부리돌기-위팔 인대", "오구상완인대"),
    ("Coraco-acromial ligament.r", "ligament", "어깨 지붕 인대", "오구견봉인대"),
    ("Acromioclavicular ligament.r", "ligament", "빗장뼈 끝 인대", "견봉쇄골인대"),
    ("Articular capsule of acromioclavicular joint.r", "ligament", "빗장뼈 끝 관절 주머니", "견봉쇄골관절 관절낭"),
    ("Trapezoid ligament.r", "ligament", "빗장뼈 고정 인대(바깥)", "능형인대(오구쇄골인대)"),
    ("Conoid ligament.r", "ligament", "빗장뼈 고정 인대(안쪽)", "원추인대(오구쇄골인대)"),
    ("Transverse humeral ligament.r", "ligament", "이두근 힘줄 고정 인대", "상완횡인대"),
    ("Subacromial bursa.r", "ligament", "어깨 지붕 아래 물주머니", "견봉하 점액낭"),
    ("Subdeltoid bursa.r", "ligament", "삼각근 아래 물주머니", "삼각근하 점액낭"),
    ("Subcutaneous acromial bursa.r", "ligament", "어깨 끝 피부 아래 물주머니", "피하 견봉 점액낭"),

    # --- 겉근육 ---
    ("Clavicular part of deltoid muscle.r", "muscle_sup", "어깨 근육(앞)", "삼각근 전방섬유"),
    ("Acromial part of deltoid muscle.r", "muscle_sup", "어깨 근육(가운데)", "삼각근 중간섬유"),
    ("Scapular spinal part of deltoid muscle.r", "muscle_sup", "어깨 근육(뒤)", "삼각근 후방섬유"),
    ("Descending part of trapezius muscle.r", "muscle_sup", "등 위쪽 근육(위)", "승모근 상부"),
    ("Transverse part of trapezius muscle.r", "muscle_sup", "등 위쪽 근육(가운데)", "승모근 중부"),
    ("Ascending part of trapezius muscle.r", "muscle_sup", "등 위쪽 근육(아래)", "승모근 하부"),
    ("Clavicular head of pectoralis major muscle.r", "muscle_sup", "가슴 근육(위)", "대흉근 쇄골두"),
    ("Sternocostal head of pectoralis major muscle.r", "muscle_sup", "가슴 근육", "대흉근 흉늑부"),
    ("Latissimus dorsi muscle.r", "muscle_sup", "넓은 등 근육", "광배근"),
    ("Long head of biceps brachii.r", "muscle_sup", "알통 근육(긴 갈래)", "상완이두근 장두"),
    ("Short head of biceps brachii.r", "muscle_sup", "알통 근육(짧은 갈래)", "상완이두근 단두"),
    ("Long head of triceps brachii.r", "muscle_sup", "팔 뒤 근육(긴 갈래)", "상완삼두근 장두"),
    ("Lateral head of triceps brachii.r", "muscle_sup", "팔 뒤 근육(바깥 갈래)", "상완삼두근 외측두"),

    # --- 속근육 (회전근개 등) ---
    ("Supraspinatus muscle.r", "muscle_deep", "어깨 위 힘줄 근육", "극상근 (회전근개)"),
    ("Infraspinatus muscle.r", "muscle_deep", "어깨 뒤 힘줄 근육", "극하근 (회전근개)"),
    ("Teres minor muscle.r", "muscle_deep", "어깨 뒤 작은 근육", "소원근 (회전근개)"),
    ("Subscapularis muscle.r", "muscle_deep", "어깨 앞 힘줄 근육", "견갑하근 (회전근개)"),
    ("Teres major muscle.r", "muscle_deep", "겨드랑이 뒤 근육", "대원근"),
    ("Pectoralis minor muscle.r", "muscle_deep", "작은 가슴 근육", "소흉근"),
    ("Coracobrachialis muscle.r", "muscle_deep", "위팔 안쪽 근육", "오구완근"),
    ("Medial head of triceps brachii.r", "muscle_deep", "팔 뒤 근육(안쪽 갈래)", "상완삼두근 내측두"),
    ("Rhomboid major muscle.r", "muscle_deep", "날개뼈 안쪽 근육", "대능형근"),
    ("Rhomboid minor muscle.r", "muscle_deep", "날개뼈 안쪽 근육(위)", "소능형근"),
    ("Levator scapulae.r", "muscle_deep", "날개뼈 올리는 근육", "견갑거근"),
    ("Serratus anterior muscle.r", "muscle_deep", "옆구리 톱니 근육", "전거근"),

    # --- 피부 ---
    ("Deltoid region.r", "skin", "피부", "피부(어깨)"),
    ("Pectoral region.r", "skin", "피부", "피부(가슴)"),
    ("Scapular region.r", "skin", "피부", "피부(날개뼈)"),
    ("Infrascapular region.r", "skin", "피부", "피부(날개뼈 아래)"),
    ("Anterior region of arm.r", "skin", "피부", "피부(위팔 앞)"),
    ("Posterior region of arm.r", "skin", "피부", "피부(위팔 뒤)"),
    ("Mammary region.r", "skin", "피부", "피부(가슴)"),
    ("Inframammary region.r", "skin", "피부", "피부(가슴 아래)"),
    ("Infraclavicular fossa.r", "skin", "피부", "피부(빗장뼈 아래)"),
    ("Greater supraclavicular fossa.r", "skin", "피부", "피부(빗장뼈 위)"),
    ("Lesser supraclavicular fossa.r", "skin", "피부", "피부(빗장뼈 위 안쪽)"),
    ("Lateral region of thorax.r", "skin", "피부", "피부(옆구리)"),
    ("Interscapular region.r", "skin", "피부", "피부(날개뼈 사이)"),
    ("Triangle of auscultation.r", "skin", "피부", "피부(날개뼈 아래 안쪽)"),
    ("Lateral region of neck.r", "skin", "피부", "피부(목 옆)"),
    ("Posterior region of neck.r", "skin", "피부", "피부(목 뒤)"),
    ("Lateral bicipital groove.r", "skin", "피부", "피부(위팔 바깥)"),
    ("Medial bicipital groove.r", "skin", "피부", "피부(위팔 안쪽)"),
    ("Presternal region.r", "skin", "피부", "피부(가슴 가운데)"),
    ("Vertebral region.r", "skin", "피부", "피부(등 가운데)"),
]
