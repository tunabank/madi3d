from PIL import Image, ImageDraw, ImageFont, ImageFilter
import sys
W, H = 1200, 630
S = 2  # 2배로 그린 뒤 줄여서 선명하게
F = '/usr/share/fonts/opentype/noto/NotoSansCJK-{}.ttc'
def font(w, size): return ImageFont.truetype(F.format(w), size * S, index=1)  # index 1 = KR

bg = Image.new('RGB', (W * S, H * S))
d = ImageDraw.Draw(bg)
for y in range(H * S):  # 위→아래 짙은 남색 그라데이션
    t = y / (H * S)
    d.line([(0, y), (W * S, y)], fill=(int(34 - 16 * t), int(42 - 20 * t), int(56 - 26 * t)))
# 오른쪽 은은한 빛
glow = Image.new('L', (W * S, H * S), 0)
ImageDraw.Draw(glow).ellipse([700 * S, 40 * S, 1280 * S, 620 * S], fill=70)
glow = glow.filter(ImageFilter.GaussianBlur(120 * S))
bg = Image.composite(Image.new('RGB', bg.size, (70, 90, 120)), bg, glow)

def place(name, h, cx, by):
    im = Image.open(f'/home/claude/og/{name}.png'); im = im.crop(im.getbbox())
    # 위·아래 가장자리를 부드럽게 사라지게 (잘린 단면 감추기)
    a = im.split()[3]; m = Image.new('L', im.size, 255); md = ImageDraw.Draw(m); fh = int(im.height * 0.14)
    for i in range(fh):
        v = int(255 * i / fh); md.line([(0, i), (im.width, i)], fill=v); md.line([(0, im.height - 1 - i), (im.width, im.height - 1 - i)], fill=v)
    im.putalpha(Image.composite(a, Image.new('L', im.size, 0), m))
    w = int(im.width * h / im.height)
    im = im.resize((w * S, h * S), Image.LANCZOS)
    sh = Image.new('RGBA', im.size, (0, 0, 0, 0)); sh.putalpha(im.split()[3].point(lambda a: a * 0.45))
    sh = sh.filter(ImageFilter.GaussianBlur(14 * S))
    x, y = int((cx - w / 2) * S), int((by - h) * S)
    bg.paste(sh, (x + 6 * S, y + 10 * S), sh)
    bg.paste(im, (x, y), im)

# 3D 그림 (뒤에서 앞 순서)
place('knee', 560, 590, 650)
place('shoulder', 380, 775, 575)
place('neck', 470, 1015, 575)

d = ImageDraw.Draw(bg)
# 왼쪽 글씨 영역을 위한 반투명 판
panel = Image.new('RGBA', bg.size, (0, 0, 0, 0))
ImageDraw.Draw(panel).rectangle([0, 0, 520 * S, H * S], fill=(14, 18, 24, 150))
panel = panel.filter(ImageFilter.GaussianBlur(40 * S))
bg.paste(panel, (0, 0), panel)
d = ImageDraw.Draw(bg)

x = 64
d.text((x * S, 118 * S), 'Madi 3D', font=font('Black', 76), fill=(242, 244, 247))
d.text((x * S, 222 * S), '관절을 3D로 보며 설명해 드려요', font=font('Bold', 30), fill=(242, 244, 247))
d.text((x * S, 276 * S), '무릎 · 어깨 · 목 · 허리', font=font('Medium', 26), fill=(205, 212, 222))
d.text((x * S, 318 * S), 'Knee · Shoulder · Neck · Lumbar spine', font=font('Regular', 20), fill=(147, 197, 253))
# 칩
cy = 392
for label in ['겉근육→속근육→인대→뼈', '일자목 · 거북목 · 일자허리']:
    f = font('Medium', 18)
    tw = d.textlength(label, font=f) / S
    d.rounded_rectangle([x * S, cy * S, (x + tw + 32) * S, (cy + 40) * S], radius=20 * S, fill=(30, 38, 50), outline=(110, 125, 145), width=2 * S)
    d.text(((x + 16) * S, (cy + 8) * S), label, font=f, fill=(225, 230, 238))
    cy += 54
d.text((x * S, 548 * S), '서울마디튼튼의원', font=font('Bold', 22), fill=(242, 244, 247))
d.text((x * S, 580 * S), '3D 모델: Z-Anatomy · BodyParts3D (CC BY-SA)', font=font('Regular', 13), fill=(140, 150, 165))

out = bg.resize((W, H), Image.LANCZOS)
out.save(sys.argv[1], optimize=True)
