#!/usr/bin/env python3
import json
import struct
from pathlib import Path

from PIL import Image
import io
import colorsys

ROOT = Path(__file__).resolve().parents[2]
GLB = ROOT / "public/assets/avatar/v2/base/avatar_workwear_v2_rigged.glb"
OUT = ROOT / "public/assets/avatar/v2/skins"
OUT.mkdir(parents=True, exist_ok=True)

TONES = {
    # Deliberately spaced apart so every choice is immediately visible.
    "skin-light": (247, 216, 198),        # #F7D8C6
    "skin-light-medium": (222, 170, 132), # #DEAA84
    "skin-medium": (184, 112, 78),        # #B8704E
    "skin-tan": (124, 76, 53),            # #7C4C35
    "skin-dark": (63, 39, 30),            # #3F271E
}

def read_glb(path: Path):
    data = path.read_bytes()
    magic, version, length = struct.unpack_from("<4sII", data, 0)
    assert magic == b"glTF" and version == 2 and length == len(data)

    off = 12
    gltf = None
    bin_chunk = None
    while off < len(data):
        chunk_len, chunk_type = struct.unpack_from("<II", data, off)
        start = off + 8
        end = start + chunk_len
        chunk = data[start:end]
        if chunk_type == 0x4E4F534A:
            gltf = json.loads(chunk.rstrip(b"\x00 \t\r\n").decode("utf-8"))
        elif chunk_type == 0x004E4942:
            bin_chunk = chunk
        off = end

    assert gltf is not None and bin_chunk is not None
    return gltf, bin_chunk

def embedded_image(gltf, bin_chunk):
    mat = gltf["materials"][0]
    tex_index = mat["pbrMetallicRoughness"]["baseColorTexture"]["index"]
    image_index = gltf["textures"][tex_index]["source"]
    image_desc = gltf["images"][image_index]
    bv = gltf["bufferViews"][image_desc["bufferView"]]
    start = bv.get("byteOffset", 0)
    end = start + bv["byteLength"]
    return Image.open(io.BytesIO(bin_chunk[start:end])).convert("RGBA")

def is_skin_pixel(r, g, b, a):
    if a < 16:
        return False

    # Deliberately detect the ORIGINAL light/peach skin of the master texture.
    # High-saturation yellow/orange workwear and darker brown boots are excluded.
    mx = max(r, g, b)
    mn = min(r, g, b)
    sat = 0 if mx == 0 else (mx - mn) / mx
    h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
    hue = h * 360

    cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b
    cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b

    return (
        r >= 145
        and g >= 105
        and b >= 78
        and r > g * 1.025
        and g > b * 1.02
        and 5 <= hue <= 38
        and 0.08 <= sat <= 0.46
        and 82 <= cb <= 130
        and 133 <= cr <= 178
    )

def encode_png(image):
    out = io.BytesIO()
    image.save(out, format="PNG", optimize=True)
    return out.getvalue()

def write_glb_with_basecolor(gltf, bin_chunk, png_bytes, dest):
    # Keep geometry, rig and all original data untouched. Append a new embedded
    # baseColor image to the BIN chunk and point the material texture at it.
    import copy
    model = copy.deepcopy(gltf)

    bin_data = bytearray(bin_chunk)
    while len(bin_data) % 4:
        bin_data.append(0)

    image_offset = len(bin_data)
    bin_data.extend(png_bytes)
    raw_bin_length = len(bin_data)
    while len(bin_data) % 4:
        bin_data.append(0)

    new_view = {
        "buffer": 0,
        "byteOffset": image_offset,
        "byteLength": len(png_bytes),
    }
    model.setdefault("bufferViews", []).append(new_view)
    new_view_index = len(model["bufferViews"]) - 1

    mat = model["materials"][0]
    tex_index = mat["pbrMetallicRoughness"]["baseColorTexture"]["index"]
    image_index = model["textures"][tex_index]["source"]
    model["images"][image_index]["bufferView"] = new_view_index
    model["images"][image_index]["mimeType"] = "image/png"
    model["images"][image_index].pop("uri", None)

    model["buffers"][0]["byteLength"] = raw_bin_length

    json_bytes = json.dumps(model, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    while len(json_bytes) % 4:
        json_bytes += b" "

    total_length = 12 + 8 + len(json_bytes) + 8 + len(bin_data)

    with open(dest, "wb") as f:
        f.write(struct.pack("<4sII", b"glTF", 2, total_length))
        f.write(struct.pack("<II", len(json_bytes), 0x4E4F534A))
        f.write(json_bytes)
        f.write(struct.pack("<II", len(bin_data), 0x004E4942))
        f.write(bin_data)

def make_variant(source, target):
    img = source.copy()
    px = img.load()
    mask = Image.new("L", img.size, 0)
    mp = mask.load()

    tr, tg, tb = [x / 255 for x in target]
    target_luma = 0.299 * tr + 0.587 * tg + 0.114 * tb
    changed = 0

    for y in range(img.height):
        for x in range(img.width):
            r, g, b, a = px[x, y]
            if not is_skin_pixel(r, g, b, a):
                continue

            src_luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255

            # The selected tone must dominate. We only keep a restrained amount
            # of the original lighting so "Clair" and "Foncé" stay clearly distinct.
            detail = max(-0.16, min(0.14, (src_luma - 0.72) * 0.55))
            shade = 1.0 + detail

            # Dark tones must not be washed out by bright highlights.
            if target_luma < 0.30:
                shade = max(0.88, min(1.08, shade))
            elif target_luma < 0.45:
                shade = max(0.86, min(1.11, shade))

            nr = int(max(0, min(255, target[0] * shade)))
            ng = int(max(0, min(255, target[1] * shade)))
            nb = int(max(0, min(255, target[2] * shade)))
            px[x, y] = (nr, ng, nb, a)
            mp[x, y] = 255
            changed += 1

    return img, mask, changed

def main():
    gltf, bin_chunk = read_glb(GLB)
    source = embedded_image(gltf, bin_chunk)
    source.save(OUT / "skin-source.png")

    master_mask = None
    report = []
    for name, target in TONES.items():
        variant, mask, changed = make_variant(source, target)
        png_path = OUT / f"{name}.png"
        variant.save(png_path, optimize=True)

        glb_path = OUT / f"avatar_workwear_v2_{name}.glb"
        write_glb_with_basecolor(gltf, bin_chunk, encode_png(variant), glb_path)

        if master_mask is None:
            master_mask = mask
        report.append(f"{name}: {changed} pixels -> avatar_workwear_v2_{name}.glb")

    master_mask.save(OUT / "skin-mask.png", optimize=True)
    (OUT / "README.txt").write_text(
        "Generated from avatar_workwear_v2_rigged.glb embedded baseColor texture.\n"
        + "\n".join(report)
        + "\n",
        encoding="utf-8",
    )
    print("\n".join(report))
    print(f"Texture size: {source.width}x{source.height}")

if __name__ == "__main__":
    main()
