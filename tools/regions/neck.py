# 목 뷰어에 들어갈 구조물 목록 (Z-Anatomy, 가운데 구조물 + 좌우 양쪽)
# layer: muscle_sup(겉근육) / muscle_deep(속근육) / ligament(디스크·인대·척수) / bone
# easy: 환자용 쉬운 이름, ko: 의학 용어
# 자세 애니메이션에서 뼈는 통째로 움직이고(어느 경추에 붙는지는 src/regions/neck.js), 나머지는 휘어진다.

def both(name, layer, easy, ko):
    return [(f"{name}.r", layer, easy, ko), (f"{name}.l", layer, easy, ko)]

PARTS = [
    # --- 척추 ---
    ("Atlas (C1)", "bone", "1번 목뼈", "환추(C1)"),
    ("Axis (C2)", "bone", "2번 목뼈", "축추(C2)"),
    ("Vertebra C3", "bone", "3번 목뼈", "경추 C3"),
    ("Vertebra C4", "bone", "4번 목뼈", "경추 C4"),
    ("Vertebra C5", "bone", "5번 목뼈", "경추 C5"),
    ("Vertebra C6", "bone", "6번 목뼈", "경추 C6"),
    ("Vertebra C7", "bone", "7번 목뼈", "경추 C7(융추)"),
    ("Vertebra T1", "bone", "1번 등뼈", "흉추 T1"),
    ("Vertebra T2", "bone", "2번 등뼈", "흉추 T2"),
    ("Vertebra T3", "bone", "3번 등뼈", "흉추 T3"),
    # --- 머리 ---
    ("Occipital bone", "bone", "뒤통수뼈", "후두골"),
    ("Frontal bone", "bone", "이마뼈", "전두골"),
    ("Sphenoid bone", "bone", "나비뼈", "접형골"),
    ("Ethmoid bone", "bone", "벌집뼈", "사골"),
    ("Vomer", "bone", "코 가운데 뼈", "서골"),
    ("Mandible", "bone", "아래턱뼈", "하악골"),
    ("Hyoid bone", "bone", "목뿔뼈", "설골"),
    *both("Parietal bone", "bone", "정수리뼈", "두정골"),
    *both("Temporal bone", "bone", "관자뼈", "측두골"),
    *both("Zygomatic bone", "bone", "광대뼈", "관골"),
    *both("Maxilla", "bone", "위턱뼈", "상악골"),
    *both("Nasal bone", "bone", "코뼈", "비골(코)"),
    *[p for t in ["Upper medial incisor", "Upper lateral incisor", "Upper canine", "Upper first premolar",
                  "Upper second premolar", "Upper first molar tooth", "Upper second molar tooth",
                  "Lower medial incisor", "Lower lateral incisor", "Lower canine", "Lower first premolar",
                  "Lower second premolar", "Lower first molar tooth", "Lower second molar tooth"]
      for p in both(t, "bone", "치아", "치아")],
    # --- 가슴 위쪽 (고정) ---
    ("Manubrium of sternum", "bone", "가슴뼈 윗부분", "흉골병"),
    *both("Clavicle", "bone", "빗장뼈", "쇄골"),
    *both("First rib", "bone", "첫째 갈비뼈", "제1늑골"),

    # --- 디스크·인대·척수 ---
    ("Intervertebral disc C2-C3", "ligament", "목 디스크 C2-3", "추간판 C2-C3"),
    ("Intervertebral disc C3-C4", "ligament", "목 디스크 C3-4", "추간판 C3-C4"),
    ("Intervertebral disc C4-C5", "ligament", "목 디스크 C4-5", "추간판 C4-C5"),
    ("Intervertebral disc C5-C6", "ligament", "목 디스크 C5-6", "추간판 C5-C6"),
    ("Intervertebral disc C6-C7", "ligament", "목 디스크 C6-7", "추간판 C6-C7"),
    ("Intervertebral disc C7-T1", "ligament", "목 디스크 C7-T1", "추간판 C7-T1"),
    ("Intervertebral disc T1-T2", "ligament", "등 디스크 T1-2", "추간판 T1-T2"),
    ("Intervertebral disc T2-T3", "ligament", "등 디스크 T2-3", "추간판 T2-T3"),
    ("Anterior longitudinal ligament", "ligament", "척추 앞 인대", "전종인대"),
    ("Posterior longitudinal ligament", "ligament", "척추 뒤 인대(디스크 뒤)", "후종인대"),
    ("Ligamenta flava", "ligament", "척추관 뒤 노란 인대", "황색인대"),
    ("Interspinous ligaments", "ligament", "가시돌기 사이 인대", "극간인대"),
    ("Supraspinous ligament", "ligament", "가시돌기 끝 인대", "극상인대"),
    ("Nuchal ligament", "ligament", "목덜미 인대", "항인대"),
    ("White matter of spinal cord", "ligament", "척수(신경)", "척수"),

    # --- 겉근육 ---
    *both("Sternocleidomastoid muscle", "muscle_sup", "목 앞 비스듬한 근육", "흉쇄유돌근"),
    *both("Descending part of trapezius muscle", "muscle_sup", "어깨 위 근육(승모근)", "승모근 상부"),
    *both("Splenius capitis muscle", "muscle_sup", "목 뒤 근육(머리 쪽)", "두판상근"),
    *both("Levator scapulae", "muscle_sup", "날개뼈 올리는 근육", "견갑거근"),

    # --- 속근육 ---
    *both("Splenius colli muscle", "muscle_deep", "목 뒤 근육(목 쪽)", "경판상근"),
    *both("Semispinalis colli muscle", "muscle_deep", "목 뒤 깊은 근육", "경반극근"),
    *both("Longissimus capitis muscle", "muscle_deep", "목 뒤 긴 근육", "두최장근"),
    *both("Multifidus colli muscle", "muscle_deep", "목뼈 사이 짧은 근육", "다열근(경부)"),
    *both("Rectus posterior major capitis muscle", "muscle_deep", "뒤통수 아래 근육", "대후두직근(후두하근)"),
    *both("Rectus posterior minor capitis muscle", "muscle_deep", "뒤통수 아래 작은 근육", "소후두직근(후두하근)"),
    *both("Obliquus superior capitis muscle", "muscle_deep", "뒤통수 아래 비스듬한 근육(위)", "상두사근(후두하근)"),
    *both("Obliquus inferior capitis muscle", "muscle_deep", "뒤통수 아래 비스듬한 근육(아래)", "하두사근(후두하근)"),
    *both("Longus colli muscle", "muscle_deep", "목뼈 앞 깊은 근육", "경장근(심부 굴곡근)"),
    *both("Longus capitis muscle", "muscle_deep", "목뼈 앞 깊은 근육(머리 쪽)", "두장근(심부 굴곡근)"),
    *both("Scalenus anterior muscle", "muscle_deep", "목 옆 근육(앞)", "전사각근"),
    *both("Scalenus medius muscle", "muscle_deep", "목 옆 근육(가운데)", "중사각근"),
    *both("Scalenus posterior muscle", "muscle_deep", "목 옆 근육(뒤)", "후사각근"),
]
