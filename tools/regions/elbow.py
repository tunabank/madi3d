# 팔꿈치 뷰어에 들어갈 구조물 목록 (Z-Anatomy 오른쪽 팔, ".r")
# layer: muscle_sup(겉근육) / muscle_deep(속근육) / ligament(인대·관절낭·점액낭) / bone
# easy: 환자용 쉬운 이름, ko: 의학 용어

PARTS = [
    # --- 뼈 ---
    ("Humerus.r", "bone", "위팔뼈", "상완골"),
    ("Radius.r", "bone", "노뼈(엄지 쪽 아래팔뼈)", "요골"),
    ("Ulna.r", "bone", "자뼈(새끼 쪽 아래팔뼈)", "척골"),

    # --- 인대·관절낭·점액낭 ---
    ("Ulnar collateral ligament.r", "ligament", "팔꿈치 안쪽 인대", "내측측부인대(척측측부인대, UCL)"),
    ("Radial collateral ligament.r", "ligament", "팔꿈치 바깥쪽 인대", "외측측부인대(요측측부인대)"),
    ("Annular ligament of radius.r", "ligament", "노뼈 머리를 감싸는 고리 인대", "윤상인대"),
    ("Articular capsule of elbow joint.r", "ligament", "팔꿈치 관절 주머니", "주관절 관절낭"),
    ("Quadrate ligament.r", "ligament", "노뼈-자뼈 사이 짧은 인대", "방형인대"),
    ("Oblique cord.r", "ligament", "노뼈-자뼈 사이 비스듬한 끈", "사삭"),
    ("Interosseous membrane of forearm.r", "ligament", "아래팔뼈 사이 막", "전완 골간막"),
    ("Bicipitoradial bursa.r", "ligament", "이두근 힘줄 아래 물주머니", "이두요골 점액낭"),
    ("Subtendinous bursa of triceps brachii muscle.r", "ligament", "삼두근 힘줄 아래 물주머니", "삼두근 건하 점액낭"),

    # --- 겉근육 ---
    ("Long head of biceps brachii.r", "muscle_sup", "알통 근육(긴 갈래)", "상완이두근 장두"),
    ("Short head of biceps brachii.r", "muscle_sup", "알통 근육(짧은 갈래)", "상완이두근 단두"),
    ("Long head of triceps brachii.r", "muscle_sup", "팔 뒤 근육(긴 갈래)", "상완삼두근 장두"),
    ("Lateral head of triceps brachii.r", "muscle_sup", "팔 뒤 근육(바깥 갈래)", "상완삼두근 외측두"),
    ("Brachioradialis muscle.r", "muscle_sup", "아래팔 바깥 굵은 근육", "완요골근"),
    ("Extensor carpi radialis longus.r", "muscle_sup", "손목 펴는 근육(엄지 쪽, 긴)", "장요측수근신근"),
    ("Extensor carpi radialis brevis.r", "muscle_sup", "손목 펴는 근육(엄지 쪽, 짧은)", "단요측수근신근"),
    ("Extensor digitorum.r", "muscle_sup", "손가락 펴는 근육", "총지신근"),
    ("Extensor digiti minimi.r", "muscle_sup", "새끼손가락 펴는 근육", "소지신근"),
    ("Humeral head of extensor carpi ulnaris.r", "muscle_sup", "손목 펴는 근육(새끼 쪽)", "척측수근신근"),
    ("Ulnar head of extensor carpi ulnaris.r", "muscle_sup", "손목 펴는 근육(새끼 쪽)", "척측수근신근"),
    ("Anconeus muscle.r", "muscle_sup", "팔꿈치 뒤 작은 근육", "주근"),
    ("Superficial head of pronator teres.r", "muscle_sup", "아래팔 돌리는 근육(엎침)", "원회내근"),
    ("Flexor carpi radialis.r", "muscle_sup", "손목 굽히는 근육(엄지 쪽)", "요측수근굴근"),
    ("Palmaris longus muscle.r", "muscle_sup", "손바닥 긴 근육", "장장근"),
    ("Humeral head of flexor carpi ulnaris.r", "muscle_sup", "손목 굽히는 근육(새끼 쪽)", "척측수근굴근"),
    ("Ulnar head of flexor carpi ulnaris.r", "muscle_sup", "손목 굽히는 근육(새끼 쪽)", "척측수근굴근"),

    # --- 속근육 ---
    ("Brachialis muscle.r", "muscle_deep", "알통 아래 깊은 근육", "상완근"),
    ("Medial head of triceps brachii.r", "muscle_deep", "팔 뒤 근육(안쪽 갈래)", "상완삼두근 내측두"),
    ("Supinator.r", "muscle_deep", "아래팔 돌리는 근육(뒤침)", "회외근"),
    ("Deep head of pronator teres.r", "muscle_deep", "아래팔 돌리는 근육(엎침, 깊은)", "원회내근"),
    ("Humero-ulnar head of flexor digitorum superficialis.r", "muscle_deep", "손가락 굽히는 근육(얕은)", "천지굴근"),
    ("Radial head of flexor digitorum superficialis.r", "muscle_deep", "손가락 굽히는 근육(얕은)", "천지굴근"),
    ("Flexor digitorum profundus.r", "muscle_deep", "손가락 굽히는 근육(깊은)", "심지굴근"),
    ("Flexor pollicis longus.r", "muscle_deep", "엄지 굽히는 근육", "장무지굴근"),
    ("Abductor pollicis longus.r", "muscle_deep", "엄지 벌리는 근육", "장무지외전근"),
    ("Extensor pollicis longus.r", "muscle_deep", "엄지 펴는 근육(긴)", "장무지신근"),
    ("Extensor pollicis brevis.r", "muscle_deep", "엄지 펴는 근육(짧은)", "단무지신근"),
    ("Extensor indicis.r", "muscle_deep", "검지 펴는 근육", "시지신근"),
]
