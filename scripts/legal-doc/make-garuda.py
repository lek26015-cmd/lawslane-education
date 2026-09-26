# สร้าง src/assets/emblems/garuda.pdf จากภาพสแกน
# python3 scripts/legal-doc/make-garuda.py src/assets/emblems/garuda-source.jpg src/assets/emblems/garuda.pdf
#
# ภาพ 1-bit เป็น stencil mask (/ImageMask) ระบายดำ พื้นจึงโปร่งใส วางทับเส้นหรือกรอบได้
import sys, zlib
from PIL import Image, ImageOps
src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('L')
bbox = ImageOps.invert(im).point(lambda v: 255 if v > 64 else 0).getbbox()
pad = 8
im = im.crop((max(bbox[0]-pad,0), max(bbox[1]-pad,0), min(bbox[2]+pad,im.width), min(bbox[3]+pad,im.height)))
bw = im.point(lambda v: 0 if v < 140 else 255, '1')  # 0 = หมึก
w, h = bw.size
# ImageMask: bit 0 = ระบาย (Decode [0 1] ค่าเริ่มต้น)
data = zlib.compress(bw.tobytes(), 9)
content = f"q {w} 0 0 {h} 0 0 cm 0 g /Im1 Do Q".encode()
objs = [
    b"<< /Type /Catalog /Pages 2 0 R >>",
    f"<< /Type /Pages /Kids [3 0 R] /Count 1 >>".encode(),
    f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {w} {h}] /Resources << /XObject << /Im1 5 0 R >> >> /Contents 4 0 R >>".encode(),
    b"<< /Length %d >>\nstream\n" % len(content) + content + b"\nendstream",
    f"<< /Type /XObject /Subtype /Image /Width {w} /Height {h} /ImageMask true /BitsPerComponent 1 /Filter /FlateDecode /Length {len(data)} >>\nstream\n".encode() + data + b"\nendstream",
    b"<< /Title (Garuda emblem) /Producer (scripts/legal-doc/make-garuda.py) >>",
]
buf = bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n"); offs = []
for i, o in enumerate(objs, 1):
    offs.append(len(buf)); buf += f"{i} 0 obj\n".encode() + o + b"\nendobj\n"
x = len(buf)
buf += f"xref\n0 {len(objs)+1}\n0000000000 65535 f \n".encode() + b"".join(f"{o:010d} 00000 n \n".encode() for o in offs)
buf += f"trailer\n<< /Size {len(objs)+1} /Root 1 0 R /Info 6 0 R >>\nstartxref\n{x}\n%%EOF\n".encode()
open(out, 'wb').write(buf); print(w, h, len(buf))
