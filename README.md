# portfolio (dépôt tristede/portfolio)

Ce dépôt sert la vitrine du produit **Nocturnz**, en HTML/CSS/JS pur (aucune
dépendance, aucun build), via GitHub Pages sur la branche `main`.

## À la racine — la vitrine [Nocturnz](https://nocturnz.xyz/)

Une page produit : Nocturnz fabrique des portfolios que chacun remplit lui-même,
sans abonnement ni code. `index.html` + `nocturnz.css`, plus `ciel.css` (ciel
étoilé animé) et `config.json` (identité du service).

## Le moteur et l'exemple vivant

Le premier portfolio construit avec ce moteur — celui d'Adam — a son propre
dépôt depuis septembre 2026, sur [`adam.nocturnz.xyz`](https://adam.nocturnz.xyz/)
([`tristede/adam`](https://github.com/tristede/adam)). C'est là que vivent le
code du moteur à jour, son modèle de données et sa documentation — ce dépôt-ci
n'en garde qu'une copie figée dans `/tools` pour fabriquer de nouveaux
portfolios.

## `/demo` — bac à sable

Un admin + un portfolio-jouet entièrement autonomes : tout s'y modifie, rien
n'est publié (voir `demo/admin.html`).

## `/tools` — fabriquer un nouveau portfolio

```
python3 tools/nouveau-portfolio.py ../portfolio-neuf --github pseudo --repo mon-portfolio
```

Copie le moteur depuis un clone local de `tristede/adam` (les pages,
`script.js`, `style.css`, `admin.html`, `ciel.css`, les décors) sans le
contenu : le nouveau `data.json` est un squelette vide, prêt à être rempli
depuis `/admin.html`. Check-list complète (domaine, Worker OAuth, transfert
du dépôt au client) dans [`CONTEXTE.md`](CONTEXTE.md).
