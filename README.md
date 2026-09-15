# portfolio (dépôt tristede/portfolio)

Ce dépôt sert deux sites, tous deux en HTML/CSS/JS pur (aucune dépendance,
aucun build), via GitHub Pages sur la branche `main`.

## À la racine — la vitrine [Starx](https://tristede.github.io/portfolio/)

Une page produit : Starx fabrique des portfolios que chacun remplit lui-même,
sans abonnement ni code. `index.html` + `starx.css`, plus `ciel.css` (ciel
étoilé animé, partagé avec `/adam`) et `config.json` (identité du service).

## `/adam` — [le portfolio d'Adam](https://tristede.github.io/portfolio/adam/)

Le premier portfolio construit avec ce moteur, et celui qui a servi de modèle
pour en faire un produit générique. Voir [`adam/README.md`](adam/README.md)
pour le détail des pages et l'édition du contenu.

## `/demo` — bac à sable

Un admin + un portfolio-jouet entièrement autonomes : tout s'y modifie, rien
n'est publié (voir `demo/admin.html`).

## `/tools` — fabriquer un nouveau portfolio

```
python3 tools/nouveau-portfolio.py ../portfolio-neuf --github pseudo --repo mon-portfolio
```

Copie le moteur (les pages, `script.js`, `style.css`, `admin.html`, `ciel.css`,
les décors) sans le contenu : le nouveau `data.json` est un squelette vide,
prêt à être rempli depuis `/admin.html`. Voir le contexte complet dans
[`CONTEXTE.md`](CONTEXTE.md).
