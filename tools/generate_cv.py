#!/usr/bin/env python3
"""Génère adam/cv.pdf — un CV d'une page, au format du portfolio (fond gris
anthracite, halos dégradés dans les coins), avec la structure du CV de
Bastien Okonski (deux colonnes, pitch en intro, compétences groupées,
expériences datées, projets avec tags et liens) mais les vraies données
d'Adam.

Contenu et coordonnées : à jour manuellement ici, pas encore piloté par
l'admin (data.json) — voir CONTEXTE.md si ça change.

    pip3 install --user reportlab numpy pillow
    python3 tools/generate_cv.py

Écrit adam/cv.pdf. Le bouton "CV" du site (cv.pdf, avec `download`) le sert
déjà sur toutes les pages — rien d'autre à brancher.
"""
import os, io
import numpy as np
from PIL import Image
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.utils import simpleSplit, ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "adam", "cv.pdf")

# Polices du site (adam/style.css) : Schoolbell pour le titre (--font-title,
# meme main que le "Adam" de l'accueil), Baloo 2 pour les sous-titres
# (--font-display, meme police que les titres de carte/de section), Homemade
# Apple pour la bio (--font-script, meme police que la bio de l'accueil).
FONTS_DIR = os.path.join(ROOT, "tools", "fonts")
pdfmetrics.registerFont(TTFont("HomemadeApple", os.path.join(FONTS_DIR, "HomemadeApple-Regular.ttf")))
pdfmetrics.registerFont(TTFont("Schoolbell", os.path.join(FONTS_DIR, "Schoolbell-Regular.ttf")))
pdfmetrics.registerFont(TTFont("Baloo2-Bold", os.path.join(FONTS_DIR, "Baloo2-Bold.ttf")))

W, H = A4  # 595 x 842 pt

# ---- palette et texture du site (adam/style.css : --bg-soft, --bg, --bg-deep,
# --halo, --accent-strong, --accent-sky, --text-dim) ----
BG_SOFT = np.array([13/255, 20/255, 84/255])   # #0d1454
BG_MID = np.array([8/255, 11/255, 48/255])     # #080b30
BG_DEEP = np.array([5/255, 7/255, 31/255])     # #05071f
HALO = np.array([90/255, 100/255, 255/255])    # halo du hero, rgba(90,100,255,.22)
TEXTURE_PATH = os.path.join(ROOT, "adam", "images", "bg-vert.webp")  # meme texture que le fond du site

ACCENT = (91/255, 99/255, 255/255)    # #5b63ff (accentStrong)
ACCENT_SKY = (127/255, 196/255, 255/255)  # #7fc4ff
WHITE = (1, 1, 1)
TEXT_DIM = (0.72, 0.74, 0.85)
TEXT_FAINT = (0.55, 0.57, 0.7)
LINE = (0.25, 0.28, 0.45)

MARGIN = 42
COL_GAP = 24
COL_W = (W - 2 * MARGIN - COL_GAP) / 2
LX = MARGIN
RX = MARGIN + COL_W + COL_GAP

c = canvas.Canvas(OUT, pagesize=A4)


def make_background(w_pt, h_pt, scale=3):
    """Reproduit le fond du site (.topo-bg dans style.css) : un dégradé bleu
    nuit (bg-soft -> bg -> bg-deep, ~160deg), un halo au sommet, et par-dessus
    la même texture topographique (images/bg-vert.webp) à la même opacité —
    pour que le CV garde un fond sombre mais avec les mêmes traits
    psychédéliques que le reste du site (et le LinkedIn)."""
    w, h = int(w_pt * scale), int(h_pt * scale)
    yy, xx = np.mgrid[0:h, 0:w].astype(float)
    yy /= h
    xx /= w

    # degrade lineaire ~160deg (haut un peu a gauche -> bas un peu a droite)
    ang = np.radians(160 - 90)
    t = xx * np.cos(ang) + yy * np.sin(ang)
    t = (t - t.min()) / (t.max() - t.min())
    t = t[..., None]
    arr = np.where(t < 0.5,
                   BG_SOFT + (BG_MID - BG_SOFT) * (t / 0.5),
                   BG_MID + (BG_DEEP - BG_MID) * ((t - 0.5) / 0.5))

    # halo en ellipse tout en haut de la page, comme le hero de l'accueil —
    # discret, pour ne pas trop eclaircir un fond qui doit rester sombre
    dx = (xx - 0.5) / 0.5
    dy = (yy + 0.1) / 0.6
    d = np.sqrt(dx ** 2 + dy ** 2)
    halo_factor = (np.clip(1 - d, 0, 1) ** 2 * 0.11)[..., None]
    arr = arr * (1 - halo_factor) + HALO * halo_factor

    # texture topographique du site, superposee mais attenuee (le site l'a a
    # 0.55, ici on la garde plus discrete pour rester sombre)
    tex = Image.open(TEXTURE_PATH).convert("RGB").resize((w, h), Image.LANCZOS)
    tex_arr = np.asarray(tex).astype(float) / 255.0
    arr = arr * (1 - 0.3) + tex_arr * 0.3

    # assombrit l'ensemble pour retrouver le cote "fond sombre" du CV
    arr = arr * 0.72

    img = (np.clip(arr, 0, 1) * 255).astype(np.uint8)
    return Image.fromarray(img, mode="RGB")


# ---- fond ----
bg_buf = io.BytesIO()
make_background(W, H).save(bg_buf, format="PNG")
bg_buf.seek(0)
c.drawImage(ImageReader(bg_buf), 0, 0, width=W, height=H)


def wrap(text, font, size, max_w):
    return simpleSplit(text, font, size, max_w)


# ---- en-tête (juste le nom et le rôle — pas de 3e ligne, déjà redit en Formations) ----
y = H - 56
c.setFillColorRGB(*WHITE)
c.setFont("Schoolbell", 32)
c.drawString(LX, y, "Adam Karroum")

c.setFillColorRGB(*ACCENT_SKY)
c.setFont("Helvetica-Bold", 10.5)
c.drawString(LX, y - 20, "Création de contenu audiovisuel — graphisme, vidéo, audio")

# bloc contact, aligné à droite
contact = [
    "adam.karroum@student.isfsc.be",
    "0486 53 37 15",
    "Bruxelles, Belgique",
]
c.setFont("Helvetica", 10)
cy = y
for i, line in enumerate(contact):
    c.setFillColorRGB(*(WHITE if i == 0 else TEXT_DIM))
    c.drawRightString(W - MARGIN, cy, line)
    cy -= 14

# ---- pitch (bordure gauche façon citation ; police cursive du site, comme
# la bio de la page d'accueil) ----
y -= 48
pitch = ("Depuis petit, je suis passionné par la création de contenu et l'influence sur le web. "
         "Autodidacte, j'ai développé des compétences en graphisme, montage vidéo et mixage audio.")
lines = wrap(pitch, "HomemadeApple", 10.5, W - 2 * MARGIN - 16)
block_h = 8 + len(lines) * 16
c.setFillColorRGB(*ACCENT)
c.rect(LX, y - block_h + 12, 2.4, block_h, fill=1, stroke=0)
c.setFont("HomemadeApple", 10.5)
c.setFillColorRGB(*TEXT_DIM)
ty = y
for line in lines:
    c.drawString(LX + 14, ty, line)
    ty -= 16

y = ty - 26


def section_title(x, y, title):
    c.setFillColorRGB(*ACCENT_SKY)
    c.setFont("Baloo2-Bold", 12)
    c.drawString(x, y, title.upper())
    c.setStrokeColorRGB(*LINE)
    c.setLineWidth(0.6)
    c.line(x, y - 7, x + COL_W, y - 7)
    return y - 24


def entry(x, y, date, title, place, desc_lines, gap_after=22):
    c.setFillColorRGB(*TEXT_FAINT)
    c.setFont("Helvetica", 8.5)
    c.drawString(x, y, date)
    y -= 13
    c.setFillColorRGB(*WHITE)
    c.setFont("Baloo2-Bold", 11)
    c.drawString(x, y, title)
    y -= 14
    if place:
        c.setFillColorRGB(*ACCENT_SKY)
        c.setFont("Helvetica", 9.5)
        c.drawString(x, y, place)
        y -= 14
    if desc_lines:
        c.setFillColorRGB(*TEXT_DIM)
        c.setFont("Helvetica", 9)
        for dl in desc_lines:
            for wrapped in wrap(dl, "Helvetica", 9, COL_W):
                c.drawString(x, y, wrapped)
                y -= 12.5
    return y - gap_after


def skill_group(x, y, title, items):
    c.setFillColorRGB(*WHITE)
    c.setFont("Baloo2-Bold", 11)
    c.drawString(x, y, title)
    y -= 13.5
    c.setFillColorRGB(*TEXT_DIM)
    c.setFont("Helvetica", 9.5)
    for wrapped in wrap(items, "Helvetica", 9.5, COL_W):
        c.drawString(x, y, wrapped)
        y -= 12
    return y - 13


def project(x, y, title, desc, tags, link_label=None):
    c.setFillColorRGB(*WHITE)
    c.setFont("Baloo2-Bold", 11)
    c.drawString(x, y, title)
    y -= 13.5
    if desc:
        c.setFillColorRGB(*TEXT_DIM)
        c.setFont("Helvetica", 9.5)
        for wrapped in wrap(desc, "Helvetica", 9.5, COL_W):
            c.drawString(x, y, wrapped)
            y -= 12.5
    if tags or link_label:
        c.setFillColorRGB(*ACCENT_SKY)
        c.setFont("Helvetica", 8.5)
        c.drawString(x, y, " · ".join(tags))
        if link_label:
            c.setFillColorRGB(*ACCENT)
            c.setFont("Helvetica-Bold", 8.5)
            c.drawRightString(x + COL_W, y, link_label)
        y -= 13
    return y - 13


def insert_card(x, top_y, title, items):
    """Encart en pointillés, sans fond, coins droits — pour un groupe d'xp à
    part des expériences « com » — ex. jobs étudiants."""
    pad = 14
    item_h = 32
    h = pad * 2 + 18 + len(items) * item_h

    c.saveState()
    c.setDash(3, 3)
    c.setStrokeColorRGB(140/255, 160/255, 255/255)
    c.setStrokeAlpha(0.5)
    c.setLineWidth(0.8)
    c.rect(x, top_y - h, COL_W, h, fill=0, stroke=1)
    c.restoreState()

    ty = top_y - pad - 9
    c.setFillColorRGB(*ACCENT_SKY)
    c.setFont("Baloo2-Bold", 12)
    c.drawString(x + pad, ty, title.upper())
    ty -= item_h
    for date, jtitle, place in items:
        c.setFillColorRGB(*TEXT_FAINT)
        c.setFont("Helvetica", 8)
        c.drawString(x + pad, ty + 16, date)
        c.setFillColorRGB(*WHITE)
        c.setFont("Baloo2-Bold", 10)
        c.drawString(x + pad, ty + 3, jtitle)
        c.setFillColorRGB(*ACCENT_SKY)
        c.setFont("Helvetica", 9)
        c.drawRightString(x + COL_W - pad, ty + 3, place)
        ty -= item_h
    return top_y - h


# ============ COLONNE GAUCHE : Expériences (com) puis Formations ============
ly = y
ly = section_title(LX, ly, "Expériences")

ly = entry(LX, ly, "2024 — Aujourd'hui", "Social Media Manager", "Union Oasis Forest",
           ["Création du site web et de l'espace de travail (Google Workspace), gestion de "
            "Meta Business Suite, stratégie digitale et communication 360, coordination des "
            "prestataires GFX/photo/vidéo."])
ly = entry(LX, ly, "2025 (8 semaines)", "Stage — Assistant de production", "Média En Esprit (Chloé Levy)",
           ["Interview, cadrage, montage, mixage, thumbnails, actualité."])

ly = section_title(LX, ly, "Formations")
ly = entry(LX, ly, "2023 — Aujourd'hui", "Bachelier en Communication",
           "ISFSC (HE ICHEC – ECAM – ISFSC)", [])
ly = entry(LX, ly, "2022 — 2023", "Informatique de gestion",
           "Haute École Léonard de Vinci", [])
ly = entry(LX, ly, "2017 — 2022", "CESS général — option sciences économiques",
           "Athénée Joseph Bracops", [])

# ---- encart jobs étudiants (hors expériences liées à la com) : plus de
# place en bas de cette colonne qu'à droite, une fois les compétences ajoutées
ly -= 6
ly = insert_card(LX, ly, "Jobs étudiants", [
    ("2025 — Aujourd'hui", "Agent d'entretien", "Hôpital Erasme (ISS)"),
    ("2022 — Aujourd'hui", "Hôte d'accueil", "Basic-Fit"),
])

# ============ COLONNE DROITE : Compétences, Soft skills, Projets ============
ry = y
ry = section_title(RX, ry, "Compétences")
ry = skill_group(RX, ry, "Montage vidéo", "Premiere Pro, After Effects, DaVinci Resolve, CapCut")
ry = skill_group(RX, ry, "Design graphique", "Photoshop, InDesign, Illustrator, Lightroom")
ry = skill_group(RX, ry, "Technique", "OBS Studio, Voicemeeter, ATEM, FL Studio")
ry = skill_group(RX, ry, "Outils (Administratif)", "Meta Business Suite, Google Workspace")
ry = skill_group(RX, ry, "IA", "Claude, Gemini, ChatGPT, Vibe coding, Optimisation de tâches")
ry = skill_group(RX, ry, "Langues", "Français (natif), Anglais B1")

ry = section_title(RX, ry, "Soft skills")
c.setFillColorRGB(*TEXT_DIM)
c.setFont("Helvetica", 9.5)
for wrapped in wrap("Créativité · Autonomie · Stratégie RS · Montage",
                     "Helvetica", 9.5, COL_W):
    c.drawString(RX, ry, wrapped)
    ry -= 12.5
ry -= 13

ry = section_title(RX, ry, "Projets mis en avant")
ry = project(RX, ry, "Projet 360° : DEI-Belgique",
             "Campagne de sensibilisation aux VEO pour la DEI-Belgique.",
             ["Vidéo 360°", "Stratégie créative"], "Voir »")
ry = project(RX, ry, "Union Oasis Forest",
             "Stratégie digitale et création de contenu pour un club sportif : "
             "identité visuelle, formats vidéo, community management.",
             ["Stratégie digitale", "Création de contenu"], "Portfolio »")
ry = project(RX, ry, "AdamXBC",
             "Création de contenu et divertissement — Twitch (affilié depuis juillet "
             "2022), TikTok (2026).",
             ["Twitch", "Divertissement"])

c.setFillColorRGB(*ACCENT)
c.setFont("Helvetica-Bold", 9)
voir_plus = "Voir plus →"
c.drawString(RX, ry, voir_plus)
voir_plus_w = c.stringWidth(voir_plus, "Helvetica-Bold", 9)
c.linkURL("https://tristede.github.io/portfolio/adam/projets.html",
          (RX, ry - 2, RX + voir_plus_w, ry + 9), relative=0)
ry -= 13

# ---- pied de page ----
c.setStrokeColorRGB(*LINE)
c.setLineWidth(0.6)
c.line(MARGIN, 40, W - MARGIN, 40)
c.setFillColorRGB(*TEXT_FAINT)
c.setFont("Helvetica", 8.5)
c.drawString(MARGIN, 26, "Portfolio complet, projets détaillés : tristede.github.io/portfolio/adam")
c.drawRightString(W - MARGIN, 26, "Bruxelles, Belgique")

c.save()
print("Écrit :", OUT, "—", os.path.getsize(OUT) // 1024, "Ko")
