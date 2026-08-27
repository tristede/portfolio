#!/usr/bin/env python3
"""Génère _artifact_preview.html : l'accueil, en un seul fichier autonome.

L'Artifact est servi sous une politique de sécurité qui bloque les requêtes
externes, et il ne reçoit qu'un fichier. On replie donc style.css, script.js et
data.json dans index.html. Les chemins d'images restent relatifs : ils ne se
chargeront pas dans l'Artifact, qui ne sert qu'à relire la mise en page.

    python3 tools/build_preview.py

Le fichier produit est gitignoré.
"""
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
LINK = '<link rel="stylesheet" href="style.css">'
SCRIPT = '<script src="script.js"></script>'


def read(name):
    return (ROOT / name).read_text(encoding="utf-8")


def main():
    html = read("index.html")
    css = read("style.css")
    js = read("script.js")
    data = json.loads(read("data.json"))

    # `</script>` ou `</style>` littéral couperait le bloc qui l'englobe.
    for needle, where in (("</script", "script.js"), ("</style", "style.css")):
        haystack = js if where == "script.js" else css
        if needle in haystack:
            sys.exit("%s contient un %s> littéral : échapper en <\\/ avant d'inliner" % (where, needle))

    for marker, name in ((LINK, "le lien vers style.css"), (SCRIPT, "la balise script.js")):
        if html.count(marker) != 1:
            sys.exit("index.html : %s est introuvable ou en double" % name)

    # json.dumps échappe déjà `<` ? Non — on le fait à la main pour la même raison.
    blob = json.dumps(data, ensure_ascii=False).replace("</", "<\\/")

    html = html.replace(LINK, "<style>\n%s\n</style>" % css)
    html = html.replace(
        SCRIPT,
        "<script>window.__SITE_DATA__ = %s;</script>\n<script>\n%s\n</script>" % (blob, js),
    )

    out = ROOT / "_artifact_preview.html"
    out.write_text(html, encoding="utf-8")
    print("%s — %.0f Ko" % (out.name, out.stat().st_size / 1024))


if __name__ == "__main__":
    main()
