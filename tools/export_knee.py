"""Z-Anatomy Startup.blend에서 무릎 구조물만 뽑아 knee.glb + parts.json으로 내보낸다.
사용: python3 scripts/export_knee.py <Startup.blend> <출력폴더>
"""
import bpy, json, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from knee_parts import PARTS

src, out = sys.argv[1], sys.argv[2]
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
    nid = name.replace(".r", "").replace(" ", "_")
    me.name = nid
    no = bpy.data.objects.new(nid, me)
    baked.append(no)
    meta.append({"id": nid, "en": name[:-2], "layer": layer, "easy": easy, "ko": ko,
                 "materials": [m.name for m in me.materials if m]})

keep = set(baked)
for ob in list(bpy.data.objects):
    if ob not in keep:
        bpy.data.objects.remove(ob, do_unlink=True)
for no in baked:
    scene.collection.objects.link(no)

bpy.ops.export_scene.gltf(filepath=os.path.join(out, "knee_raw.glb"), export_format="GLB",
                          export_apply=True, export_yup=True, export_materials="EXPORT")
with open(os.path.join(out, "parts.json"), "w", encoding="utf-8") as f:
    json.dump(meta, f, ensure_ascii=False, indent=1)
print("EXPORTED", len(baked), "MISSING", missing)
print("VERTS", sum(len(o.data.vertices) for o in baked))
