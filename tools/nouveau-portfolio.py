#!/usr/bin/env python3
"""Fabrique un portfolio vierge à partir de celui-ci.

    python3 tools/nouveau-portfolio.py ../portfolio-neuf --github pseudo --repo mon-portfolio

Le nom affiché vaut « Name » par défaut, comme sur un gabarit : il se change
depuis le panneau d'édition, sans toucher au code.

Ce qui est copié — le MOTEUR : les pages, script.js, style.css, le panneau
d'édition, les décors (scotch, fond), les outils.
Ce qui ne l'est pas — le CONTENU : les projets, les images, les documents. Le
nouveau data.json est un squelette vide, prêt à être rempli depuis /admin.html.

Rien n'est lu ni modifié dans le dépôt d'origine : la copie est écrite ailleurs.
"""
import argparse
import json
import pathlib
import shutil
import sys

RACINE = pathlib.Path(__file__).resolve().parent.parent

# Le moteur. Tout le reste appartient à la personne qui l'utilise.
PAGES = [
    "index.html", "projet.html", "projets.html", "groupe.html",
    "projets-perso.html", "projets-academiques.html", "admin.html",
    "script.js", "style.css", "ciel.css",
]
OUTILS = ["tools/build_preview.py", "tools/pdfpages.swift", "tools/nouveau-portfolio.py"]
# décors partagés : sans eux le mur n'a plus ni scotch ni fond
DECORS = ["images/tape", "images/bg-hor.webp", "images/bg-vert.webp"]


def squelette(owner):
    """Un portfolio vide mais valide : le site s'affiche, l'admin sait le remplir."""
    return {
        "site": {
            "owner": owner,
            "roleMain": "", "roleAccent": "",
            "bio": "", "aboutParagraphs": ["", ""],
            "contactEmail": "", "linkedin": "", "instagram": "",
            "favoriProjectId": "",
            "timeline": [],
            "sections": [
                {"id": "perso", "page": "perso", "kicker": "01 — Perso",
                 "title": "Projets perso", "desc": ""},
                {"id": "academique", "page": "academique", "kicker": "02 — Académique",
                 "title": "Projets académiques", "desc": ""},
            ],
            "groups": [],
        },
        "projects": [],
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("destination")
    # Neutre par défaut, comme sur un gabarit graphique : la personne remplace
    # « Name » depuis le panneau, sans avoir à toucher un fichier.
    ap.add_argument("--owner", default="Name", help="nom affiché sur le site (défaut : Name)")
    ap.add_argument("--github", required=True, help="compte GitHub propriétaire du dépôt")
    ap.add_argument("--repo", required=True, help="nom du dépôt")
    ap.add_argument("--branch", default="main")
    ap.add_argument("--oauth", default="", help="relais d'authentification (Worker)")
    a = ap.parse_args()

    dest = pathlib.Path(a.destination).expanduser().resolve()
    if dest.exists() and any(dest.iterdir()):
        sys.exit("« %s » existe déjà et n'est pas vide — choisis un dossier neuf." % dest)
    dest.mkdir(parents=True, exist_ok=True)

    for rel in PAGES + OUTILS:
        src = RACINE / rel
        if not src.exists():
            sys.exit("fichier du moteur introuvable : %s" % rel)
        (dest / rel).parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dest / rel)

    for rel in DECORS:
        src = RACINE / rel
        if not src.exists():
            continue
        cible = dest / rel
        if src.is_dir():
            shutil.copytree(src, cible)
        else:
            cible.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, cible)

    (dest / "docs").mkdir(exist_ok=True)
    (dest / "docs" / ".gitkeep").touch()

    (dest / "config.json").write_text(json.dumps({
        "_comment": "Identité de CE portfolio. Ces quatre lignes suffisent : rien d'autre n'est écrit en dur.",
        "owner": a.github, "repo": a.repo, "branch": a.branch,
        "oauthWorker": a.oauth,
    }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    (dest / "data.json").write_text(
        json.dumps(squelette(a.owner), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    (dest / ".gitignore").write_text("_artifact_preview.html\n", encoding="utf-8")

    (dest / "README.md").write_text(
        "# Portfolio de %s\n\n"
        "Site statique + panneau d'édition maison. Aucun serveur : GitHub héberge\n"
        "les fichiers, et le panneau écrit directement dans le dépôt.\n\n"
        "## Mise en route\n\n"
        "1. Créer le dépôt `%s/%s` sur GitHub et y pousser ce dossier.\n"
        "2. Activer GitHub Pages sur la branche `%s`.\n"
        "3. Ouvrir `/admin.html` et se connecter avec GitHub.\n\n"
        "Le relais d'authentification est à renseigner dans `config.json`\n"
        "(champ `oauthWorker`) — sans lui, la connexion au panneau ne marche pas.\n\n"
        "## Aperçu local\n\n"
        "    python3 -m http.server 8000\n"
        % (a.owner, a.github, a.repo, a.branch), encoding="utf-8")

    fichiers = sum(1 for _ in dest.rglob("*") if _.is_file())
    print("Portfolio vierge créé : %s" % dest)
    print("  %d fichiers — moteur, décors et configuration" % fichiers)
    print("  dépôt visé : %s/%s (branche %s)" % (a.github, a.repo, a.branch))
    if not a.oauth:
        print("  ATTENTION : oauthWorker vide — le panneau ne pourra pas se connecter.")


if __name__ == "__main__":
    main()
