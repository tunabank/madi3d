# 발목 뷰어에 들어갈 구조물 목록 (Z-Anatomy 오른쪽 다리·발, ".r")
# layer: muscle_sup(겉근육) / muscle_deep(속근육) / ligament(인대·힘줄·근막) / bone
# easy: 환자용 쉬운 이름, ko: 의학 용어

TOES = ["first", "second", "third", "fourth", "fifth"]
TOE_KO = ["엄지", "둘째", "셋째", "넷째", "새끼"]

PARTS = [
    # --- 뼈 ---
    ("Tibia.r", "bone", "정강이뼈", "경골"),
    ("Fibula.r", "bone", "종아리뼈", "비골"),
    ("Talus.r", "bone", "목말뼈(발목뼈)", "거골"),
    ("Calcaneus.r", "bone", "발뒤꿈치뼈", "종골"),
    ("Navicular bone.r", "bone", "발배뼈", "주상골"),
    ("Cuboid bone.r", "bone", "입방뼈", "입방골"),
    ("Medial cuneiform bone.r", "bone", "쐐기뼈(안쪽)", "내측 설상골"),
    ("Intermediate cuneiform bone.r", "bone", "쐐기뼈(가운데)", "중간 설상골"),
    ("Lateral cuneiform bone.r", "bone", "쐐기뼈(바깥)", "외측 설상골"),
    ("First metatarsal bone.r", "bone", "발허리뼈(엄지)", "제1중족골"),
    ("Second metatarsal bone.r", "bone", "발허리뼈(둘째)", "제2중족골"),
    ("Third metatarsal bone.r", "bone", "발허리뼈(셋째)", "제3중족골"),
    ("Fourth metatarsal bone.r", "bone", "발허리뼈(넷째)", "제4중족골"),
    ("Fifth metatarsal bone.r", "bone", "발허리뼈(새끼)", "제5중족골"),
    ("Sesamoid bones of foot.r", "bone", "엄지발가락 밑 작은 뼈", "종자골"),
    *[(f"Proximal phalanx of {t} finger of foot.r", "bone", f"발가락뼈({k})", f"{k}발가락 기절골") for t, k in zip(TOES, TOE_KO)],
    *[(f"Middle phalanx of {t} finger of foot.r", "bone", f"발가락뼈({k})", f"{k}발가락 중절골") for t, k in zip(TOES[1:], TOE_KO[1:])],
    *[(f"Distal phalanx of {t} finger of foot.r", "bone", f"발가락뼈({k})", f"{k}발가락 원위지골") for t, k in zip(TOES, TOE_KO)],

    # --- 인대·힘줄·근막 ---
    ("Anterior talofibular ligament.r", "ligament", "발목 바깥 앞 인대", "전거비인대(ATFL)"),
    ("Calcaneofibular ligament.r", "ligament", "발목 바깥 아래 인대", "종비인대(CFL)"),
    ("Posterior talofibular ligament.r", "ligament", "발목 바깥 뒤 인대", "후거비인대(PTFL)"),
    ("Tibionavicular ligament.r", "ligament", "발목 안쪽 인대(앞)", "경주인대(삼각인대)"),
    ("Tibiocalcaneal ligament.r", "ligament", "발목 안쪽 인대(가운데)", "경종인대(삼각인대)"),
    ("Posterior tibiotalar ligament.r", "ligament", "발목 안쪽 인대(뒤)", "후경거인대(삼각인대)"),
    ("Anterior tibiofibular ligament.r", "ligament", "두 정강이뼈를 잇는 인대(앞)", "전하경비인대(인대결합)"),
    ("Posterior tibiofibular ligament.r", "ligament", "두 정강이뼈를 잇는 인대(뒤)", "후하경비인대(인대결합)"),
    ("Interosseous membrane of leg.r", "ligament", "정강이뼈 사이 막", "하퇴 골간막"),
    ("Anterior talocalcaneal ligament.r", "ligament", "목말-뒤꿈치 인대(앞)", "전거종인대"),
    ("Lateral talocalcaneal ligament.r", "ligament", "목말-뒤꿈치 인대(바깥)", "외측거종인대"),
    ("Plantar calcaneonavicular ligament.r", "ligament", "발바닥 아치 인대(스프링 인대)", "족저종주인대(스프링 인대)"),
    ("Calcaneonavicular ligament.r", "ligament", "뒤꿈치-발배뼈 인대", "종주인대(이분인대)"),
    ("Calcaneocuboid ligament.r", "ligament", "뒤꿈치-입방뼈 인대", "종입방인대(이분인대)"),
    ("Long plantar ligament.r", "ligament", "발바닥 긴 인대", "장족저인대"),
    ("Plantar aponeurosis.r", "ligament", "발바닥 근막", "족저근막"),
    ("Calcaneal tendon.r", "ligament", "아킬레스 힘줄", "아킬레스건(종골건)"),
    ("Superior extensor retinaculum of ankle.r", "ligament", "발등 힘줄 고정띠(위)", "상신근지대"),
    ("Inferior extensor retinaculum of ankle.r", "ligament", "발등 힘줄 고정띠(아래)", "하신근지대"),
    ("Flexor retinaculum of ankle.r", "ligament", "발목 안쪽 힘줄 고정띠", "굴근지대"),
    ("Superior fibular retinaculum.r", "ligament", "발목 바깥 힘줄 고정띠(위)", "상비골근지대"),
    ("Inferior fibular retinaculum.r", "ligament", "발목 바깥 힘줄 고정띠(아래)", "하비골근지대"),

    # --- 겉근육 ---
    ("Medial head of gastrocnemius.r", "muscle_sup", "종아리 근육(안쪽)", "비복근 내측두"),
    ("Lateral head of gastrocnemius.r", "muscle_sup", "종아리 근육(바깥)", "비복근 외측두"),
    ("Tibialis anterior muscle.r", "muscle_sup", "정강이 앞 근육", "전경골근"),
    ("Extensor digitorum longus.r", "muscle_sup", "발가락 펴는 긴 근육", "장지신근"),
    ("Extensor hallucis longus.r", "muscle_sup", "엄지발가락 펴는 긴 근육", "장무지신근"),
    ("Fibularis longus muscle.r", "muscle_sup", "종아리 바깥 근육(긴)", "장비골근"),
    ("Fibularis tertius muscle.r", "muscle_sup", "발등 바깥 작은 근육", "제3비골근"),
    ("Extensor digitorum brevis.r", "muscle_sup", "발등 발가락 펴는 근육", "단지신근"),
    ("Extensor hallucis brevis.r", "muscle_sup", "발등 엄지 펴는 근육", "단무지신근"),
    ("Abductor hallucis.r", "muscle_sup", "발 안쪽 근육(엄지)", "무지외전근"),
    ("Abductor digiti minimi of foot.r", "muscle_sup", "발 바깥 근육(새끼)", "소지외전근"),
    ("Flexor digitorum brevis.r", "muscle_sup", "발바닥 발가락 굽히는 근육", "단지굴근"),

    # --- 속근육 ---
    ("Soleus muscle.r", "muscle_deep", "종아리 속 근육(가자미근)", "가자미근"),
    ("Plantaris muscle.r", "muscle_deep", "종아리 가는 근육", "족저근"),
    ("Fibularis brevis muscle.r", "muscle_deep", "종아리 바깥 근육(짧은)", "단비골근"),
    ("Tibialis posterior muscle.r", "muscle_deep", "종아리 가장 깊은 근육", "후경골근"),
    ("Flexor digitorum longus.r", "muscle_deep", "발가락 굽히는 긴 근육", "장지굴근"),
    ("Flexor hallucis longus.r", "muscle_deep", "엄지발가락 굽히는 긴 근육", "장무지굴근"),
    ("Quadratus plantae muscle.r", "muscle_deep", "발바닥 깊은 근육", "족저방형근"),
    ("Lumbrical muscles of foot.r", "muscle_deep", "발바닥 작은 근육", "충양근"),
    ("Medial head of flexor hallucis brevis.r", "muscle_deep", "엄지 굽히는 짧은 근육(안쪽)", "단무지굴근"),
    ("Lateral head of flexor hallucis brevis.r", "muscle_deep", "엄지 굽히는 짧은 근육(바깥)", "단무지굴근"),
    ("Oblique head of adductor hallucis.r", "muscle_deep", "엄지 모으는 근육", "무지내전근"),
    ("Flexor digiti minimi of foot.r", "muscle_deep", "새끼발가락 굽히는 근육", "소지굴근"),
    ("Dorsal interossei muscles of foot.r", "muscle_deep", "발허리뼈 사이 근육(등쪽)", "배측골간근"),
    ("Plantar interossei muscles.r", "muscle_deep", "발허리뼈 사이 근육(바닥쪽)", "족저골간근"),
]
