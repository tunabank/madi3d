# 허리 뷰어에 들어갈 구조물 목록 (Z-Anatomy, 가운데 구조물 + 좌우 양쪽)
# layer: muscle_sup(겉근육) / muscle_deep(속근육) / ligament(디스크·인대·신경 주머니) / bone
# easy: 환자용 쉬운 이름, ko: 의학 용어

def both(name, layer, easy, ko):
    return [(f"{name}.r", layer, easy, ko), (f"{name}.l", layer, easy, ko)]

PARTS = [
    # --- 뼈 ---
    ("Vertebra T10", "bone", "10번 등뼈", "흉추 T10"),
    ("Vertebra T11", "bone", "11번 등뼈", "흉추 T11"),
    ("Vertebra T12", "bone", "12번 등뼈", "흉추 T12"),
    ("Vertebra L1", "bone", "1번 허리뼈", "요추 L1"),
    ("Vertebra L2", "bone", "2번 허리뼈", "요추 L2"),
    ("Vertebra L3", "bone", "3번 허리뼈", "요추 L3"),
    ("Vertebra L4", "bone", "4번 허리뼈", "요추 L4"),
    ("Vertebra L5", "bone", "5번 허리뼈", "요추 L5"),
    ("Sacrum", "bone", "엉치뼈", "천골"),
    ("Coccyx", "bone", "꼬리뼈", "미골"),
    *both("Hip bone", "bone", "골반뼈", "관골"),
    *both("Femur", "bone", "허벅지뼈", "대퇴골"),

    # --- 디스크·인대·신경 ---
    ("Intervertebral disc T10-T11", "ligament", "등 디스크 T10-11", "추간판 T10-T11"),
    ("Intervertebral disc T11-T12", "ligament", "등 디스크 T11-12", "추간판 T11-T12"),
    ("Intervertebral disc T12-L1", "ligament", "디스크 T12-L1", "추간판 T12-L1"),
    ("Intervertebral disc L1-L2", "ligament", "허리 디스크 L1-2", "추간판 L1-L2"),
    ("Intervertebral disc L2-L3", "ligament", "허리 디스크 L2-3", "추간판 L2-L3"),
    ("Intervertebral disc L3-L4", "ligament", "허리 디스크 L3-4", "추간판 L3-L4"),
    ("Intervertebral disc L4-L5", "ligament", "허리 디스크 L4-5", "추간판 L4-L5"),
    ("Intervertebral disc L5-S1", "ligament", "허리 디스크 L5-S1", "추간판 L5-S1"),
    ("Anterior longitudinal ligament", "ligament", "척추 앞 인대", "전종인대"),
    ("Posterior longitudinal ligament", "ligament", "척추 뒤 인대(디스크 뒤)", "후종인대"),
    ("Ligamenta flava", "ligament", "척추관 뒤 노란 인대", "황색인대"),
    ("Interspinous ligaments", "ligament", "가시돌기 사이 인대", "극간인대"),
    ("Supraspinous ligament", "ligament", "가시돌기 끝 인대", "극상인대"),
    *both("Iliolumbar ligament", "ligament", "허리뼈-골반 인대", "장요인대"),
    ("Pubic symphysis", "ligament", "골반 앞 연결 연골", "치골결합"),
    ("Spinal dura", "ligament", "신경 주머니(척수막)", "경막(경막낭)"),
    *both("Spinal ganglion", "ligament", "신경 뿌리 마디", "척수신경절"),

    # --- 겉근육 ---
    *both("Iliocostalis lumborum muscle", "muscle_sup", "허리 세움 근육(바깥)", "요장늑근(척추기립근)"),
    *both("Longissimus thoracis muscle", "muscle_sup", "허리 세움 근육(가운데)", "흉최장근(척추기립근)"),
    *both("Spinalis thoracis muscle", "muscle_sup", "허리 세움 근육(안쪽)", "흉극근(척추기립근)"),
    *both("Gluteus maximus muscle", "muscle_sup", "엉덩이 큰 근육", "대둔근"),
    *both("Gluteus medius muscle", "muscle_sup", "엉덩이 옆 근육", "중둔근"),
    *both("Rectus abdominis muscle", "muscle_sup", "배 앞 근육(복근)", "복직근"),

    # --- 속근육 ---
    *both("Multifidus lumborum muscle", "muscle_deep", "허리뼈 사이 짧은 근육", "다열근(요부)"),
    *both("Quadratus lumborum muscle", "muscle_deep", "허리 옆 깊은 근육", "요방형근"),
    *both("Psoas major", "muscle_deep", "허리 앞 깊은 근육", "대요근(장요근)"),
    *both("Iliacus muscle", "muscle_deep", "골반 안쪽 근육", "장골근(장요근)"),
    *both("Transversus abdominis muscle", "muscle_deep", "배를 감싸는 깊은 근육", "복횡근"),
    *both("Gluteus minimus muscle", "muscle_deep", "엉덩이 깊은 근육", "소둔근"),
    *both("Piriformis muscle", "muscle_deep", "엉덩이 속 근육", "이상근"),
]
