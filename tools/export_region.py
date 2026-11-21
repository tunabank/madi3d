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
baked_meshes = {}
for name, layer, easy, ko in PARTS:
    o = bpy.data.objects.get(name)
    if o is None or o.type != "MESH":
        missing.append(name); continue
    me = bpy.data.meshes.new_from_object(o.evaluated_get(dg), depsgraph=dg)  # 모디파이어 적용
    me.transform(o.matrix_world)  # 월드 좌표로 굽기
    baked_meshes[name] = me
    # 화면에서 쓰는 id: 오른쪽(.r)은 그냥, 왼쪽(.l)은 끝에 _L (three.js가 이름의 '.'을 지우므로)
    base = name[:-2] + " L" if name.endswith(".l") else name[:-2] if name.endswith(".r") else name
    nid = base.replace(" ", "_")
    me.name = nid
    no = bpy.data.objects.new(nid, me)
    baked.append(no)
    meta.append({"id": nid, "en": base, "layer": layer, "easy": easy, "ko": ko,
                 "materials": [m.name for m in me.materials if m]})

# 원본 모델 보정 (부위 목록 파일의 FIXUPS)
def wrap_over(tendon, bone, margin=0.0015, fade=0.03, slice_h=0.002):
    """tendon 메쉬가 bone 뒤로 지나가는 구간을 bone 앞면(-Y)으로 밀어낸다. (Blender 좌표: Z 위, -Y 앞)"""
    T, B = baked_meshes[tendon], baked_meshes[bone]
    bx = [v.co.x for v in B.vertices]; bz = [v.co.z for v in B.vertices]
    xmin, xmax, zmin, zmax = min(bx) - 0.005, max(bx) + 0.005, min(bz), max(bz)
    n = int((zmax - zmin) / slice_h) + 1
    front = [None] * n  # 높이 구간별 뼈 앞면(가장 작은 y)
    for v in B.vertices:
        i = int((v.co.z - zmin) / slice_h)
        front[i] = v.co.y if front[i] is None else min(front[i], v.co.y)
    back = [None] * n  # 높이 구간별 힘줄 뒷면(뼈 폭 안쪽 정점 중 가장 큰 y)
    for v in T.vertices:
        if zmin <= v.co.z <= zmax and xmin <= v.co.x <= xmax:
            i = int((v.co.z - zmin) / slice_h)
            back[i] = v.co.y if back[i] is None else max(back[i], v.co.y)
    shift = [0.0] * n
    for i in range(n):
        if front[i] is not None and back[i] is not None and back[i] > front[i] - margin:
            shift[i] = (front[i] - margin) - back[i]  # 음수 = 앞으로
    # 빈 구간 메우고 부드럽게
    for _ in range(3):
        shift = [min(shift[max(0, i - 1):i + 2]) if shift[i] == 0 else shift[i] for i in range(n)]
    shift = [sum(shift[max(0, i - 3):i + 4]) / len(shift[max(0, i - 3):i + 4]) for i in range(n)]
    top, bot = shift[-1], shift[0]
    moved = 0
    for v in T.vertices:
        z = v.co.z
        if z < zmin - fade or z > zmax + fade: continue
        if z < zmin: d = bot * (1 - (zmin - z) / fade)
        elif z > zmax: d = top * (1 - (z - zmax) / fade)
        else: d = shift[min(n - 1, int((z - zmin) / slice_h))]
        if d < 0: v.co.y += d; moved += 1
    T.update()
    print("FIXUP wrap_over", tendon, "over", bone, "moved", moved, "max shift mm", round(-min(shift) * 1000, 1))

def cut_between(tendon, bone, inset=0.006):
    """tendon 메쉬에서 bone의 위·아래 끝 사이 높이 구간을 지운다 (끝은 bone 안으로 inset만큼 들어가 묻히게).
    잘린 단면은 막아서 속이 빈 관이 보이지 않게 한다. 예: 대퇴사두근건은 무릎뼈 위쪽 끝에서 끝나고
    슬개인대는 무릎뼈 아래쪽 끝에서 다시 시작."""
    import bmesh
    T, B = baked_meshes[tendon], baked_meshes[bone]
    bz = [v.co.z for v in B.vertices]
    lo, hi = min(bz) + inset, max(bz) - inset
    bm = bmesh.new(); bm.from_mesh(T)
    kill = [f for f in bm.faces if lo < f.calc_center_median().z < hi]
    bmesh.ops.delete(bm, geom=kill, context="FACES")
    loose = [v for v in bm.verts if not v.link_faces]
    bmesh.ops.delete(bm, geom=loose, context="VERTS")
    holes = [e for e in bm.edges if e.is_boundary and lo - 0.01 < e.verts[0].co.z < hi + 0.01]
    filled = bmesh.ops.holes_fill(bm, edges=holes, sides=0)
    bm.to_mesh(T); bm.free(); T.update()
    print("FIXUP cut_between", tendon, bone, "removed faces", len(kill), "caps", len(filled["faces"]))

for fx in getattr(mod, "FIXUPS", []):
    {"wrap_over": wrap_over, "cut_between": cut_between}[fx[0]](*fx[1:])

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
