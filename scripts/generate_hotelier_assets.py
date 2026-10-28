#!/usr/bin/env python3
import os
import math
from PIL import Image, ImageDraw, ImageFont

def generate_og_banner(output_path):
    width = 1200
    height = 630

    # 1. Base gradient
    bg_color_top = (15, 23, 42)      # Dark Slate Navy (#0f172a)
    bg_color_bottom = (8, 12, 21)    # Cosmic Black (#080c15)
    primary_color = (16, 185, 129)   # Emerald (#10b981)
    accent_color = (5, 150, 105)     # Deep Emerald (#059669)

    img = Image.new("RGBA", (width, height), bg_color_top)
    draw = ImageDraw.Draw(img)

    for y in range(height):
        ratio = y / float(height)
        r = int(bg_color_top[0] * (1 - ratio) + bg_color_bottom[0] * ratio)
        g = int(bg_color_top[1] * (1 - ratio) + bg_color_bottom[1] * ratio)
        b = int(bg_color_top[2] * (1 - ratio) + bg_color_bottom[2] * ratio)
        draw.line([(0, y), (width, y)], fill=(r, g, b, 255))

    # 2. Ambient glow in center
    glow = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    for radius in range(350, 0, -20):
        alpha = int((1 - (radius / 350.0)) * 40)
        glow_draw.ellipse(
            [(width // 2 - radius, height // 2 - radius - 10),
             (width // 2 + radius, height // 2 + radius - 10)],
            fill=(accent_color[0], accent_color[1], accent_color[2], alpha)
        )
    img = Image.alpha_composite(img, glow)
    draw = ImageDraw.Draw(img)

    # 3. Outer border / safe frame
    draw.rounded_rectangle(
        [(16, 16), (width - 16, height - 16)],
        radius=20,
        outline=(primary_color[0], primary_color[1], primary_color[2], 70),
        width=2
    )

    # Fonts fallback
    def get_font(size, bold=False):
        font_names = [
            "Segoe UI Bold.ttf" if bold else "Segoe UI.ttf",
            "Arial Bold.ttf" if bold else "Arial.ttf",
            "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf",
            "Roboto-Bold.ttf" if bold else "Roboto-Regular.ttf"
        ]
        for name in font_names:
            try:
                return ImageFont.truetype(name, size)
            except IOError:
                continue
        return ImageFont.load_default()

    font_pill = get_font(13, bold=True)
    font_title = get_font(56, bold=True)
    font_subtitle = get_font(23, bold=True)
    font_tagline = get_font(17, bold=False)

    # 4. Pill badge (Center)
    pill_text = "HOTEL & RESORT STAYS  -  v2.0"
    pill_w = 260
    pill_h = 36
    pill_x = (width - pill_w) // 2
    pill_y = 105
    draw.rounded_rectangle(
        [(pill_x, pill_y), (pill_x + pill_w, pill_y + pill_h)],
        radius=18,
        fill=(primary_color[0], primary_color[1], primary_color[2], 25),
        outline=(primary_color[0], primary_color[1], primary_color[2], 180),
        width=1
    )
    draw.text((width // 2, pill_y + 10), pill_text, fill=primary_color, font=font_pill, anchor="mm")

    # 5. Main Title
    title = "Hotelier"
    draw.text((width // 2, 225), title, fill=(248, 250, 252), font=font_title, anchor="mm")

    # 6. Subtitle
    subtitle = "Modern Hotel Management & Reservation System"
    draw.text((width // 2, 310), subtitle, fill=(203, 213, 225), font=font_subtitle, anchor="mm")

    # 7. Tagline
    tagline = "Instant Booking  *  Verified Guest Reviews  *  Live Room Availability"
    draw.text((width // 2, 375), tagline, fill=(148, 163, 184), font=font_tagline, anchor="mm")

    # 8. Accent Line
    line_w = 320
    line_x = (width - line_w) // 2
    line_y = 440
    draw.line([(line_x, line_y), (line_x + line_w, line_y)], fill=(primary_color[0], primary_color[1], primary_color[2], 140), width=2)

    # Convert to RGB and save optimized (<300 KB for WhatsApp)
    final_img = img.convert("RGB")
    final_img.save(output_path, "PNG", optimize=True)
    size_kb = os.path.getsize(output_path) / 1024.0
    print(f"[OK] Generated {output_path}: {width}x{height} px, {size_kb:.1f} KB")

def generate_brand_icon(size, output_path):
    # Generates rounded emerald icon with modern "H" or hotel silhouette
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    pad = max(1, int(size * 0.05))
    corner = max(4, int(size * 0.22))

    # Background gradient or solid emerald
    draw.rounded_rectangle(
        [(pad, pad), (size - pad, size - pad)],
        radius=corner,
        fill=(5, 150, 105, 255),
        outline=(16, 185, 129, 255),
        width=max(1, int(size * 0.03))
    )

    # Draw stylized "H" building
    # Left pillar, right pillar, crossbar
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
    generate_og_banner("client/public/assets/og-image.png")
    generate_brand_icon(16, "client/public/assets/favicon-16x16.png")
    generate_brand_icon(32, "client/public/assets/favicon-32x32.png")
    generate_brand_icon(180, "client/public/assets/apple-touch-icon.png")
    generate_brand_icon(192, "client/public/assets/icon-192x192.png")
    generate_brand_icon(512, "client/public/assets/icon-512x512.png")
    # Also create root favicon.ico / favicon.png
    generate_brand_icon(32, "client/public/favicon.ico")
