# Contexte du projet — à lire en début de session

Ce dépôt sert **uniquement la vitrine du produit Nocturnz** (page marketing +
formulaire de contact). Le portfolio personnel d'Adam, qui servait longtemps
d'exemple vivant dans `/adam`, a été extrait dans son propre dépôt en
septembre 2026 pour avoir son propre domaine — voir plus bas.

**Le moteur du produit (le vrai code : pages, `script.js`, `style.css`,
`admin.html`, modèle de données, comportements, pièges connus) vit maintenant
dans [`tristede/adam`](https://github.com/tristede/adam), documenté dans son
propre `README.md`.** Ce dépôt-ci n'en garde qu'une copie figée dans
`tools/` (voir "Onboarder un nouveau client" plus bas) pour fabriquer de
nouveaux portfolios — il ne le maintient pas.

## Coordonnées techniques

| | |
|---|---|
| Dossier local | `.../PROJETS/WEB/portfolio-adam` |
| Dépôt | `github.com/tristede/portfolio` — branche `main` |
| Vitrine Nocturnz | https://nocturnz.xyz/ |
| Portfolio d'Adam (dépôt séparé, `tristede/adam`) | https://adam.nocturnz.xyz/ |
| Bac à sable (démo Nocturnz) | `/demo/admin.html` |
| Serveur local | `python3 -m http.server 8000` dans le dossier du projet |

**Connexion OAuth de l'admin** (partagée par tous les portfolios générés,
déjà configurée, ne pas y toucher sans raison) :
- Relais : Cloudflare Worker [sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth)
  à `https://portfolioadamxbc.tristederk.workers.dev`
- OAuth App GitHub, Client ID `Ov23liDVjc8AUievRU7X`
- Variables du Worker : `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` (chiffré),
  `ALLOWED_DOMAINS` — **doit lister chaque domaine qui a un `/admin.html`**
  (au minimum `tristede.github.io` et `adam.nocturnz.xyz` ; un domaine oublié
  = connexion impossible sur le portfolio concerné).
- Le Client Secret n'est **que** dans le Worker. Ne jamais le demander.

## Structure

```
index.html                 vitrine Nocturnz (page produit, formulaire de contact)
nocturnz.css               design de la vitrine
ciel.css                   ciel étoilé animé
demo/                      bac à sable : admin + portfolio-jouet autonomes, rien n'est publié
tools/nouveau-portfolio.py fabrique un nouveau portfolio vierge (copie le moteur depuis tristede/adam)
tools/build_preview.py     génère _artifact_preview.html dans un portfolio déjà scaffoldé
tools/pdfpages.swift       convertit un PDF en images, hors navigateur — copié dans chaque nouveau portfolio
```

Header et footer sont copiés-collés dans chaque page (choix assumé : pas de build).

Un portfolio créé par `tools/nouveau-portfolio.py` vit seul à la racine de son
propre dépôt (`basePath` vide) — plus de cas particulier à gérer depuis que
celui d'Adam a aussi son propre dépôt.

## Onboarder un nouveau client

Pas de client payant pour l'instant (produit pas encore lancé) — cette
procédure sert surtout à vérifier que le chemin marche, et à le suivre le
jour où quelqu'un dit oui.

1. **Cloner le moteur à jour** s'il ne l'est pas déjà : `tristede/adam` doit
   être cloné juste à côté de ce dépôt (`.../PROJETS/WEB/adam-standalone`
   localement), `tools/nouveau-portfolio.py` va le lire par défaut (`--source`
   pour pointer ailleurs).
2. **Générer le portfolio vierge** :
   ```
   python3 tools/nouveau-portfolio.py ../portfolio-<client> \
     --owner "Nom du client" --github <compte-github-du-client> \
     --repo <nom-du-repo> --oauth https://portfolioadamxbc.tristederk.workers.dev
   ```
3. **Créer le dépôt GitHub** (`<compte-github-du-client>/<nom-du-repo>`) et y
   pousser le dossier généré.
4. **Activer GitHub Pages** (branche `main`, racine) dans les settings du
   nouveau dépôt.
5. **Ajouter le domaine au Worker** : dashboard Cloudflare → Worker
   `portfolioadamxbc` → variables → ajouter le nouveau domaine (sous-domaine
   GitHub Pages ou domaine personnalisé) à `ALLOWED_DOMAINS`. Sans cette
   étape, `/admin.html` du client refuse la connexion GitHub.
6. **Domaine personnalisé** (optionnel) : DNS chez le registrar du client
   (CNAME vers `<compte>.github.io`) + champ "Custom domain" dans GitHub
   Pages. Vérifier `Enforce HTTPS` une fois le certificat émis (peut prendre
   du temps — si ça bloque, retirer/remettre le domaine force GitHub à
   relancer le check, voir l'historique de ce repo pour un exemple).
7. **Vérifier avant de rendre la main** : le site charge, `/admin.html` se
   connecte en OAuth et sauvegarde un test, les favicons `favicon.svg/.ico`
   ne sont **pas** ceux d'Adam (le script ne les copie pas — à fournir par le
   client ou à retirer des `<link>` dans le `<head>` de chaque page).
8. **Une fois le contenu rempli et validé par le client** : transférer la
   propriété du dépôt vers son propre compte GitHub (Settings → General →
   Danger Zone → Transfer) plutôt que le laisser en simple collaborateur sur
   un dépôt que tu possèdes — ça correspond à l'argument de vente de la
   vitrine ("le contenu est à vous") et ça évite de rester responsable à vie
   de dépôts appartenant à d'autres.

## Pièges connus (vitrine)

- **Cache** : GitHub Pages sert tout avec `max-age=600` — un changement
  invisible est presque toujours du cache (`Cmd+Shift+R`).
- Pour les pièges spécifiques au moteur (panneau d'édition, rendu PDF,
  effet de décryptage, etc.), voir le `README.md` de `tristede/adam`.

## Règles posées par Adam

- Ne **jamais** extraire de secret du trousseau macOS ni d'ailleurs. L'auth
  git passe par le gestionnaire d'identifiants déjà configuré.
- Déployer automatiquement après chaque changement validé.

## Reste à faire

- [ ] Produit pas encore lancé publiquement — aucun client réel à ce jour.
- [ ] Filigrane automatique sur les images à l'envoi : proposé côté moteur,
      jamais tranché.
