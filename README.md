# Portfolio — Adam

Site multi-pages (HTML/CSS/JS, aucune dépendance à installer, aucun build).
Mise en page et glassmorphism inspirés de [bastienokonski.fr](https://bastienokonski.fr/)
(nav flottante en verre, cartes translucides), habillés avec l'identité de ton
Adobe Portfolio : palette bleu nuit, police manuscrite.

**Tout le contenu (textes, projets, projet favori) se modifie depuis
[`/admin.html`](admin.html), sans toucher au code — voir la section
"Éditer le contenu" plus bas.**

## Structure des pages

- **`index.html`** — l'accueil : titre, bio, 2 boutons, un projet favori mis en
  avant, la sélection "Projets mis en avant" (3 projets), à propos, parcours, contact.
  **Les grilles complètes de projets ne sont plus sur cette page.**
- **`projets-perso.html`** — les projets perso, accessible via le bouton
  "Projets perso" de l'accueil.
- **`projets-academiques.html`** — les projets académiques, avec **le stage
  "En Esprit" en sous-section juste en dessous** — pas de page ni de bouton
  séparé pour le stage.
- **`projet.html`** — la page détail d'un projet (`projet.html?id=...`),
  ouverte en cliquant sur n'importe quelle vignette — voir plus bas.
- **`admin.html`** — le panneau d'édition (voir plus bas).
- **`data.json`** — **tout le contenu du site** : textes (bio, à propos, accroche,
  contact, réseaux sociaux), projet favori, et la liste des projets. C'est ce
  fichier que `/admin.html` lit et modifie — tu peux aussi l'éditer à la main si
  tu préfères (c'est du JSON standard).
- **`style.css`** — tout le design, partagé par toutes les pages.
- **`script.js`** — charge `data.json` et se charge de tout le rendu (grilles,
  icônes, projet favori, textes, effet de décryptage), partagé par toutes les
  pages. Chaque page ne fait que déclarer `data-group="perso"` (ou `academique`,
  `stage`, `featured`) sur son conteneur — le script filtre automatiquement.

Le header (nav flottante) et le footer (contact) sont dupliqués tels quels dans
chaque page — pas de composants partagés, juste du HTML copié-collé volontairement
pour rester sans build tool.

## Éditer le contenu (sans coder)

Va sur **`https://tristede.github.io/portfolio/admin.html`** — c'est le panneau
d'édition. Il te permet de :

- modifier les textes (bio, "à propos", l'accroche du haut, l'email de contact,
  les liens LinkedIn/Instagram) ;
- choisir le **projet favori** (celui mis en avant tout en haut de l'accueil) ;
- ajouter, modifier ou supprimer des **projets** (titre, année, catégorie —
  perso / académique / stage —, médium — graphisme, vidéo, audio, **site web**,
  réseaux sociaux, événementiel, écrit —, tags, description, et s'il est "mis
  en avant" sur l'accueil).

Comme le site est hébergé sur GitHub Pages (donc statique, sans serveur), le
panneau enregistre tes modifications directement sur GitHub via un **token
d'accès personnel** — pas ton mot de passe de compte, GitHub ne permet plus
l'accès à son API par mot de passe. La première fois, la page t'explique en
3 étapes comment générer ce token (2 minutes, à faire une seule fois) :

1. [github.com/settings/personal-access-tokens/new](https://github.com/settings/personal-access-tokens/new)
2. *Repository access* → *Only select repositories* → `portfolio`
3. *Permissions* → *Contents* → *Read and write*, puis *Generate token*

Colle le token dans `/admin.html` : il reste uniquement dans ton navigateur
(stockage local), et n'est envoyé qu'à l'API GitHub pour enregistrer tes
changements. Une fois enregistré, le site public se met à jour tout seul en
30 à 60 secondes (le temps que GitHub Pages republie).

Ne colle pas ce token sur un ordinateur public ; tu peux le révoquer à tout
moment depuis GitHub si besoin. **Ce token fonctionne déjà sur autant
d'appareils que tu veux** — colle le même sur ton téléphone, un autre
ordinateur, etc., pas besoin d'en régénérer un par appareil.

### "Se connecter avec GitHub" (bouton OAuth, en option)

Le bouton **"Se connecter avec GitHub"** en haut de `/admin.html` évite de
copier-coller un token — comme sur oasisforest.be avec Sveltia CMS. GitHub
Pages étant 100% statique, ce flow a besoin d'un petit relais externe qui
garde le "client secret" en sécurité (impossible de le faire en JS pur côté
navigateur). Mise en place, une seule fois (~15-20 min) :

1. **Déployer le relais** — [sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth),
   un Cloudflare Worker open-source. Clique son bouton "Deploy to Cloudflare
   Workers" (crée un compte Cloudflare gratuit si besoin), puis récupère
   l'URL du Worker déployé (`https://sveltia-cms-auth.<TON-SOUS-DOMAINE>.workers.dev`).
2. **Créer une OAuth App GitHub** — [github.com/settings/applications/new](https://github.com/settings/applications/new) :
   - *Homepage URL* : `https://tristede.github.io/portfolio/`
   - *Authorization callback URL* : `<URL DU WORKER>/callback`
   - Génère le *Client Secret*.
3. **Configurer le Worker** — dans les *Variables* du Worker sur Cloudflare :
   - `GITHUB_CLIENT_ID` : le Client ID de l'OAuth App
   - `GITHUB_CLIENT_SECRET` : le secret généré (marque-le *encrypted*)
   - `ALLOWED_DOMAINS` : `tristede.github.io`
4. **Donne-moi le Client ID et l'URL du Worker** (jamais le Client Secret —
   celui-là reste uniquement dans les variables du Worker) — je les colle
   dans `admin.html` (constantes `OAUTH_CLIENT_ID` / `OAUTH_WORKER_URL`) et
   le bouton "Se connecter avec GitHub" s'active tout seul.

Note sécurité : contrairement au token manuel (limité au seul repo
`portfolio`), un token obtenu via ce flow OAuth a accès en écriture à
**tous tes repos publics** (portée `public_repo`, la plus restrictive que
GitHub propose pour ce type d'app) — un compromis à connaître, propre au
fonctionnement des OAuth Apps GitHub.

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

- [ ] **Email de contact** : remplacer `PLACEHOLDER@email.com` — modifiable depuis
      `/admin.html` (section "Textes du site") — utilise un email perso plutôt que
      ton adresse étudiante ISFSC si possible.
- [ ] **Liens des projets** : les cartes n'ont pas de lien cliquable vers le détail du
      projet (Drive, Behance, YouTube...) — dis-moi si tu veux que j'ajoute ça, projet
      par projet.
- [ ] **Images réelles** : chaque vignette (et le projet favori) est une mire de test
      générée en CSS. Remplace-les par tes vraies images/miniatures (voir plus bas).
- [ ] **CV** : le bouton "CV" pointe vers `cv.pdf` (présent sur les 4 pages) — dépose
      ton CV à jour dans le dossier sous ce nom exact, sinon le bouton mènera à une
      page 404.
- [ ] **Projet favori** et **projets mis en avant** : modifiables directement depuis
      `/admin.html`, plus besoin de toucher au code.
- [ ] Les descriptions de projets sont des reformulations courtes à partir des
      seuls titres — à réécrire avec de vrais détails (contexte, outils, résultat),
      également depuis `/admin.html`.

## Pages détail de projet (clic sur une vignette)

Chaque vignette (grille de projets, projet favori) mène maintenant à une page
détail dédiée (`projet.html?id=...`), dans l'esprit d'Adobe Portfolio. Tout se
configure depuis `/admin.html`, section "Modifier ce projet" — les champs
au-delà de "Description courte" sont optionnels et n'apparaissent que sur la
page détail :

- **Description longue** — remplace la description courte sur la page détail.
- **Images** — une URL par ligne, affichées en galerie. Dépose tes fichiers
  dans le dossier `images/` du repo et référence-les en relatif
  (`images/ilonka-club-1.jpg`) — l'admin ne gère pas encore l'upload direct de
  fichiers, il faut les ajouter au repo à la main (glisser-déposer sur
  github.com/tristede/portfolio, ou `git add`).
- **Lien vidéo** — colle un lien YouTube ou Vimeo (n'importe quel format
  d'URL), ou un lien direct vers un `.mp4` — la page choisit automatiquement
  le bon type d'intégration.
- **Lien audio** — un lien direct vers un fichier `.mp3`/`.wav` (même logique
  que les images : à déposer dans le repo, par exemple dans `audio/`).
- **Lien externe** — pour un projet "Site web", le bouton "Visiter le site"
  pointe vers cette URL.

Tous les médiums sont supportés (graphisme, vidéo, audio, **site web**,
réseaux sociaux, événementiel, écrit) — la catégorie ne limite pas les champs
disponibles, tu peux par exemple ajouter une vidéo à un projet "graphisme".

## Déployer le site (gratuit, sans serveur)

Le plus simple, sans rien installer :

1. Va sur [app.netlify.com/drop](https://app.netlify.com/drop)
2. Glisse le dossier `portfolio-adam` entier dans la page (les fichiers doivent
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
