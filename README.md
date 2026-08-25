# Portfolio — Adam

Site multi-pages (HTML/CSS/JS, aucune dépendance à installer, aucun build).
Mise en page et glassmorphism inspirés de [bastienokonski.fr](https://bastienokonski.fr/)
(nav flottante en verre, cartes translucides), habillés avec l'identité de ton
Adobe Portfolio : palette bleu nuit, police manuscrite.

## Structure des pages

- **`index.html`** — l'accueil : titre, bio, les 3 boutons, un projet favori
  mis en avant, la sélection "Projets mis en avant" (3 projets), à propos, contact.
  **Les grilles complètes de projets ne sont plus sur cette page.**
- **`projets-perso.html`** — les 8 projets perso, accessible via le bouton
  "Projets perso" de l'accueil (ou le lien "Perso" du header).
- **`projets-academiques.html`** — les 6 projets académiques.
- **`stage.html`** — les 6 réalisations du stage "En Esprit".
- **`style.css`** — tout le design, partagé par les 4 pages.
- **`script.js`** — les données des 20 projets + le rendu des grilles + les icônes,
  partagé par les 4 pages. Chaque page ne fait que déclarer `data-group="perso"`
  (ou `academique`, `stage`, `featured`) sur son conteneur — le script filtre
  automatiquement.

Le header (nav flottante) et le footer (contact) sont dupliqués tels quels dans
chaque page — pas de composants partagés, juste du HTML copié-collé volontairement
pour rester sans build tool.

## Polices — une substitution à connaître

Tu as demandé les polices **"Bad Dog"** (titres) et **"Homemade Apple Pro"** (texte bio).
- **Homemade Apple** est un Google Font libre — utilisée telle quelle pour le bio et
  le texte "à propos".
- **"Bad Dog"** n'est disponible que sur des sites de fonts gratuites tiers (licence
  "usage personnel uniquement", pas de version Google Fonts) — un CDN externe que je
  ne peux pas charger de façon fiable/légale dans le site. J'ai substitué **Schoolbell**
  (Google Fonts), une manuscrite marker au feeling proche, pour les titres. Si tu as le
  fichier `.ttf`/`.otf` de Bad Dog et que sa licence permet l'usage voulu, donne-le-moi
  et je l'intègre en `@font-face` à la place.

## Fond — en attente de ton fichier

Le fond est actuellement un simple dégradé bleu nuit (`.topo-bg` dans `style.css`).
Quand tu me passes ton image de fond (les traits zébrés), je l'intègre directement en
`background-image` sur `.topo-bg` — une seule ligne à changer, dans un seul fichier,
répercutée sur les 4 pages automatiquement.

## À compléter avant mise en ligne

- [ ] **Email de contact** : remplacer `PLACEHOLDER@email.com` (présent dans le header
      de chaque page et dans le footer) — utilise un email perso plutôt que ton adresse
      étudiante ISFSC si possible.
- [ ] **École / formation** : mentionnée nulle part pour l'instant depuis qu'il n'y a
      plus de section Parcours sur l'accueil — dis-moi si tu veux que je la rajoute
      quelque part.
- [ ] **Liens des projets** : les cartes n'ont pas de lien cliquable vers le détail du
      projet (Drive, Behance, YouTube...) — dis-moi si tu veux que j'ajoute ça, projet
      par projet.
- [ ] **Images réelles** : chaque vignette (et le projet favori) est une mire de test
      générée en CSS. Remplace-les par tes vraies images/miniatures (voir plus bas).
- [ ] **CV** : le bouton "CV" pointe vers `cv.pdf` (présent sur les 4 pages) — dépose
      ton CV à jour dans le dossier sous ce nom exact, sinon le bouton mènera à une
      page 404.
- [ ] **Projet favori** : c'est actuellement "Ilonka Club" — change-le dans `index.html`
      si un autre projet te représente mieux.
- [ ] **Projets mis en avant** : la sélection de 3 (Community management: easypermis.be,
      Réalisation d'un épisode de podcast, Reel/TikTok) est marquée par `featured: true`
      dans `script.js` — change les projets si besoin (un seul fichier à éditer, se
      répercute partout).
- [ ] Les 20 descriptions de projets sont des reformulations courtes à partir des
      seuls titres — à réécrire avec de vrais détails (contexte, outils, résultat).

## Ajouter une vraie image à un projet

Dans `script.js`, cherche le tableau `projects` et ajoute une clé `img` à un projet,
par exemple :

```js
{ title: "Ilonka Club", year: 2025, ctx: "perso", medium: "graphisme",
  tags: ["Graphisme","Affiche"], desc: "...",
  img: "images/ilonka-club.jpg" }
```

Dis-le-moi et j'irai plus loin en câblant le rendu des vraies images directement
(upload de fichiers, `<img>` au lieu du fond CSS généré, etc.).

## Déployer le site (gratuit, sans serveur)

Le plus simple, sans rien installer :

1. Va sur [app.netlify.com/drop](https://app.netlify.com/drop)
2. Glisse le dossier `portfolio-adam` entier dans la page (les 6 fichiers doivent
   rester ensemble, dans le même dossier)
3. Netlify te donne une URL en quelques secondes (ex: `adam-karroum.netlify.app`)
4. Tu pourras ensuite brancher ton propre nom de domaine si tu en as un

Alternative : GitHub Pages (si tu as un compte GitHub) ou Vercel — dis-le-moi si tu
veux que je t'accompagne sur l'une de ces options plutôt.

## Prévisualiser en local

Comme le site est maintenant multi-pages avec des fichiers séparés (`style.css`,
`script.js`), l'ouverture directe par double-clic peut ne pas fonctionner selon ton
navigateur (certains bloquent le chargement de fichiers locaux liés). Le plus fiable :
ouvre un terminal dans le dossier `portfolio-adam` et lance :

```bash
python3 -m http.server 8000
```

puis ouvre `http://localhost:8000` dans ton navigateur — tous les liens et pages
fonctionneront normalement.
