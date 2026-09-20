#!/usr/bin/env python3
import io
import json
import math
import struct
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
SKIN_DIR = ROOT / "public/assets/avatar/v2/skins"
OUT = ROOT / "public/assets/avatar/v2/faces"
OUT.mkdir(parents=True, exist_ok=True)

SKINS = {
    "skin-light": (231, 199, 174),
    "skin-light-medium": (216, 165, 130),
    "skin-medium": (188, 127, 88),
    "skin-tan": (142, 93, 63),
    "skin-dark": (95, 53, 38),
}

FACES = ("face-classic", "face-smile", "face-determined", "face-surprised")

COMPONENT = {
    5120: ("b", 1),
    5121: ("B", 1),
    5122: ("h", 2),
    5123: ("H", 2),
    5125: ("I", 4),
    5126: ("f", 4),
}
TYPE_SIZE = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4, "MAT2": 4, "MAT3": 9, "MAT4": 16}


def read_glb(path: Path):
    data = path.read_bytes()
    magic, version, length = struct.unpack_from("<4sII", data, 0)
    assert magic == b"glTF" and version == 2 and length == len(data)

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
    return Image.open(io.BytesIO(bin_chunk[start:end])).convert("RGBA")


def read_accessor(gltf, bin_chunk, index):
    acc = gltf["accessors"][index]
    view = gltf["bufferViews"][acc["bufferView"]]
    fmt, component_bytes = COMPONENT[acc["componentType"]]
    width = TYPE_SIZE[acc["type"]]
    stride = view.get("byteStride", component_bytes * width)
    base = view.get("byteOffset", 0) + acc.get("byteOffset", 0)
    rows = []
    unpack = struct.Struct("<" + fmt * width)
    for i in range(acc["count"]):
        rows.append(unpack.unpack_from(bin_chunk, base + i * stride))
    return rows


def barycentric(px, py, a, b, c):
    denom = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1])
    if abs(denom) < 1e-8:
        return None
    w0 = ((b[1] - c[1]) * (px - c[0]) + (c[0] - b[0]) * (py - c[1])) / denom
    w1 = ((c[1] - a[1]) * (px - c[0]) + (a[0] - c[0]) * (py - c[1])) / denom
    w2 = 1.0 - w0 - w1
    if w0 < -0.001 or w1 < -0.001 or w2 < -0.001:
        return None
    return w0, w1, w2


def face_position(p):
    x, y, z = p
    return abs(x) <= 0.205 and 0.665 <= y <= 1.00 and z >= 0.145


def build_face_pixel_map(gltf, bin_chunk, width, height):
    primitive = gltf["meshes"][0]["primitives"][0]
    positions = read_accessor(gltf, bin_chunk, primitive["attributes"]["POSITION"])
    uvs = read_accessor(gltf, bin_chunk, primitive["attributes"]["TEXCOORD_0"])
    indices = [row[0] for row in read_accessor(gltf, bin_chunk, primitive["indices"])]

    mapped = {}
    for i in range(0, len(indices), 3):
        ia, ib, ic = indices[i:i + 3]
        pa, pb, pc = positions[ia], positions[ib], positions[ic]
        centroid = tuple((pa[j] + pb[j] + pc[j]) / 3 for j in range(3))

        # Fast rejection before rasterizing the UV triangle.
        if not (
            abs(centroid[0]) <= 0.235
            and 0.63 <= centroid[1] <= 1.035
            and centroid[2] >= 0.115
        ):
            continue

        tri_uv = [uvs[ia], uvs[ib], uvs[ic]]
        # Atlas seams that cross the 0/1 boundary would create enormous boxes.
        if max(v[0] for v in tri_uv) - min(v[0] for v in tri_uv) > 0.45:
            continue
        if max(v[1] for v in tri_uv) - min(v[1] for v in tri_uv) > 0.45:
            continue

        pts = [
            (uv[0] * (width - 1), (1.0 - uv[1]) * (height - 1))
            for uv in tri_uv
        ]
        min_x = max(0, int(math.floor(min(p[0] for p in pts))) - 1)
        max_x = min(width - 1, int(math.ceil(max(p[0] for p in pts))) + 1)
        min_y = max(0, int(math.floor(min(p[1] for p in pts))) - 1)
        max_y = min(height - 1, int(math.ceil(max(p[1] for p in pts))) + 1)

        for py in range(min_y, max_y + 1):
            for px in range(min_x, max_x + 1):
                bc = barycentric(px + 0.5, py + 0.5, pts[0], pts[1], pts[2])
                if bc is None:
                    continue
                w0, w1, w2 = bc
                pos = tuple(
                    pa[j] * w0 + pb[j] * w1 + pc[j] * w2
                    for j in range(3)
                )
                if face_position(pos):
                    mapped[(px, py)] = pos
    return mapped


def percentile(values, pct):
    if not values:
        return 0.0
    data = sorted(values)
    idx = int(round((len(data) - 1) * pct))
    return data[max(0, min(len(data) - 1, idx))]


def detect_landmarks(source, face_map):
    whites = {"left": [], "right": []}
    dark_eye = []
    dark_mouth = []

    for pixel, pos in face_map.items():
        r, g, b, a = source.getpixel(pixel)
        x, y, z = pos
        mx, mn = max(r, g, b), min(r, g, b)
        neutral = mx - mn < 45

        if y >= 0.80 and neutral and mn >= 178:
            whites["left" if x < 0 else "right"].append(pos)

        if y >= 0.80 and mx <= 105 and abs(x) <= 0.15:
            dark_eye.append(pos)

        if y < 0.82 and mx <= 125 and abs(x) <= 0.14:
            dark_mouth.append(pos)

    def eye_stats(rows, fallback_x):
        if len(rows) < 30:
            return {"cx": fallback_x, "cy": 0.875, "rx": 0.050, "ry": 0.060}
        xs = [p[0] for p in rows]
        ys = [p[1] for p in rows]
        x0, x1 = percentile(xs, 0.05), percentile(xs, 0.95)
        y0, y1 = percentile(ys, 0.05), percentile(ys, 0.95)
        return {
            "cx": (x0 + x1) / 2,
            "cy": (y0 + y1) / 2,
            "rx": max(0.030, (x1 - x0) / 2),
            "ry": max(0.035, (y1 - y0) / 2),
        }

    left = eye_stats(whites["left"], -0.055)
    right = eye_stats(whites["right"], 0.055)

    pupil_y = percentile([p[1] for p in dark_eye], 0.5) if dark_eye else (left["cy"] + right["cy"]) / 2
    mouth_y = percentile([p[1] for p in dark_mouth], 0.5) if dark_mouth else 0.725
    eye_rows = whites["left"] + whites["right"]
    eye_z = percentile([p[2] for p in eye_rows], 0.5) if eye_rows else 0.20
    eye_z_min = percentile([p[2] for p in eye_rows], 0.05) if eye_rows else 0.15
    eye_z_max = percentile([p[2] for p in eye_rows], 0.95) if eye_rows else 0.26
    mouth_z = percentile([p[2] for p in dark_mouth], 0.5) if dark_mouth else 0.20

    # Stabilise the automatically detected centres around the symmetric avatar.
    eye_y = (left["cy"] + right["cy"]) / 2
    eye_rx = min(0.065, max(0.038, (left["rx"] + right["rx"]) / 2))
    eye_ry = min(0.075, max(0.042, (left["ry"] + right["ry"]) / 2))
    eye_x = min(0.085, max(0.040, (abs(left["cx"]) + abs(right["cx"])) / 2))

    return {
        "eye_x": eye_x,
        "eye_y": eye_y,
        "eye_rx": eye_rx,
        "eye_ry": eye_ry,
        "pupil_y": pupil_y,
        "mouth_y": mouth_y,
        "eye_z": eye_z,
        "eye_z_min": eye_z_min,
        "eye_z_max": eye_z_max,
        "mouth_z": mouth_z,
    }


def ellipse(pos, cx, cy, rx, ry):
    x, y, _ = pos
    if rx <= 0 or ry <= 0:
        return False
    return ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1.0


def segment_distance(pos, ax, ay, bx, by):
    x, y, _ = pos
    vx, vy = bx - ax, by - ay
    wx, wy = x - ax, y - ay
    vv = vx * vx + vy * vy
    if vv < 1e-12:
        return math.hypot(wx, wy)
    t = max(0.0, min(1.0, (wx * vx + wy * vy) / vv))
    return math.hypot(x - (ax + t * vx), y - (ay + t * vy))


def skin_fill(target, pos):
    _, y, _ = pos
    shade = max(0.965, min(1.02, 0.99 + (y - 0.82) * 0.07))
    return tuple(max(0, min(255, int(c * shade))) for c in target) + (255,)


def build_old_feature_mask(source, face_map):
    mask = Image.new("L", source.size, 0)
    mp = mask.load()

    for pixel, pos in face_map.items():
        r, g, b, a = source.getpixel(pixel)
        x, y, z = pos
        mx, mn = max(r, g, b), min(r, g, b)
        neutral = mx - mn < 55

        eye_white = y >= 0.79 and neutral and mn >= 168
        dark_feature = mx <= 125 and abs(x) <= 0.16 and 0.675 <= y <= 0.96
        if eye_white or dark_feature:
            mp[pixel] = 255

    # Remove antialiased fringes from the baked face too.
    return mask.filter(ImageFilter.MaxFilter(9))


def paint_expression(source, face_map, target_skin, landmarks, face_id):
    overlay = Image.new("RGBA", source.size, (0, 0, 0, 0))
    op = overlay.load()

    if face_id == "face-classic":
        return overlay

    old_mask = build_old_feature_mask(source, face_map)
    old = old_mask.load()

    ex = landmarks["eye_x"]
    ey = landmarks["eye_y"]
    erx = landmarks["eye_rx"]
    ery = landmarks["eye_ry"]
    mouth_y = min(ey - 0.115, landmarks["mouth_y"])

    # Build a genuinely clean facial canvas before drawing the selected face.
    # The original Meshy avatar has eyes/mouth baked into the same continuous
    # mesh + texture, so merely painting a new line on top leaves the old face
    # visible. We erase the complete eye sockets and mouth zone on the *real*
    # front-head triangles derived from the GLB UV map.
    for pixel, pos in face_map.items():
        x, y, _ = pos
        erase_eye = (
            ellipse(pos, -ex, ey, erx * 1.38, ery * 1.42)
            or ellipse(pos, ex, ey, erx * 1.38, ery * 1.42)
        )
        erase_mouth = abs(x) <= max(0.105, ex * 1.85) and abs(y - mouth_y) <= 0.062
        if old[pixel] > 0 or erase_eye or erase_mouth:
            op[pixel] = skin_fill(target_skin, pos)

    # Deliberately strong silhouettes: each choice must read immediately at the
    # normal wardrobe camera distance, not only under pixel-level comparison.
    if face_id == "face-smile":
        eye_rx = erx * 1.02
        eye_ry = ery * 0.56
        mouth_width = ex * 1.55
    elif face_id == "face-determined":
        eye_rx = erx * 1.03
        eye_ry = ery * 0.50
        mouth_width = ex * 1.05
    else:
        eye_rx = erx * 1.16
        eye_ry = ery * 1.24
        mouth_width = ex * 0.78

    white = (248, 247, 244, 255)
    dark = (58, 38, 29, 255)

    for pixel, pos in face_map.items():
        x, y, _ = pos

        in_left = ellipse(pos, -ex, ey, eye_rx, eye_ry)
        in_right = ellipse(pos, ex, ey, eye_rx, eye_ry)
        if in_left or in_right:
            op[pixel] = white

        if face_id == "face-surprised":
            pupil_rx = max(0.0085, erx * 0.20)
            pupil_ry = max(0.0100, eye_ry * 0.17)
            pupil_shift = -0.001
        elif face_id == "face-determined":
            pupil_rx = max(0.0090, erx * 0.22)
            pupil_ry = max(0.0080, eye_ry * 0.26)
            pupil_shift = -0.004
        else:
            pupil_rx = max(0.0095, erx * 0.23)
            pupil_ry = max(0.0085, eye_ry * 0.27)
            pupil_shift = 0.005

        if (
            ellipse(pos, -ex, ey + pupil_shift, pupil_rx, pupil_ry)
            or ellipse(pos, ex, ey + pupil_shift, pupil_rx, pupil_ry)
        ):
            op[pixel] = dark

        if face_id == "face-determined":
            brow_y = ey + eye_ry * 1.20
            if segment_distance(
                pos,
                -ex - eye_rx * 0.95,
                brow_y + 0.020,
                -ex + eye_rx * 0.88,
                brow_y - 0.014,
            ) <= 0.0085:
                op[pixel] = dark
            if segment_distance(
                pos,
                ex - eye_rx * 0.88,
                brow_y - 0.014,
                ex + eye_rx * 0.95,
                brow_y + 0.020,
            ) <= 0.0085:
                op[pixel] = dark

            if segment_distance(
                pos,
                -mouth_width,
                mouth_y,
                mouth_width,
                mouth_y,
            ) <= 0.0075:
                op[pixel] = dark

        elif face_id == "face-surprised":
            outer = ellipse(pos, 0.0, mouth_y, ex * 0.48, ex * 0.62)
            inner = ellipse(pos, 0.0, mouth_y, ex * 0.22, ex * 0.34)
            if outer and not inner:
                op[pixel] = dark

        else:
            if abs(x) <= mouth_width:
                # South-Park-like simple graphic smile: broad, clean and readable.
                curve = mouth_y + 0.050 * (1.0 - (x / max(mouth_width, 1e-6)) ** 2)
                if abs(y - curve) <= 0.0075:
                    op[pixel] = dark

    return overlay

def main():
    report = []

    for skin_id, target in SKINS.items():
        source_glb = SKIN_DIR / f"avatar_workwear_v2_{skin_id}.glb"
        gltf, bin_chunk = read_glb(source_glb)
        source = embedded_base_color(gltf, bin_chunk)

        face_map = build_face_pixel_map(gltf, bin_chunk, source.width, source.height)
        if len(face_map) < 500:
            raise RuntimeError(f"Face UV map too small for {skin_id}: {len(face_map)} pixels")

        landmarks = detect_landmarks(source, face_map)
        skin_out = OUT / skin_id
        skin_out.mkdir(parents=True, exist_ok=True)

        for face_id in FACES:
            overlay = paint_expression(source, face_map, target, landmarks, face_id)
            dest = skin_out / f"{face_id}.png"
            overlay.save(dest, optimize=True)
            alpha = overlay.getchannel("A")
            changed = sum(1 for value in alpha.getdata() if value)
            report.append(
                f"{skin_id}/{face_id}: {changed} overlay pixels; "
                f"eye=({landmarks['eye_x']:.4f},{landmarks['eye_y']:.4f}) "
                f"r=({landmarks['eye_rx']:.4f},{landmarks['eye_ry']:.4f}) "
                f"eye_z={landmarks['eye_z']:.4f}[{landmarks['eye_z_min']:.4f},{landmarks['eye_z_max']:.4f}] "
                f"mouth=({landmarks['mouth_y']:.4f},z={landmarks['mouth_z']:.4f})"
            )

    (OUT / "README.txt").write_text(
        "Maître Artisan V2 face overlays.\n"
        "Generated from the real rigged avatar geometry and each approved skin texture.\n"
        "The overlays use the original GLB UVs; no mockup or procedural 3D primitive is used at runtime.\n\n"
        + "\n".join(report)
        + "\n",
        encoding="utf-8",
    )
    print("\n".join(report))


if __name__ == "__main__":
    main()
