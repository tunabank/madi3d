# Madi 3D

진료실에서 환자에게 관절 구조와 질환을 보여주는 three.js 웹앱 (서울마디튼튼의원).
현재 부위: **무릎, 어깨** (주소 끝에 `#knee`, `#shoulder`를 붙이면 해당 부위로 바로 열림)

## 실행

```bash
npm install
npm run dev      # 개발 서버 (http://localhost:5173)
npm run build    # dist/ 생성 → Vercel에 그대로 배포
```

## 진료실 태블릿에 설치 (PWA)

배포 주소를 태블릿 브라우저로 연 뒤
- 아이패드(Safari): 공유 버튼 → **홈 화면에 추가**
- 갤럭시탭(Chrome/삼성 인터넷): 메뉴 → **홈 화면에 추가** 또는 **앱 설치**

한 번 열면 화면과 모델이 기기에 저장돼서, 와이파이가 끊겨도 열립니다.
새 버전을 올리면 다음에 열 때 자동으로 반영됩니다(모델은 한 번 더 열 때 반영될 수 있음).

## 구성

| 경로 | 내용 |
| --- | --- |
| `src/main.js` | 뷰어 (부위 전환, 층 벗기기, 시점, 터치 이름 보기, 강조) |
| `src/regions/knee.js`, `shoulder.js` | **부위 설정 + 질환 프리셋** — 문구·강조 부위·시점을 여기서 고침 |
| `src/regions/index.js` | 부위 목록 (탭 순서) |
| `public/models/<부위>.glb` | 부위 모델 (Z-Anatomy에서 추출, meshopt 압축, 각 1MB 안팎) |
| `public/models/<부위>.json` | 구조물 목록 (쉬운 이름 / 의학 용어 / 층) |
| `public/sw.js`, `manifest.webmanifest`, `icons/` | 앱 설치(PWA)·오프라인 저장 |
| `tools/regions/<부위>.py` | 부위별로 뽑을 구조물 목록 |
| `tools/export_region.py` | 모델 추출 스크립트 |

## 모델 다시 뽑기 / 새 부위 추가

```bash
# 1. Z-Anatomy 원본 받기 (약 87MB)
git clone --depth 1 https://github.com/Z-Anatomy/Models-of-human-anatomy
unzip Models-of-human-anatomy/Z-Anatomy.zip -d za
# 2. 부위 추출 (Blender 파이썬 모듈 bpy 필요: pip install bpy)
python3 tools/export_region.py shoulder za/Z-Anatomy/Startup.blend build
# 3. 압축 후 복사
npx @gltf-transform/cli meshopt build/shoulder_raw.glb public/models/shoulder.glb
cp build/shoulder.json public/models/
```

새 부위는 `tools/regions/<부위>.py`(구조물 목록)와 `src/regions/<부위>.js`(시점·프리셋)를 만들고
`src/regions/index.js`에 등록하면 됩니다.

## 라이선스와 출처

- **3D 모델 (`public/models/`)**: CC BY-SA 4.0
  - 원본: "Z-Anatomy - The libre 3D atlas of anatomy - CC-BY-SA 4.0"
    (https://github.com/Z-Anatomy/Models-of-human-anatomy)
  - 그 원본: "BodyParts3D, © The Database Center for Life Science, CC BY-SA 2.1 Japan"
    (https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html)
  - 수정 내용: 부위별(오른쪽 무릎·어깨) 구조물만 추출, 모디파이어 적용, 압축, 한국어 이름 추가
- 이 모델을 재배포하거나 고쳐서 배포할 때는 위 출처 표기를 유지하고 같은 CC BY-SA 4.0으로 공개해야 합니다.
- 앱 화면의 "출처" 버튼에도 같은 내용이 들어 있습니다.
- 질환 설명 문구(`src/regions/*.js`)는 프로토타입용 초안이며 원장 검수가 필요합니다.
