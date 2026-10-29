#!/usr/bin/env python3
import os
import math
from PIL import Image, ImageDraw, ImageFont

def get_font(size, bold=False):
    fonts_dir = "C:/Windows/Fonts"
    candidates = [
        "segoeuib.ttf" if bold else "segoeui.ttf",
        "arialbd.ttf" if bold else "arial.ttf",
        "calibrib.ttf" if bold else "calibri.ttf"
    ]
    for c in candidates:
        p = os.path.join(fonts_dir, c)
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                continue
    return ImageFont.load_default()

def draw_star(draw, cx, cy, r_out, r_in, fill_color):
    """Draw a crisp 5-pointed star."""
    points = []
    angle_offset = -math.pi / 2
    for i in range(10):
        angle = angle_offset + i * (math.pi / 5)
        r = r_out if i % 2 == 0 else r_in
        x = cx + r * math.cos(angle)
        y = cy + r * math.sin(angle)
        points.append((x, y))
    draw.polygon(points, fill=fill_color)

def generate_og_banner(output_path):
    width = 1200
    height = 630

    # Colors
    bg_top = (11, 19, 38)          # Deep slate navy
    bg_bot = (4, 10, 20)           # Midnight black
    emerald = (16, 185, 129)       # #10b981
    emerald_dark = (5, 150, 105)   # #059669
    gold = (251, 191, 36)          # #fbbf24
    white = (255, 255, 255)
    slate_light = (226, 232, 240)  # #e2e8f0
    slate_muted = (148, 163, 184)  # #94a3b8

    # 1. Base gradient
    base = Image.new("RGBA", (width, height), bg_top)
    draw_base = ImageDraw.Draw(base)
    for y in range(height):
        ratio = y / float(height)
        r = int(bg_top[0] * (1 - ratio) + bg_bot[0] * ratio)
        g = int(bg_top[1] * (1 - ratio) + bg_bot[1] * ratio)
        b = int(bg_top[2] * (1 - ratio) + bg_bot[2] * ratio)
        draw_base.line([(0, y), (width, y)], fill=(r, g, b, 255))

    # 2. Ambient radial glow in center
    glow = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    for radius in range(400, 0, -15):
        alpha = int((1 - (radius / 400.0)) * 55)
        glow_draw.ellipse(
            [(width // 2 - radius, height // 2 - radius - 30),
             (width // 2 + radius, height // 2 + radius - 30)],
            fill=(emerald[0], emerald[1], emerald[2], alpha)
        )
    img = Image.alpha_composite(base, glow)
    draw = ImageDraw.Draw(img)

    # 3. Outer border frame
    draw.rounded_rectangle(
        [(16, 16), (width - 16, height - 16)],
        radius=24,
        outline=(emerald[0], emerald[1], emerald[2], 75),
        width=2
    )

    # 4. Floating Decorative Badges (Left & Right - outside the 630px square safe zone)
    # Left Card: Instant Confirmation
    left_card_x1, left_card_y1 = 50, 240
    left_card_w, left_card_h = 220, 140
    draw.rounded_rectangle(
        [(left_card_x1, left_card_y1), (left_card_x1 + left_card_w, left_card_y1 + left_card_h)],
        radius=16,
        fill=(15, 23, 42, 220),
        outline=(emerald[0], emerald[1], emerald[2], 80),
        width=1
    )
    font_card_head = get_font(18, bold=True)
    font_card_sub = get_font(14, bold=False)
    font_card_stat = get_font(28, bold=True)

    draw.text((left_card_x1 + 20, left_card_y1 + 20), "Instant Booking", fill=slate_light, font=font_card_head)
    draw.text((left_card_x1 + 20, left_card_y1 + 52), "100%", fill=emerald, font=font_card_stat)
    draw.text((left_card_x1 + 20, left_card_y1 + 95), "Real-time Availability", fill=slate_muted, font=font_card_sub)

    # Right Card: Top Guest Rating
    right_card_x1, right_card_y1 = width - 270, 240
    right_card_w, right_card_h = 220, 140
    draw.rounded_rectangle(
        [(right_card_x1, right_card_y1), (right_card_x1 + right_card_w, right_card_y1 + right_card_h)],
        radius=16,
        fill=(15, 23, 42, 220),
        outline=(emerald[0], emerald[1], emerald[2], 80),
        width=1
    )
    draw.text((right_card_x1 + 20, right_card_y1 + 20), "Guest Ratings", fill=slate_light, font=font_card_head)
    draw.text((right_card_x1 + 20, right_card_y1 + 52), "4.9 ★", fill=gold, font=font_card_stat)
    draw.text((right_card_x1 + 20, right_card_y1 + 95), "Verified Stay Reviews", fill=slate_muted, font=font_card_sub)

    # =========================================================================
    # SAFE ZONE: EVERYTHING IN THE CENTER (x: 290 to 910)
    # Perfectly visible on mobile WhatsApp 1:1 crops and widescreen banners!
    # =========================================================================

    cx = width // 2  # 600

    # 5. Large Brand Icon (Hotelier "H" with luxury silhouette)
    icon_size = 96
    icon_x = cx - icon_size // 2
    icon_y = 65

    # Icon outer drop shadow
    draw.rounded_rectangle(
        [(icon_x - 3, icon_y - 1), (icon_x + icon_size + 3, icon_y + icon_size + 5)],
        radius=24,
        fill=(0, 0, 0, 140)
    )
    # Icon background (Emerald gradient)
    draw.rounded_rectangle(
        [(icon_x, icon_y), (icon_x + icon_size, icon_y + icon_size)],
        radius=22,
        fill=emerald_dark,
        outline=emerald,
        width=3
    )

    # Draw White "H" Building in the icon
    col_w = 14
    h_pad_x = 26
    h_pad_y = 22
    hx1 = icon_x + h_pad_x
    hx2 = icon_x + icon_size - h_pad_x - col_w
    hy1 = icon_y + h_pad_y
    hy2 = icon_y + icon_size - h_pad_y
    cross_y1 = icon_y + 40
    cross_y2 = icon_y + 54

    # Pillars and crossbar
    draw.rounded_rectangle([(hx1, hy1), (hx1 + col_w, hy2)], radius=4, fill=white)
    draw.rounded_rectangle([(hx2, hy1), (hx2 + col_w, hy2)], radius=4, fill=white)
    draw.rounded_rectangle([(hx1, cross_y1), (hx2 + col_w, cross_y2)], radius=3, fill=white)

    # 6. Pill Tagline Badge
    pill_text = "LUXURY HOTEL & RESORT STAYS"
    font_pill = get_font(14, bold=True)
    pill_w = 310
    pill_h = 32
    pill_x = cx - pill_w // 2
    pill_y = 182
    draw.rounded_rectangle(
        [(pill_x, pill_y), (pill_x + pill_w, pill_y + pill_h)],
        radius=16,
        fill=(16, 185, 129, 30),
        outline=(16, 185, 129, 200),
        width=1
    )
    draw.text((cx, pill_y + pill_h // 2), pill_text, fill=emerald, font=font_pill, anchor="mm")

    # 7. Main Title: "Hotelier" (Big, Bold & High Contrast)
    font_title = get_font(72, bold=True)
    # Text shadow
    draw.text((cx + 2, 267), "Hotelier", fill=(0, 0, 0, 180), font=font_title, anchor="mm")
    draw.text((cx, 265), "Hotelier", fill=white, font=font_title, anchor="mm")

    # 8. Five Gold Stars
    star_r_out = 11
    star_r_in = 5
    star_spacing = 30
    stars_total_w = 4 * star_spacing
    stars_start_x = cx - stars_total_w // 2
    stars_y = 322

    for i in range(5):
        star_x = stars_start_x + i * star_spacing
        draw_star(draw, star_x, stars_y, star_r_out, star_r_in, gold)

    # 9. Subtitle
    font_subtitle = get_font(26, bold=True)
    draw.text((cx, 368), "Modern Hotel Management & Online Booking", fill=slate_light, font=font_subtitle, anchor="mm")

    # 10. Key Highlights Line
    font_features = get_font(18, bold=False)
    features_text = "Instant Booking  •  Verified Guest Reviews  •  Live Room Availability"
    draw.text((cx, 412), features_text, fill=slate_muted, font=font_features, anchor="mm")

    # 11. Live URL & Status Pill
    font_url = get_font(18, bold=True)
    url_text = "hotelierstays.web.app"
    url_pill_w = 300
    url_pill_h = 44
    url_pill_x = cx - url_pill_w // 2
    url_pill_y = 465

    draw.rounded_rectangle(
        [(url_pill_x, url_pill_y), (url_pill_x + url_pill_w, url_pill_y + url_pill_h)],
        radius=22,
        fill=(15, 23, 42, 240),
        outline=(16, 185, 129, 220),
        width=2
    )

    # Green pulse dot inside pill
    dot_r = 5
    dot_cx = url_pill_x + 30
    dot_cy = url_pill_y + url_pill_h // 2
    draw.ellipse([(dot_cx - dot_r - 2, dot_cy - dot_r - 2), (dot_cx + dot_r + 2, dot_cy + dot_r + 2)], fill=(16, 185, 129, 80))
    draw.ellipse([(dot_cx - dot_r, dot_cy - dot_r), (dot_cx + dot_r, dot_cy + dot_r)], fill=(52, 211, 153, 255))

    # URL Text
    draw.text((url_pill_x + 48, dot_cy), url_text, fill=white, font=font_url, anchor="lm")

    # Convert to RGB and save optimized
    final_img = img.convert("RGB")
    final_img.save(output_path, "PNG", optimize=True)
    size_kb = os.path.getsize(output_path) / 1024.0
    print(f"[OK] Generated {output_path}: {width}x{height} px, {size_kb:.1f} KB")

def generate_brand_icon(size, output_path):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    pad = max(1, int(size * 0.05))
    corner = max(4, int(size * 0.22))

    draw.rounded_rectangle(
        [(pad, pad), (size - pad, size - pad)],
        radius=corner,
        fill=(5, 150, 105, 255),
        outline=(16, 185, 129, 255),
        width=max(1, int(size * 0.03))
    )

    w_ratio = size / 64.0
    col_w = max(2, int(9 * w_ratio))
    x1 = int(18 * w_ratio)
    x2 = int(size - 18 * w_ratio - col_w)
    y_top = int(16 * w_ratio)
    y_bot = int(size - 16 * w_ratio)
    cross_top = int(28 * w_ratio)
    cross_bot = int(36 * w_ratio)

    draw.rounded_rectangle([(x1, y_top), (x1 + col_w, y_bot)], radius=int(2 * w_ratio), fill=(255, 255, 255, 255))
    draw.rounded_rectangle([(x2, y_top), (x2 + col_w, y_bot)], radius=int(2 * w_ratio), fill=(255, 255, 255, 255))
    draw.rounded_rectangle([(x1, cross_top), (x2 + col_w, cross_bot)], radius=int(2 * w_ratio), fill=(255, 255, 255, 255))

    img.save(output_path, "PNG", optimize=True)
    print(f"[OK] Generated {output_path} ({size}x{size})")

if __name__ == "__main__":
    os.makedirs("client/public/assets", exist_ok=True)
    os.makedirs("client/dist/assets", exist_ok=True)

    # Generate both og-image.png and og-banner.png for immediate cache busting
    generate_og_banner("client/public/assets/og-image.png")
    generate_og_banner("client/public/assets/og-banner.png")
    generate_og_banner("client/dist/assets/og-image.png")
    generate_og_banner("client/dist/assets/og-banner.png")

    # Generate brand icons
    for path in ["client/public/assets", "client/dist/assets"]:
        generate_brand_icon(16, f"{path}/favicon-16x16.png")
        generate_brand_icon(32, f"{path}/favicon-32x32.png")
        generate_brand_icon(180, f"{path}/apple-touch-icon.png")
        generate_brand_icon(192, f"{path}/icon-192x192.png")
        generate_brand_icon(512, f"{path}/icon-512x512.png")

    generate_brand_icon(32, "client/public/favicon.ico")
    if os.path.exists("client/dist"):
        generate_brand_icon(32, "client/dist/favicon.ico")
