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

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "adam", "cv.pdf")

W, H = A4  # 595 x 842 pt

# ---- palette du site (adam/style.css : --bg, --bg-deep, --accent-strong, --accent-sky, --text-dim) ----
BG_DEEP = np.array([16/255, 17/255, 22/255])      # gris anthracite très sombre, légèrement bleuté
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
    """Fond gris anthracite avec halos dégradés dans les coins (haut-droit
    mauve, bas-gauche bleu ciel), comme le halo du hero du site (style.css)."""
    w, h = int(w_pt * scale), int(h_pt * scale)
    yy, xx = np.mgrid[0:h, 0:w]
    arr = np.tile(BG_DEEP, (h, w, 1))

    def add_glow(arr, cx, cy, radius, color, strength):
        d = np.sqrt(((xx - cx) / radius) ** 2 + ((yy - cy) / radius) ** 2)
        factor = (np.clip(1 - d, 0, 1) ** 2 * strength)[..., None]
        return arr * (1 - factor) + np.array(color) * factor

    arr = add_glow(arr, w, 0, w * 0.68, ACCENT, 0.28)
    arr = add_glow(arr, 0, h, w * 0.68, ACCENT_SKY, 0.18)

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
c.setFont("Helvetica-Bold", 27)
c.drawString(LX, y, "Adam Karroum")

c.setFillColorRGB(*ACCENT_SKY)
c.setFont("Helvetica-Bold", 14)
c.drawString(LX, y - 23, "Créateur de contenu — graphisme, vidéo, audio")

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

# ---- pitch (bordure gauche façon citation, comme chez Bastien) ----
y -= 52
pitch = ("Depuis petit, je suis passionné par la création de contenu et l'influence sur le web. "
         "Autodidacte, j'ai développé des compétences en graphisme, montage vidéo et mixage audio.")
lines = wrap(pitch, "Helvetica-Oblique", 11, W - 2 * MARGIN - 16)
block_h = 10 + len(lines) * 15
c.setFillColorRGB(*ACCENT)
c.rect(LX, y - block_h + 11, 2.4, block_h, fill=1, stroke=0)
c.setFont("Helvetica-Oblique", 11)
c.setFillColorRGB(*TEXT_DIM)
ty = y
for line in lines:
    c.drawString(LX + 14, ty, line)
    ty -= 15

y = ty - 30


def section_title(x, y, title):
    c.setFillColorRGB(*ACCENT_SKY)
    c.setFont("Helvetica-Bold", 10.5)
    c.drawString(x, y, title.upper())
    c.setStrokeColorRGB(*LINE)
    c.setLineWidth(0.6)
    c.line(x, y - 7, x + COL_W, y - 7)
    return y - 27


def entry(x, y, date, title, place, desc_lines, gap_after=22):
    c.setFillColorRGB(*TEXT_FAINT)
    c.setFont("Helvetica", 8.5)
    c.drawString(x, y, date)
    y -= 13
    c.setFillColorRGB(*WHITE)
    c.setFont("Helvetica-Bold", 10.5)
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
    c.setFont("Helvetica-Bold", 10.5)
    c.drawString(x, y, title)
    y -= 14.5
    c.setFillColorRGB(*TEXT_DIM)
    c.setFont("Helvetica", 9.5)
    for wrapped in wrap(items, "Helvetica", 9.5, COL_W):
        c.drawString(x, y, wrapped)
        y -= 13
    return y - 18


def project(x, y, title, desc, tags, link_label=None):
    c.setFillColorRGB(*WHITE)
    c.setFont("Helvetica-Bold", 10.5)
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
    return y - 18


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
    c.setFont("Helvetica-Bold", 10.5)
    c.drawString(x + pad, ty, title.upper())
    ty -= item_h
    for date, jtitle, place in items:
        c.setFillColorRGB(*TEXT_FAINT)
        c.setFont("Helvetica", 8)
        c.drawString(x + pad, ty + 16, date)
        c.setFillColorRGB(*WHITE)
        c.setFont("Helvetica-Bold", 10)
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
            "Meta Business Suite, déclaration du statut ASBL, développement de formats vidéo, "
            "direction artistique et management des prestataires GFX/photo/vidéo."])
ly = entry(LX, ly, "2025 (8 semaines)", "Stage — Assistant de production", "Média En Esprit",
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
    ("2025 — Aujourd'hui", "Agent d'entretien", "ISS – Erasme"),
    ("2022 — Aujourd'hui", "Hôte d'accueil", "Basic-Fit"),
])

# ============ COLONNE DROITE : Compétences, Soft skills, Projets ============
ry = y
ry = section_title(RX, ry, "Compétences")
ry = skill_group(RX, ry, "Montage vidéo", "Premiere Pro, After Effects, DaVinci Resolve, CapCut")
ry = skill_group(RX, ry, "Design graphique", "Photoshop, InDesign, Illustrator, Lightroom")
ry = skill_group(RX, ry, "Technique", "OBS Studio, Voicemeeter, ATEM, FL Studio")
ry = skill_group(RX, ry, "IA & outils", "Claude, Gemini, ChatGPT, Vibe coding, Meta Business Suite, Google Workspace")
ry = skill_group(RX, ry, "Langues", "Français (natif), Anglais B1, Néerlandais A1")

ry = section_title(RX, ry, "Soft skills")
c.setFillColorRGB(*TEXT_DIM)
c.setFont("Helvetica", 9.5)
for wrapped in wrap("Créativité · Autonomie · Stratégie RS · Montage",
                     "Helvetica", 9.5, COL_W):
    c.drawString(RX, ry, wrapped)
    ry -= 12.5
ry -= 20

ry = section_title(RX, ry, "Projets")
ry = project(RX, ry, "Projet 360° : DEI-Belgique",
             "Campagne de sensibilisation aux VEO pour la DEI-Belgique.",
             ["Vidéo 360°", "Stratégie créative"], "Voir »")
ry = project(RX, ry, "Production d'un reportage vidéo",
             "Réalisation d'un reportage vidéo de bout en bout.",
             ["Vidéo", "Reportage"], "Portfolio »")
ry = project(RX, ry, "Écriture d'articles de presse",
             "Rédaction d'articles dans un cadre journalistique.",
             ["Rédaction"], "Portfolio »")

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
