# 무릎 뷰어에 들어갈 구조물 목록 (Z-Anatomy 오른쪽 다리, ".r")
# layer: muscle_sup(겉근육) / muscle_deep(속근육) / ligament(인대·연골판·점액낭) / bone(뼈)
# easy: 환자용 쉬운 이름, ko: 의학 용어

PARTS = [
    # --- 뼈 ---
    ("Femur.r", "bone", "허벅지뼈", "대퇴골"),
    ("Tibia.r", "bone", "정강이뼈", "경골"),
    ("Fibula.r", "bone", "종아리뼈", "비골"),
    ("Patella.r", "bone", "무릎뼈(슬개골)", "슬개골"),

    # --- 인대·연골판 ---
    ("Anterior cruciate ligament.r", "ligament", "앞 십자인대", "전방십자인대(ACL)"),
    ("Posterior cruciate ligament.r", "ligament", "뒤 십자인대", "후방십자인대(PCL)"),
    ("Superficial part of tibial collateral ligament.r", "ligament", "안쪽 인대", "내측측부인대(MCL) 표층"),
    ("Deep part of tibial collateral ligament.r", "ligament", "안쪽 인대(깊은 층)", "내측측부인대(MCL) 심층"),
    ("Fibular collateral ligament.r", "ligament", "바깥쪽 인대", "외측측부인대(LCL)"),
    ("Medial meniscus.r", "ligament", "안쪽 연골판", "내측 반월상연골"),
    ("Lateral meniscus.r", "ligament", "바깥쪽 연골판", "외측 반월상연골"),
    ("Transverse ligament of knee.r", "ligament", "연골판 연결 인대", "슬횡인대"),
    ("Oblique popliteal ligament.r", "ligament", "무릎 뒤 인대", "사슬와인대"),
    ("Arcuate popliteal ligament.r", "ligament", "무릎 뒤 바깥 인대", "궁상슬와인대"),
    ("Popliteofibular ligament.r", "ligament", "무릎 뒤 바깥 인대", "슬와비골인대"),
    ("Medial patellar retinaculum.r", "ligament", "무릎뼈 안쪽 지지띠", "내측 슬개지대"),
    ("Lateral patellar retinaculum.r", "ligament", "무릎뼈 바깥쪽 지지띠", "외측 슬개지대"),
    ("Infrapatellar fat pad.r", "ligament", "무릎뼈 아래 지방", "슬개하 지방체"),
    ("Suprapatellar bursa.r", "ligament", "무릎뼈 위 물주머니", "슬개상낭"),
    ("Subcutaneous prepatellar bursa.r", "ligament", "무릎뼈 앞 물주머니", "피하 슬개전낭"),
    ("Deep infrapatellar bursa.r", "ligament", "무릎뼈 아래 물주머니", "심부 슬개하낭"),
    ("Anserine bursa.r", "ligament", "거위발 물주머니", "거위발 점액낭(거위발건염 부위)"),
    ("Semimembranosus bursa.r", "ligament", "무릎 뒤 물주머니", "반막양근 점액낭"),

    # --- 근육 ---
    ("Rectus femoris muscle.r", "muscle_sup", "허벅지 앞 근육(가운데)", "대퇴직근"),
    ("Vastus lateralis muscle.r", "muscle_sup", "허벅지 앞 근육(바깥)", "외측광근"),
    ("Vastus medialis muscle.r", "muscle_sup", "허벅지 앞 근육(안쪽)", "내측광근"),
    ("Vastus intermedius muscle.r", "muscle_deep", "허벅지 앞 근육(깊은 층)", "중간광근"),
    ("Sartorius muscle.r", "muscle_sup", "허벅지 안쪽 긴 근육", "봉공근"),
    ("Gracilis muscle.r", "muscle_sup", "허벅지 안쪽 근육", "박근"),
    ("Semitendinosus muscle.r", "muscle_sup", "허벅지 뒤 근육(안쪽)", "반건양근"),
    ("Semimembranosus muscle.r", "muscle_deep", "허벅지 뒤 근육(안쪽 깊은 층)", "반막양근"),
    ("Long head of biceps femoris.r", "muscle_sup", "허벅지 뒤 근육(바깥)", "대퇴이두근 장두"),
    ("Short head of biceps femoris.r", "muscle_deep", "허벅지 뒤 근육(바깥 깊은 층)", "대퇴이두근 단두"),
    ("Medial head of gastrocnemius.r", "muscle_sup", "종아리 근육(안쪽)", "비복근 내측두"),
    ("Lateral head of gastrocnemius.r", "muscle_sup", "종아리 근육(바깥)", "비복근 외측두"),
    ("Popliteus muscle.r", "muscle_deep", "무릎 뒤 작은 근육", "슬와근"),
    ("Plantaris muscle.r", "muscle_deep", "종아리 가는 근육", "족저근"),
    ("Iliotibial tract.r", "muscle_sup", "허벅지 바깥 띠", "장경인대(장경대)"),

    # 종아리·허벅지 추가 근육
    ("Tibialis anterior muscle.r", "muscle_sup", "정강이 앞 근육", "전경골근"),
    ("Extensor digitorum longus.r", "muscle_sup", "발가락 펴는 근육", "장지신근"),
    ("Fibularis longus muscle.r", "muscle_sup", "종아리 바깥 근육", "장비골근"),
    ("Soleus muscle.r", "muscle_deep", "종아리 속 근육(가자미근)", "가자미근"),
    ("Tibialis posterior muscle.r", "muscle_deep", "종아리 가장 깊은 근육", "후경골근"),
    ("Flexor digitorum longus.r", "muscle_deep", "발가락 굽히는 근육", "장지굴근"),
    ("Flexor hallucis longus.r", "muscle_deep", "엄지발가락 굽히는 근육", "장무지굴근"),
    ("Extensor hallucis longus.r", "muscle_deep", "엄지발가락 펴는 근육", "장무지신근"),
    ("Fibularis brevis muscle.r", "muscle_deep", "종아리 바깥 깊은 근육", "단비골근"),
    ("Adductor magnus.r", "muscle_deep", "허벅지 안쪽 깊은 근육", "대내전근"),

]

# 원본 모델 보정: 대퇴직근 힘줄이 무릎뼈 뒤(관절 안)로 지나가게 되어 있어서, 무릎뼈 높이 구간을 지움
# → 대퇴사두근건은 무릎뼈 위쪽 끝(base)에서 끝나고, 슬개인대는 아래쪽 끝(apex)에서 다시 시작
FIXUPS = [
    ("cut_between", "Rectus femoris muscle.r", "Patella.r"),
]
