# Contexte du projet — à lire en début de session

Portfolio personnel d'Adam (étudiant en communication, Bruxelles). Remplace son
ancien Adobe Portfolio. Site statique + panneau d'édition maison.

## Coordonnées techniques

| | |
|---|---|
| Dossier local | `/Users/adam/Documents/workspace/portfolio-adam` |
| Dépôt | `github.com/tristede/portfolio` — branche `main` |
| Site en ligne | https://tristede.github.io/portfolio/ |
| Panneau d'édition | https://tristede.github.io/portfolio/admin.html |
| Aperçu Artifact | https://claude.ai/code/artifact/5f753f39-a2b1-4ff5-a5d7-87bedd5b4543 |
| Sauvegarde propre | tag git `backup-clean-v1` |
| Serveur local | `python3 -m http.server 8000` dans le dossier du projet |

**Connexion OAuth de l'admin** (déjà configurée, ne pas y toucher sans raison) :
- Relais : Cloudflare Worker [sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth)
  à `https://portfolioadamxbc.tristederk.workers.dev`
- OAuth App GitHub, Client ID `Ov23liDVjc8AUievRU7X`
- Variables du Worker : `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` (chiffré),
  `ALLOWED_DOMAINS=tristede.github.io`
- Le Client Secret n'est **que** dans le Worker. Ne jamais le demander.

## Structure

```
index.html                 accueil (hero, favori, mis en avant, à propos, parcours, contact)
projets-perso.html         grille perso
projets-academiques.html   grille académique + section stage
projet.html?id=...         page détail d'un projet
admin.html                 panneau d'édition (vue visuelle + vue liste)
data.json                  TOUT le contenu du site
script.js                  rendu partagé par toutes les pages publiques
style.css                  design partagé
images/                    visuels (WebP) + images/tape/ (4 rubans de masking tape)
docs/                      PDF envoyés depuis l'admin
_artifact_preview.html     généré, gitignoré — sert uniquement à publier l'Artifact
tools/build_preview.py     génère le fichier ci-dessus
tools/pdfpages.swift       convertit un PDF en images, hors navigateur
```

Header et footer sont copiés-collés dans chaque page (choix assumé : pas de build).

## Modèle de données (`data.json`)

```jsonc
{
  "site": {
    "roleMain": "...", "roleAccent": "...",
    "bio": "ligne 1\nligne 2",              // \n = saut de ligne affiché
    "aboutParagraphs": ["...", "..."],
    "contactEmail": "...", "linkedin": "...", "instagram": "...",
    "favoriProjectId": "id-du-projet",
    "timeline": [{ "year": "2025", "title": "...", "desc": "...", "current": false }]
  },
  "projects": [{
    "id": "slug-unique", "title": "...", "year": 2025,
    "ctx": "perso" | "academique" | "stage",
    "medium": "graphisme|video|audio|web|social|event|ecrit",
    "tags": [], "desc": "...", "longDesc": "...",
    "featured": false,        // section « Projets mis en avant » de l'accueil
    "hidden": false,          // retiré du site, conservé dans l'admin
    "thumb": "images/x.webp", // miniature ; sinon 1re image visible
    "link": "https://...",    // bouton + aperçu intégré du site
    "assets": [ /* voir ci-dessous */ ],
    "subProjects": [{ "title": "...", "medium": "", "desc": "", "assets": [], "link": "" }]
  }]
}
```

**Assets** — modèle unifié, utilisé pour les projets et les sections :

```jsonc
{
  "type": "image" | "video" | "audio" | "web" | "doc",
  "url": "images/x.webp",
  "hidden": false,
  "size": "sm" | "md" | "lg",   // md par défaut
  "pages": ["images/p1.webp"]   // uniquement pour les PDF convertis
}
```

⚠️ **Rétrocompatibilité** : d'anciens projets peuvent encore avoir
`images[]` / `videoUrl` / `audioUrl` au lieu de `assets[]`. La fonction
`assetsOf()` (présente dans `script.js` *et* `admin.html`) fusionne les deux
formes — ne pas supprimer ce repli.

Vocabulaire : `subProjects` s'appelle **« sections »** dans l'interface.

## Comportements notables

- **Effet de décryptage** sur la bio et les paragraphes « à propos » : la police
  manuscrite se transforme en police lisible. Au survol sur desktop, **au
  défilement sur mobile** (pas de survol tactile). ~800 ms, réglé par
  `perCharDelay = 16 / length` dans `script.js`.
- **Photos scotchées** : images et vidéos affichées comme des tirages collés au
  mur (masking tape en `::before`, légère rotation, ombre). Taille **fixe**
  (200/300/460 px selon S/M/L) — elles ne s'étirent jamais pour remplir.
  La galerie sort de la colonne de texte (`margin-left: calc(50% - 50vw + var(--sbw)/2)`).
- **Ne jamais utiliser `columns` CSS pour la galerie** : ça crée un contexte de
  fragmentation qui rogne le scotch sur Safari et casse l'affichage sur Firefox.
  C'est un bug déjà rencontré et corrigé.
- **Visionneuse plein écran** au clic sur une image (flèches, `Échap`).
  Clic droit et glisser désactivés — dissuasion, **pas** une protection réelle.
- **PDF** : convertis en images page par page à l'envoi (pdf.js chargé
  uniquement dans l'admin), affichés dans un lecteur maison paginé. Raison :
  chaque navigateur impose sa propre barre d'outils PDF, impossible à styler —
  et son fond gris entoure la page sans qu'aucune règle CSS ne puisse l'atteindre.
  Un bouton « PDF » permet de convertir les documents envoyés avant cette
  fonctionnalité.
  Le lecteur est **borderless** : ni bordure, ni fond, ni marge intérieure — la
  page repose directement sur le fond du site, contrôles centrés dessous.
  Un document qui affiche encore un cadre gris n'est donc **pas** converti :
  vérifier que son asset a bien un tableau `pages`.
  Le lecteur porte un ruban de masking tape, comme les photos : il se cale sur
  le haut du lecteur, et `.doc-stage` aligne son image en `flex-start` pour que
  le haut de la page coïncide toujours avec lui.
  Les pages s'ouvrent en plein écran comme les photos (clic sur la page ou
  bouton dédié), et la pagination faite dans la visionneuse est reportée dans
  le lecteur. **Aucun lien ne sort du portfolio** : Adam ne veut pas que le
  visiteur quitte le site, donc le PDF d'origine n'est plus proposé au
  téléchargement — le fichier reste dans `docs/` mais n'est plus atteignable
  depuis les pages.
- **Fond** : texture topographique (`images/bg-hor.webp` / `bg-vert.webp` selon
  l'orientation) à 55 % par-dessus le dégradé. **Pas de parallax** — testé puis
  retiré, ça donnait mal à la tête.
- **Aucun emoji** dans l'interface : tout est en SVG (`ICON` dans `admin.html`,
  `UI_ICON` dans `script.js`). Adam y tient.

## Panneau d'édition

Deux vues, **la vue visuelle est celle par défaut** :

- **Vue visuelle** — le vrai site dans un iframe, alimenté par l'état non
  enregistré via `window.__SITE_DATA__`. Les contrôles sont injectés depuis
  `admin.html` : rien de spécifique à l'édition n'existe dans le code public.
  Textes éditables au clic, boutons au survol (taille S/M/L, masquer, miniature,
  supprimer, réordonner), boutons « + » en bas de chaque projet et section.
- **Vue liste** — formulaires classiques, filtres et recherche.

Envois d'images/PDF : conversion WebP côté navigateur, puis **un seul commit**
via l'API Git Data (blobs en parallèle par 4). Reprise automatique si la branche
a bougé entre-temps (erreur 422 « not a fast forward »).

## Méthode de travail attendue

1. **Toujours tester en local avant de déployer** (`python3 -m http.server 8000`).
2. Vérifier via `javascript_tool` (DOM, styles calculés) plutôt que par capture
   d'écran : **l'outil de screenshot est peu fiable ici** (images noires,
   figées, ou onglet à taille nulle). Redimensionner le viewport quand
   `innerWidth` vaut 0.
3. Régénérer `_artifact_preview.html` avec `python3 tools/build_preview.py`
   (inline CSS/JS/données dans `index.html`), publier l'Artifact, puis
   `git add/commit/push`. L'aperçu ne couvre que l'accueil et ses images ne se
   chargent pas (requêtes externes bloquées) : inutile d'y chercher une page
   projet.
4. `git pull --rebase` avant de pousser : **Adam édite en parallèle depuis
   l'admin**, qui commite directement sur `main`. Ne jamais écraser ses commits.
5. Confirmer le déploiement (Monitor + `curl` sur un marqueur du fichier).

## Pièges connus

- **Cache** : GitHub Pages sert tout avec `max-age=600`. Un changement
  invisible côté Adam est presque toujours du cache → `Cmd+Shift+R`.
  `data.json` est l'exception : il est chargé en `fetch(..., { cache: 'no-cache' })`
  pour être revalidé à chaque visite, sinon un contenu enregistré depuis l'admin
  peut rester invisible jusqu'à 10 minutes. Firefox et ses dérivés (Zen) sont les
  plus tenaces là-dessus ; le symptôme typique est un navigateur qui montre
  l'ancienne version quand un autre montre déjà la nouvelle.
- **`prefers-reduced-motion`** dans le navigateur de test reflète le réglage
  macOS réel d'Adam. Des animations « invisibles » ont déjà été causées par ça.
- **`confirm()` avant `input.click()`** empêche l'ouverture du sélecteur de
  fichiers (la modale consomme l'activation utilisateur). Déjà corrigé, ne pas
  réintroduire.
- **Filet clair d'1 px** en haut d'une page de PDF rastérisée : le convertisseur
  remplit le bitmap en blanc avant de dessiner la page, et un arrondi d'un
  demi-pixel laisse ce fond affleurer sur une rangée — invisible sur une page
  blanche, très visible sur un fond sombre. `tools/pdfpages.swift` déborde donc
  le dessin d'1 px sur les quatre bords. Se vérifie en mesurant, pas à l'œil :
  dessiner l'image dans un `<canvas>` et comparer la moyenne de la rangée 0 à
  celle de la rangée 1.
- **`</script>` littéral** dans une chaîne JS coupe le bloc `<script>` de
  `admin.html` : toujours écrire `<\/script>`.
- **Interception des liens** dans l'iframe de l'éditeur : ignorer les clics sur
  `.ed-btn`, `.ed-add` et `[contenteditable]`, sinon les boutons et l'édition de
  texte déclenchent une navigation.

## Règles posées par Adam

- Ne **jamais** extraire de secret du trousseau macOS ni d'ailleurs. L'auth git
  passe par le gestionnaire d'identifiants déjà configuré.
- Ne pas afficher son nom de famille sur le site : uniquement « Adam ».
- Pas d'emoji dans l'interface.
- Déployer automatiquement après chaque changement validé.

## Reste à faire

- [ ] `contactEmail` est encore `PLACEHOLDER@email.com` (dans `data.json`).
- [ ] `cv.pdf` absent à la racine → le bouton CV mène à une 404.
- [ ] Descriptions des projets à réécrire (ce sont des reformulations de titres).
- [ ] Filigrane automatique sur les images à l'envoi : proposé, jamais tranché.
- [ ] Domaine personnalisé : si Adam en prend un, mettre à jour
      `ALLOWED_DOMAINS` sur le Worker Cloudflare.
