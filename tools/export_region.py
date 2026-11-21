"""Z-Anatomy Startup.blend에서 한 부위의 구조물만 뽑아 <부위>_raw.glb + <부위>.json으로 내보낸다.
사용: python3 tools/export_region.py <부위: knee|shoulder> <Startup.blend> <출력폴더>
부위별 구조물 목록은 tools/regions/<부위>.py
"""
import bpy, json, sys, os, importlib.util

region, src, out = sys.argv[1], sys.argv[2], sys.argv[3]
spec = importlib.util.spec_from_file_location("parts", os.path.join(os.path.dirname(__file__), "regions", f"{region}.py"))
mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
PARTS = mod.PARTS
os.makedirs(out, exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=src)

dg = bpy.context.evaluated_depsgraph_get()
scene = bpy.context.scene
baked, meta, missing = [], [], []
for name, layer, easy, ko in PARTS:
    o = bpy.data.objects.get(name)
    if o is None or o.type != "MESH":
        missing.append(name); continue
    me = bpy.data.meshes.new_from_object(o.evaluated_get(dg), depsgraph=dg)  # 모디파이어 적용
    me.transform(o.matrix_world)  # 월드 좌표로 굽기
    # 화면에서 쓰는 id: 오른쪽(.r)은 그냥, 왼쪽(.l)은 끝에 _L (three.js가 이름의 '.'을 지우므로)
    base = name[:-2] + " L" if name.endswith(".l") else name[:-2] if name.endswith(".r") else name
    nid = base.replace(" ", "_")
    me.name = nid
    no = bpy.data.objects.new(nid, me)
    baked.append(no)
    meta.append({"id": nid, "en": base, "layer": layer, "easy": easy, "ko": ko,
                 "materials": [m.name for m in me.materials if m]})

keep = set(baked)
for ob in list(bpy.data.objects):
    if ob not in keep:
        bpy.data.objects.remove(ob, do_unlink=True)
for no, m in zip(baked, meta):
    no.name = m["id"]  # 원본과 이름이 겹쳐 붙은 '.001' 같은 꼬리 제거 (원본은 위에서 삭제됨)
    no.data.name = m["id"]
    scene.collection.objects.link(no)

bpy.ops.export_scene.gltf(filepath=os.path.join(out, f"{region}_raw.glb"), export_format="GLB",
                          export_apply=True, export_yup=True, export_materials="EXPORT")
with open(os.path.join(out, f"{region}.json"), "w", encoding="utf-8") as f:
    json.dump(meta, f, ensure_ascii=False, indent=1)
print("EXPORTED", len(baked), "MISSING", missing)
print("VERTS", sum(len(o.data.vertices) for o in baked))
