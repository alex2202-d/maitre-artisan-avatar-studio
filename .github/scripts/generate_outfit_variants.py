#!/usr/bin/env python3
import copy
import io
import json
import shutil
import struct
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SKIN_DIR = ROOT / "public/assets/avatar/v2/skins"
OUT_ROOT = ROOT / "public/assets/avatar/v2/outfits"
OUT_ROOT.mkdir(parents=True, exist_ok=True)

SKINS = [
    "skin-light",
    "skin-light-medium",
    "skin-medium",
    "skin-tan",
    "skin-dark",
]

OUTFITS = {
    "outfit-chantier": {
        "label": "Chantier",
        "cloth": None,
    },
    "outfit-electricien": {
        "label": "Électricien",
        "cloth": (42, 44, 50),
    },
    "outfit-plombier": {
        "label": "Plombier",
        "cloth": (38, 78, 132),
    },
    "outfit-peintre": {
        "label": "Peintre",
        "cloth": (224, 222, 216),
    },
}

def clamp(value, minimum, maximum):
    return max(minimum, min(maximum, value))

def read_glb(path: Path):
    data = path.read_bytes()
    magic, version, length = struct.unpack_from("<4sII", data, 0)
    assert magic == b"glTF" and version == 2 and length == len(data), path

    offset = 12
    gltf = None
    bin_chunk = None
    while offset < len(data):
        chunk_length, chunk_type = struct.unpack_from("<II", data, offset)
        start = offset + 8
        end = start + chunk_length
        chunk = data[start:end]
        if chunk_type == 0x4E4F534A:
            gltf = json.loads(chunk.rstrip(b"\x00 \t\r\n").decode("utf-8"))
        elif chunk_type == 0x004E4942:
            bin_chunk = chunk
        offset = end

    assert gltf is not None and bin_chunk is not None
    return gltf, bin_chunk

def embedded_base_color(gltf, bin_chunk):
    material = gltf["materials"][0]
    texture_index = material["pbrMetallicRoughness"]["baseColorTexture"]["index"]
    image_index = gltf["textures"][texture_index]["source"]
    image_desc = gltf["images"][image_index]
    view = gltf["bufferViews"][image_desc["bufferView"]]
    start = view.get("byteOffset", 0)
    end = start + view["byteLength"]
    return Image.open(io.BytesIO(bin_chunk[start:end])).convert("RGBA"), image_index

def encode_png(image):
    output = io.BytesIO()
    image.save(output, format="PNG", optimize=True)
    return output.getvalue()

def write_glb_with_basecolor(gltf, bin_chunk, image_index, png_bytes, dest):
    model = copy.deepcopy(gltf)

    bin_data = bytearray(bin_chunk)
    while len(bin_data) % 4:
        bin_data.append(0)

    image_offset = len(bin_data)
    bin_data.extend(png_bytes)
    raw_bin_length = len(bin_data)
    while len(bin_data) % 4:
        bin_data.append(0)

    model.setdefault("bufferViews", []).append({
        "buffer": 0,
        "byteOffset": image_offset,
        "byteLength": len(png_bytes),
    })
    view_index = len(model["bufferViews"]) - 1

    model["images"][image_index]["bufferView"] = view_index
    model["images"][image_index]["mimeType"] = "image/png"
    model["images"][image_index].pop("uri", None)
    model["buffers"][0]["byteLength"] = raw_bin_length

    json_bytes = json.dumps(model, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    while len(json_bytes) % 4:
        json_bytes += b" "

    total_length = 12 + 8 + len(json_bytes) + 8 + len(bin_data)

    with dest.open("wb") as handle:
        handle.write(struct.pack("<4sII", b"glTF", 2, total_length))
        handle.write(struct.pack("<II", len(json_bytes), 0x4E4F534A))
        handle.write(json_bytes)
        handle.write(struct.pack("<II", len(bin_data), 0x004E4942))
        handle.write(bin_data)

def looks_like_navy_fabric(r, g, b, a):
    if a < 16:
        return False
    rn, gn, bn = r / 255, g / 255, b / 255
    luma = 0.299 * rn + 0.587 * gn + 0.114 * bn

    # Base outfit fabric is a dark cool/navy textile. Require a blue bias
    # so black pupils/mouth and neutral hardware are not recolored.
    return (
        luma < 0.42
        and bn > rn + 0.025
        and bn >= gn * 0.98
        and rn < 0.34
        and gn < 0.38
        and bn < 0.50
    )

def recolor_cloth(source, target):
    if target is None:
        return source.copy(), 0

    image = source.copy()
    pixels = image.load()
    changed = 0

    for y in range(image.height):
        for x in range(image.width):
            r, g, b, a = pixels[x, y]
            if not looks_like_navy_fabric(r, g, b, a):
                continue

            luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255
            # Preserve folds and textile relief without carrying the original hue.
            shade = clamp(0.76 + luma * 1.05, 0.72, 1.12)
            nr = int(clamp(target[0] * shade, 0, 255))
            ng = int(clamp(target[1] * shade, 0, 255))
            nb = int(clamp(target[2] * shade, 0, 255))
            pixels[x, y] = (nr, ng, nb, a)
            changed += 1

    return image, changed

def main():
    report = []

    for outfit_id, outfit in OUTFITS.items():
        outfit_dir = OUT_ROOT / outfit_id
        outfit_dir.mkdir(parents=True, exist_ok=True)

        for skin_id in SKINS:
            source_glb = SKIN_DIR / f"avatar_workwear_v2_{skin_id}.glb"
            if not source_glb.exists():
                raise FileNotFoundError(source_glb)

            dest_glb = outfit_dir / f"avatar_{outfit_id}_{skin_id}.glb"

            if outfit["cloth"] is None:
                shutil.copy2(source_glb, dest_glb)
                report.append(f"{outfit_id}/{skin_id}: copied canonical GLB")
                continue

            gltf, bin_chunk = read_glb(source_glb)
            source_texture, image_index = embedded_base_color(gltf, bin_chunk)
            variant, changed = recolor_cloth(source_texture, outfit["cloth"])

            preview_path = outfit_dir / f"{skin_id}-texture.png"
            variant.save(preview_path, optimize=True)
            write_glb_with_basecolor(
                gltf,
                bin_chunk,
                image_index,
                encode_png(variant),
                dest_glb,
            )
            report.append(f"{outfit_id}/{skin_id}: {changed} cloth pixels")

    (OUT_ROOT / "README.txt").write_text(
        "Maître Artisan V2 - real rigged outfit GLB variants.\n"
        "Each outfit is available for all five approved skin tones.\n\n"
        + "\n".join(report)
        + "\n",
        encoding="utf-8",
    )
    print("\n".join(report))

if __name__ == "__main__":
    main()
