(function(){
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  var reduceMotionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };

  // full-bleed blocks use 100vw, which counts the scrollbar the page content
  // doesn't get — publish the difference so CSS can subtract it
  function setScrollbarVar(){
    var sbw = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.setProperty('--sbw', (sbw > 0 ? sbw : 0) + 'px');
  }
  setScrollbarVar();
  window.addEventListener('resize', setScrollbarVar, { passive: true });
  // a scrollbar can also appear later, once images make the page taller
  if (window.ResizeObserver){
    new ResizeObserver(setScrollbarVar).observe(document.documentElement);
  }

  // small UI marks (never emoji — they'd clash with the site's typography)
  var UI_ICON = {
    star: '<svg class="ui-ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
    arrowRight: '<svg class="ui-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>',
    arrowLeft: '<svg class="ui-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12H5M11 6l-6 6 6 6"/></svg>',
    external: '<svg class="ui-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 16L18 6M9.5 6H18v8.5"/></svg>',
    expand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5"/></svg>',
    heart: '<svg class="ui-ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 20s-7-4.4-7-9.2A4 4 0 0 1 12 8a4 4 0 0 1 7 2.8C19 15.6 12 20 12 20z"/></svg>'
  };

  // le projet favori, pour que sa carte le signale comme le fait « Mis en avant »
  var favoriId = null;

  var icons = {
    video: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2.5" y="6" width="14" height="12" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M16.5 10.2l5-2.7v9l-5-2.7" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    audio: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 12h2l2.5-6 3 12 2.5-9 2 6H21" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    graphisme: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.6"/><circle cx="8.5" cy="9" r="1.6" stroke="currentColor" stroke-width="1.6"/><path d="M3 16l5-5 4 4 3-3 6 6" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    social: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="6" cy="12" r="2.4" stroke="currentColor" stroke-width="1.6"/><circle cx="18" cy="6" r="2.4" stroke="currentColor" stroke-width="1.6"/><circle cx="18" cy="18" r="2.4" stroke="currentColor" stroke-width="1.6"/><path d="M8.1 10.8L15.9 7.2M8.1 13.2l7.8 3.6" stroke="currentColor" stroke-width="1.6"/></svg>',
    event: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4.5" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M3 9.5h18M8 3v3M16 3v3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    ecrit: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 20l1-4L16 5l3 3-11 11-4 1z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    web: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.8 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.8-3.8-9s1.3-6.4 3.8-9z" stroke="currentColor" stroke-width="1.6"/></svg>'
  };
  var mediumLabel = {
    video: 'Vidéo', audio: 'Audio', graphisme: 'Graphisme',
    social: 'Réseaux sociaux', event: 'Événementiel', ecrit: 'Écrit', web: 'Site web'
  };

  function linkForProject(p){
    if (p.ctx === 'perso') return 'projets-perso.html';
    if (p.ctx === 'stage') return 'projets-academiques.html#stage';
    return 'projets-academiques.html';
  }

  // the thumbnail image: an explicitly chosen one wins, otherwise the first
  // image of the project, otherwise nothing (the generated CSS pattern shows).
  // Assets are the unified model (images / videos / audio, each hideable).
  // Older entries stored images[]/videoUrl/audioUrl separately, so those are
  // folded in here — both shapes keep working, in the site and in /admin.html.
  function assetsOf(obj){
    if (Array.isArray(obj.assets)) return obj.assets;
    var out = [];
    (obj.images || []).forEach(function(u){ out.push({ type: 'image', url: u }); });
    if (obj.videoUrl) out.push({ type: 'video', url: obj.videoUrl });
    if (obj.audioUrl) out.push({ type: 'audio', url: obj.audioUrl });
    return out;
  }
  // in the admin's visual editor everything is rendered — hidden entries
  // included, flagged so the editor can grey them out and offer to unhide.
  function visibleAssets(obj){
    // un carrousel porte `urls` et non `url` : ne garder que ce qui a une `url`
    // le faisait disparaître entièrement
    var all = assetsOf(obj).filter(function(a){
      // un texte n'a ni `url` ni `urls` : ne garder que ce qui pointe vers un
      // fichier le ferait disparaitre, comme c'etait arrive au carrousel
      return a && (a.url || (a.urls && a.urls.length) || a.type === 'text');
    });
    return window.__EDIT_MODE__ ? all : all.filter(function(a){ return !a.hidden; });
  }

  function thumbSrc(p){
    if (p.thumb) return p.thumb;
    var firstImg = visibleAssets(p).filter(function(a){ return a.type === 'image'; })[0];
    return firstImg ? firstImg.url : '';
  }

  function cardHTML(p, i){
    var thumb = thumbSrc(p);
    return (
      '<a class="card" href="projet.html?id=' + encodeURIComponent(p.id) + '" data-project-id="' + p.id + '"' +
        (p.hidden ? ' data-project-hidden="1"' : '') +
        ' style="transition-delay:' + ((i % 8) * 40) + 'ms">' +
        '<div class="thumb' + (thumb ? ' has-img' : '') + '">' +
          (thumb ? '<img class="thumb-img" src="' + thumb + '" alt="' + p.title + '" loading="lazy">' : '') +
          '<span class="year">' + p.year + '</span>' +
          (thumb ? '' : '<span class="icon">' + (icons[p.medium] || '') + '</span>') +
          '<span class="medium-label">' + (mediumLabel[p.medium] || p.medium) + '</span>' +
        '</div>' +
        '<div class="card-body">' +
          (p.id === favoriId
            ? '<span class="card-featured-label is-favori">' + UI_ICON.heart + ' Projet favori</span>'
            : (p.featured ? '<span class="card-featured-label">' + UI_ICON.star + ' Mis en avant</span>' : '')) +
          '<h3>' + p.title + '</h3>' +
          '<p class="desc">' + p.desc + '</p>' +
          '<div class="card-tags">' + p.tags.map(function(t){ return '<span class="tag">#' + t.replace(/\s+/g,'') + '</span>'; }).join('') + '</div>' +
        '</div>' +
      '</a>'
    );
  }

  function applySiteTexts(site){
    var roleMain = document.getElementById('js-role-main');
    var roleAccent = document.getElementById('js-role-accent');
    if (roleMain && site.roleMain) roleMain.textContent = site.roleMain;
    if (roleAccent && site.roleAccent) roleAccent.textContent = site.roleAccent;

    var bioEl = document.getElementById('js-bio');
    if (bioEl && site.bio) bioEl.innerHTML = site.bio.split('\n').join('<br>');

    document.querySelectorAll('[data-about-index]').forEach(function(el){
      var idx = +el.getAttribute('data-about-index');
      if (site.aboutParagraphs && site.aboutParagraphs[idx] != null){
        el.innerHTML = site.aboutParagraphs[idx].split('\n').join('<br>');
      }
    });

    document.querySelectorAll('.js-contact-email-link').forEach(function(a){
      if (!site.contactEmail) return;
      a.href = 'mailto:' + site.contactEmail;
      if (a.classList.contains('contact-email')) a.textContent = site.contactEmail;
    });
    document.querySelectorAll('.js-linkedin-link').forEach(function(a){ if (site.linkedin) a.href = site.linkedin; });
    document.querySelectorAll('.js-instagram-link').forEach(function(a){ if (site.instagram) a.href = site.instagram; });
  }

  function applyFavori(site, projects){
    var container = document.getElementById('js-favori');
    if (!container) return;
    var shown = projects.filter(function(x){ return !x.hidden; });
    var p = shown.filter(function(x){ return x.id === site.favoriProjectId; })[0] || shown[0];
    if (!p){ container.closest('.projects-section').style.display = 'none'; return; }
    var thumb = thumbSrc(p);
    // the whole card is the link — the pill inside is only a visual cue, so it
    // stays a <span> (an <a> inside an <a> is invalid and breaks the click)
    container.setAttribute('href', 'projet.html?id=' + encodeURIComponent(p.id));
    container.setAttribute('data-project-id', p.id);
    container.innerHTML =
      '<div class="thumb' + (thumb ? ' has-img' : '') + '">' +
        (thumb ? '<img class="thumb-img" src="' + thumb + '" alt="' + p.title + '" loading="lazy">' : '') +
        '<span class="year">' + p.year + '</span>' +
        (thumb ? '' : '<span class="icon">' + (icons[p.medium] || '') + '</span>') +
      '</div>' +
      '<div class="body">' +
        '<span class="kicker" style="color:var(--text-faint);font-size:13px;font-weight:600;letter-spacing:0.04em;">Projet favori</span>' +
        '<h2>' + p.title + '</h2>' +
        '<p class="desc">' + p.desc + '</p>' +
        '<div class="card-tags">' + p.tags.map(function(t){ return '<span class="tag">#' + t.replace(/\s+/g,'') + '</span>'; }).join('') + '</div>' +
        '<span class="pill-btn" style="width:fit-content;">Voir le projet ' + UI_ICON.arrowRight + '</span>' +
      '</div>';
  }

  function renderTimeline(items){
    var container = document.getElementById('js-timeline');
    if (!container || !items) return;
    container.innerHTML = items.map(function(t){
      return '<div class="timeline-item' + (t.current ? ' current' : '') + '">' +
        '<span class="timeline-year">' + t.year + '</span>' +
        '<div class="timeline-content">' +
          '<h3>' + t.title + '</h3>' +
          '<p>' + t.desc + '</p>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  var BACK_LABEL = { perso: 'Retour — Projets perso', academique: 'Retour — Projets académiques', stage: 'Retour — Stage' };

  // parses a YouTube/Vimeo URL into an embeddable iframe; anything else
  // (direct .mp4/.webm link) falls back to a plain <video> tag.
  function videoEmbedHTML(url){
    var yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/);
    if (yt){
      return '<iframe src="https://www.youtube.com/embed/' + yt[1] + '" title="Vidéo du projet" ' +
        'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>';
    }
    var vimeo = url.match(/vimeo\.com\/(\d+)/);
    if (vimeo){
      return '<iframe src="https://player.vimeo.com/video/' + vimeo[1] + '" title="Vidéo du projet" ' +
        'allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe>';
    }
    return '<video controls src="' + url + '"></video>';
  }

  // SoundCloud links get the official embeddable player; anything else
  // (direct .mp3/.wav link) falls back to a plain <audio> tag.
  function audioEmbedHTML(url){
    if (/soundcloud\.com\//.test(url)){
      return '<iframe scrolling="no" frameborder="no" allow="autoplay" loading="lazy" ' +
        'src="https://w.soundcloud.com/player/?url=' + encodeURIComponent(url) + '&color=%237fc4ff&auto_play=false&show_user=true"></iframe>';
    }
    return '<audio controls src="' + url + '"></audio>';
  }

  // shared by the main project and each of its sub-projects: gallery of
  // images, then video embed, then audio embed — whichever are present.
  function mediaBlocksHTML(obj){
    var all = assetsOf(obj);
    var list = visibleAssets(obj);
    // the index within the *full* list is what the editor needs to act on
    function attrs(a){
      var i = all.indexOf(a);
      // `pos` : position choisie a la main, en pixels de composition (REF_WIDTH).
      // Absente, le contenu se range tout seul dans la place restante.
      var p = a.pos;
      var pinned = (p && isFinite(p.x) && isFinite(p.y) && isFinite(p.w))
        ? ' data-pos="' + p.x + ',' + p.y + ',' + p.w + '"' : '';
      return ' data-asset-index="' + i + '"' + pinned + (a.hidden ? ' data-asset-hidden="1"' : '');
    }
    // three preset widths per asset; medium is the default
    function sizeClass(a){ return ' size-' + (a.size || 'md'); }
    // Légende facultative sous un contenu. Sur le site, elle n'existe que si
    // elle a quelque chose à dire ; dans l'éditeur, elle est toujours là, même
    // vide, parce que c'est elle qu'on clique pour l'écrire.
    function captionHTML(a, tag){
      var text = (a.caption || '').trim();
      if (!text && !window.__EDIT_MODE__) return '';
      tag = tag || 'p';
      return '<' + tag + ' class="asset-caption' + (text ? '' : ' is-empty') + '" data-asset-caption>' +
        text + '</' + tag + '>';
    }
    var photoN = 0;   // fait varier scotch et inclinaison d'une tuile à l'autre

    // Un seul mur, une seule règle : quel que soit son type, un contenu est une
    // tuile dont la LARGEUR vient de sa taille S/M/L. Les tuiles se rangent
    // côte à côte et passent à la ligne quand la place manque. Auparavant seules
    // les photos suivaient cette règle ; tout le reste s'empilait en colonne,
    // et S/M/L n'avait aucun effet sur un document en ligne.
    function wallItemHTML(a){
      var n = photoN++ % 4;
      if (a.type === 'doc'){
        return '<div class="detail-docwrap' + sizeClass(a) + '"' + attrs(a) + '>' +
          docEmbedHTML(a.url, a.pages) + captionHTML(a) + '</div>';
      }
      // Carrousel : plusieurs photos dans un seul bloc, comme un post Instagram
      // conçu pour se feuilleter. Même lecteur que le PDF converti.
      if (a.type === 'carousel'){
        var shots = (a.urls || []).filter(Boolean);
        if (!shots.length) return '';
        return '<div class="detail-carousel' + sizeClass(a) + '"' + attrs(a) + '>' +
          pagedViewerHTML(shots, 'Photo') + captionHTML(a) + '</div>';
      }
      if (a.type === 'video'){
        return '<div class="detail-embed photo photo-' + n + sizeClass(a) + '"' + attrs(a) + '>' +
          videoEmbedHTML(a.url) + captionHTML(a) + '</div>';
      }
      if (a.type === 'audio'){
        return '<div class="detail-audio' + sizeClass(a) + '"' + attrs(a) + '>' +
          audioEmbedHTML(a.url) + captionHTML(a) + '</div>';
      }
      if (a.type === 'web'){
        return '<div class="detail-webwrap' + sizeClass(a) + '"' + attrs(a) + '>' +
          websiteEmbedHTML(a.url) + captionHTML(a) + '</div>';
      }
      // Un bloc de texte est une tuile du mur comme une autre : on peut le
      // placer, le dimensionner et le glisser a cote d'une affiche pour la
      // commenter. Les sauts de ligne saisis sont conserves.
      if (a.type === 'text'){
        var body = String(a.text || '');
        if (!body.trim() && !window.__EDIT_MODE__) return '';
        return '<div class="detail-textwrap' + sizeClass(a) + '"' + attrs(a) + '>' +
          '<div class="asset-text' + (body.trim() ? '' : ' is-empty') + '" data-asset-text>' +
            body +
          '</div>' + captionHTML(a) +
        '</div>';
      }
      // each photo is its own "taped to the wall" figure — the wrapper also
      // gives the admin editor a host for its per-asset controls.
      // Pas de `loading="lazy"` ici, et c'est volontaire : le mur a besoin de la
      // hauteur reelle de chaque image pour placer les suivantes. Une image
      // differee mesure zero, le mur se calcule donc ecrase, et l'image placee
      // dans ce mur ecrase ne declenche jamais son chargement — chacune attend
      // l'autre, et plus rien ne s'affiche. `decoding="async"` garde le decodage
      // hors du fil principal, sans differer la requete.
      return '<figure class="photo photo-' + n + sizeClass(a) + '"' + attrs(a) + '>' +
        '<img src="' + a.url + '" alt="' + obj.title + '" decoding="async" draggable="false">' +
        captionHTML(a, 'figcaption') +
      '</figure>';
    }

    if (!list.length) return '';
    return '<div class="detail-gallery">' + list.map(wallItemHTML).join('') + '</div>';
  }

  // live preview of an external site the project links to — many sites block
  // being framed (X-Frame-Options/CSP), which fails silently, so the direct
  // link is always shown alongside as a guaranteed way to actually see it.
  function websiteEmbedHTML(link){
    return '<div class="detail-site-embed">' +
      '<iframe src="' + link + '" title="Aperçu du site" loading="lazy" referrerpolicy="no-referrer"></iframe>' +
      '<p class="detail-embed-caption">Aperçu en direct — si rien ne s\'affiche ci-dessus, ce site bloque l\'intégration ; ' +
        '<a href="' + link + '" target="_blank" rel="noopener">ouvre-le directement ' + UI_ICON.external + '</a>.</p>' +
    '</div>';
  }

  // Une pile d'images qu'on feuilleuille, une seule à l'écran, avec nos propres
  // commandes. Sert au PDF converti comme au carrousel : c'est le même geste, et
  // dupliquer la mécanique aurait fait deux lecteurs à maintenir au lieu d'un.
  // `noun` ne change que les libellés lus par les lecteurs d'écran.
  function pagedViewerHTML(pages, noun){
    noun = noun || 'Page';
    return '<div class="detail-doc doc-viewer" data-doc-pages="' + encodeURIComponent(JSON.stringify(pages)) + '"' +
        ' data-doc-noun="' + noun + '">' +
      // les commandes vivent DANS la scène : c'est elle qui épouse l'image,
      // alors que le lecteur, lui, occupe toute la largeur disponible
      '<div class="doc-stage">' +
        '<img src="' + pages[0] + '" alt="' + noun + ' 1" draggable="false">' +
        '<button class="doc-nav doc-prev" type="button" aria-label="' + noun + ' précédente">' + UI_ICON.prev + '</button>' +
        '<button class="doc-nav doc-next" type="button" aria-label="' + noun + ' suivante">' + UI_ICON.next + '</button>' +
        '<button class="doc-nav doc-full" type="button" aria-label="Afficher en plein écran">' + UI_ICON.expand + '</button>' +
      '</div>' +
      '<div class="doc-bar"><span class="doc-count">1 / ' + pages.length + '</span></div>' +
    '</div>';
  }

  // Documents: PDFs embed natively in every modern browser; Google Docs/Slides/
  // Sheets have a /preview form; Office files have no native embed, so they get
  // routed through Microsoft's public viewer.
  // Aucun lien de repli sous l'intégration : le visiteur ne doit pas être invité
  // à quitter le portfolio. La contrepartie est assumée — si l'hébergeur refuse
  // l'intégration, le cadre reste vide. La parade est de convertir le document
  // en pages avec le bouton « PDF », qui ne dépend alors plus de personne.
  function docEmbedHTML(url, pages){
    // Converted at upload: show the pages as plain images. No browser PDF
    // viewer means no toolbar we can't style, and the same look everywhere.
    if (pages && pages.length) return pagedViewerHTML(pages, 'Page');

    // Google fournit un bloc <iframe …> tout fait, qu'on colle plus volontiers
    // que l'adresse seule : on en extrait le src plutôt que de ne rien afficher.
    var embedded = String(url || '').match(/<iframe[^>]+src=["']([^"']+)["']/i);
    if (embedded) url = embedded[1];

    var lower = url.toLowerCase();
    var src = null;

    // Lien « Publier sur le web » : /<type>/d/e/<jeton>/pub. À tester AVANT la
    // forme /d/<id>, dont la capture ramasserait le « e » du chemin et
    // fabriquerait une URL morte (/document/d/e/preview) — c'était le bug.
    // C'est aussi la meilleure forme à intégrer : Google sert alors le document
    // en HTML nu, sans sa barre d'outils ni son cadre de visionneuse.
    var GDOC_EMBED = {
      document: '/pub?embedded=true',
      spreadsheets: '/pubhtml?widget=true&headers=false',
      presentation: '/embed?start=false&loop=false&delayms=3000'
    };
    var gpub = url.match(/docs\.google\.com\/(document|presentation|spreadsheets)\/d\/e\/([\w-]+)/);
    var gdoc = url.match(/docs\.google\.com\/(document|presentation|spreadsheets)\/d\/([\w-]+)/);
    if (gpub){
      src = 'https://docs.google.com/' + gpub[1] + '/d/e/' + gpub[2] + GDOC_EMBED[gpub[1]];
    } else if (gdoc){
      src = 'https://docs.google.com/' + gdoc[1] + '/d/' + gdoc[2] + '/preview';
    } else if (/\.pdf($|\?|#)/.test(lower)){
      // hide the built-in PDF chrome where the browser honours it (Chrome,
      // Edge); Firefox and Safari ignore these and keep their own toolbar.
      src = url + (url.indexOf('#') === -1 ? '#toolbar=0&navpanes=0&scrollbar=0&view=FitH' : '');
    } else if (/\.(docx?|pptx?|xlsx?)($|\?|#)/.test(lower)){
      src = 'https://view.officeapps.live.com/op/embed.aspx?src=' + encodeURIComponent(url);
    }

    if (!src){
      return '<div class="detail-doc">' +
        '<a class="btn btn-primary" href="' + url + '" target="_blank" rel="noopener">Ouvrir le document ' + UI_ICON.external + '</a>' +
      '</div>';
    }
    // Pas de mention sous le document ni de lien de repli : rien ne doit inviter
    // le visiteur à quitter le portfolio, comme pour le lecteur de PDF.
    // `is-embed` distingue ce cas du lecteur paginé : les deux sont des
    // `.detail-doc`, mais seul celui-ci est une intégration, et il lui faut son
    // propre scotch — le lecteur paginé tient le sien de `.doc-viewer`.
    return '<div class="detail-doc is-embed">' +
      '<iframe src="' + src + '" title="Document" loading="lazy"></iframe>' +
    '</div>';
  }

  function subProjectsHTML(list){
    if (!list || !list.length) return '';
    // Pas de titre « Sections » sur le site : « section » est le vocabulaire de
    // l'éditeur, pas celui du visiteur. Ce qu'il doit voir, c'est le titre que
    // la section porte — « Multipage stratégique » — et c'est donc lui qu'on met
    // en avant.
    return '<div class="detail-subprojects">' +
      list.map(function(sp){
        return '<div class="subproject">' +
          (sp.medium ? '<span class="tag">' + (mediumLabel[sp.medium] || sp.medium) + '</span>' : '') +
          '<h2 class="subproject-title">' + sp.title + '</h2>' +
          (sp.desc ? '<p class="detail-desc">' + sp.desc + '</p>' : '') +
          (sp.link ? '<a class="pill-btn" href="' + sp.link + '" target="_blank" rel="noopener">Voir ' + UI_ICON.external + '</a>' : '') +
          mediaBlocksHTML(sp) +
        '</div>';
      }).join('') +
    '</div>';
  }

  function renderProjectDetail(site, projects){
    var container = document.getElementById('js-project-detail');
    if (!container) return;
    // normally the id comes from the query string; a preview frame with no
    // URL of its own (the admin's visual editor) passes it in directly.
    var id = window.__PROJECT_ID__ || new URLSearchParams(window.location.search).get('id');
    var p = projects.filter(function(x){ return x.id === id; })[0];

    if (!p){
      document.title = 'Projet introuvable — Adam';
      container.innerHTML =
        '<div class="wrap" style="padding:80px 0; text-align:center;">' +
          '<h1 style="font-family:var(--font-display); font-size:22px; margin-bottom:12px;">Projet introuvable</h1>' +
          '<p style="color:var(--text-dim); margin-bottom:24px;">Ce projet n\'existe plus ou le lien est incorrect.</p>' +
          '<a class="pill-btn" href="index.html">' + UI_ICON.arrowLeft + ' Retour à l\'accueil</a>' +
        '</div>';
      return;
    }

    document.title = p.title + ' — Adam';

    container.innerHTML =
      '<div class="wrap detail-wrap">' +
        '<a class="pill-btn back-link" href="' + linkForProject(p) + '">' + UI_ICON.arrowLeft + ' ' + (BACK_LABEL[p.ctx] || 'Retour') + '</a>' +
        '<div class="detail-meta-row">' +
          '<span class="tag">' + (mediumLabel[p.medium] || p.medium) + '</span>' +
          '<span class="tag">' + p.year + '</span>' +
          (p.featured ? '<span class="tag tag-featured">' + UI_ICON.star + ' Mis en avant</span>' : '') +
        '</div>' +
        '<h1 class="detail-title">' + p.title + '</h1>' +
        '<div class="card-tags detail-tags">' + p.tags.map(function(t){ return '<span class="tag">#' + t.replace(/\s+/g,'') + '</span>'; }).join('') + '</div>' +
        '<p class="detail-desc">' + (p.longDesc || p.desc) + '</p>' +
        (p.link ? '<a class="btn btn-primary" href="' + p.link + '" target="_blank" rel="noopener">Visiter le site ' + UI_ICON.external + '</a>' : '') +
        (p.link ? websiteEmbedHTML(p.link) : '') +
        mediaBlocksHTML(p) +
        subProjectsHTML(p.subProjects) +
      '</div>';

    initDocViewers(container);
    initLightbox(container);
    initWall(container);
  }

  // ---- Le mur de posters ----------------------------------------------------
  // En flex, une rangée est aussi haute que son plus grand élément : une photo
  // courte ne peut pas remonter à côté d'un document haut, ce qui creuse de
  // grands vides. Aucune propriété CSS ne fait mieux ici — `columns`, qui serait
  // le réflexe, crée un contexte de fragmentation qui rogne le scotch sur Safari
  // et casse l'affichage sur Firefox (bug déjà rencontré, ne pas y revenir).
  //
  // On place donc chaque élément soi-même, en gardant sa largeur fixe : on
  // cherche l'endroit le plus haut où il tient, de gauche à droite. C'est le
  // remplissage qu'on attend d'un vrai mur d'affiches.
  var GAP_X = 38, GAP_Y = 46, STEP = 4;   // STEP : finesse du calcul, en pixels
  // Pas de largeur de reference figee : une position est enregistree en pixels
  // reels. Le mur ne se met a l'echelle que si la composition ne rentre pas —
  // sinon ce que l'on compose n'est pas ce que voit l'ecran d'a cote, et
  // epingler la premiere affiche la ferait changer de taille sans raison.
  var MIN_CANVAS = 900;   // en dessous, la composition devient illisible : on empile

  function readPos(el){
    var raw = el.getAttribute('data-pos');
    if (!raw) return null;
    var n = raw.split(',').map(Number);
    if (n.length < 3 || n.some(isNaN)) return null;
    return { x: n[0], y: n[1], w: n[2] };
  }

  function packWall(gallery){
    var items = Array.prototype.slice.call(gallery.children);
    if (!items.length) return;

    // mesurer en flux naturel : les largeurs viennent des tailles S/M/L
    gallery.classList.remove('is-packed');
    items.forEach(function(el){
      el.style.left = el.style.top = el.style.width = '';
    });

    var style = getComputedStyle(gallery);
    var width = gallery.clientWidth
      - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);

    var anyPinned = items.some(function(el){ return !!readPos(el); });
    // Sous MIN_CANVAS la composition devient trop petite pour se lire : on rend
    // la main au flux naturel, qui empile dans l'ordre des contenus.
    if (anyPinned && width < MIN_CANVAS) return;

    // La composition ne se reduit que si elle deborde. Tant qu'elle rentre,
    // l'echelle vaut 1 et rien ne change de taille — ni en composant, ni en
    // epinglant la premiere affiche.
    var reach = 0;
    items.forEach(function(el){
      var p = readPos(el);
      if (p && p.x + p.w > reach) reach = p.x + p.w;
    });
    var scale = (anyPinned && reach > width) ? width / reach : 1;

    // Les elements epingles prennent d'abord leur place ; les autres se rangent
    // ensuite dans ce qui reste. C'est ce qui permet d'ajouter une photo sans
    // avoir a la placer, sans jamais deranger une composition faite a la main.
    var pinned = [], loose = [];
    items.forEach(function(el){
      var pos = readPos(el);
      if (pos){
        el.style.width = (pos.w * scale) + 'px';
        pinned.push({ el: el, x: pos.x * scale, y: pos.y * scale, w: pos.w * scale });
      } else {
        loose.push({ el: el, off: parseFloat(getComputedStyle(el).marginTop) || 0 });
      }
    });
    // l'editeur a besoin de la meme echelle pour convertir un geste de souris en
    // position enregistree : la lui faire deviner reintroduirait l'ecart
    gallery.setAttribute('data-scale', scale);

    if (!anyPinned){
      // une seule colonne : le flux naturel fait deja l'affaire, et empiler
      // a la main priverait le mobile de sa mise en page fluide
      var widest = Math.max.apply(null, loose.map(function(b){ return b.el.offsetWidth; }));
      if (width < widest * 2 + GAP_X) return;
    }

    // En mode toile, TOUT est a l'echelle de la composition — y compris ce qui
    // n'a pas ete place a la main. Sans ca une affiche epinglee et sa voisine
    // automatique ne seraient pas dans le meme repere, et deplacer la seconde
    // changerait sa taille au passage.
    if (anyPinned && scale !== 1){
      loose.forEach(function(b){ b.el.style.width = (b.el.offsetWidth * scale) + 'px'; });
    }

    // les hauteurs se lisent apres avoir fixe les largeurs
    pinned.forEach(function(p){ p.h = p.el.offsetHeight; });
    loose.forEach(function(b){ b.w = b.el.offsetWidth; b.h = b.el.offsetHeight; });

    var rects = pinned.map(function(p){ return { x: p.x, y: p.y, w: p.w, h: p.h }; });
    function collides(x, y, w, h){
      for (var i = 0; i < rects.length; i++){
        var r = rects[i];
        if (x < r.x + r.w + GAP_X && r.x < x + w + GAP_X &&
            y < r.y + r.h + GAP_Y && r.y < y + h + GAP_Y) return true;
      }
      return false;
    }

    var placed = pinned.map(function(p){ return { el: p.el, left: p.x, top: p.y }; });
    loose.forEach(function(b){
      // hauteurs candidates : le haut, et le bas de chaque element deja pose —
      // une place libre commence toujours juste sous quelque chose
      var ys = [0];
      rects.forEach(function(r){ ys.push(r.y + r.h + GAP_Y); });
      ys.sort(function(a, c){ return a - c; });
      var bestX = 0, bestY = Infinity;
      for (var yi = 0; yi < ys.length && bestY === Infinity; yi++){
        for (var x = 0; x + b.w <= width; x += STEP){
          if (!collides(x, ys[yi], b.w, b.h)){ bestX = x; bestY = ys[yi]; break; }
        }
      }
      if (bestY === Infinity){ bestY = Math.max.apply(null, ys); bestX = 0; }
      var top = bestY + b.off;
      placed.push({ el: b.el, left: bestX, top: top });
      rects.push({ x: bestX, y: top, w: b.w, h: b.h });
    });

    var usedRight = 0, usedBottom = 0;
    rects.forEach(function(r){
      if (r.x + r.w > usedRight) usedRight = r.x + r.w;
      if (r.y + r.h > usedBottom) usedBottom = r.y + r.h;
    });

    // Un mur libre reste calé à gauche : recentrer déplacerait une composition
    // dès qu'on ajoute un contenu ailleurs. Le mur automatique, lui, se centre
    // comme avant.
    var shift = anyPinned ? 0 : Math.max(0, (width - usedRight) / 2);
    gallery.classList.add('is-packed');
    placed.forEach(function(p){
      p.el.style.left = (p.left + shift) + 'px';
      p.el.style.top = p.top + 'px';
    });
    gallery.style.height = usedBottom + 'px';
  }

  function initWall(scope){
    scope.querySelectorAll('.detail-gallery').forEach(function(gallery){
      var pending = null;
      function repack(){
        clearTimeout(pending);
        pending = setTimeout(function(){ packWall(gallery); }, 60);
      }
      repack();

      // Une image qui arrive, une page de PDF qu'on tourne, une police qui se
      // charge : tout cela change une hauteur, donc le placement.
      // L'observateur de tailles couvre les trois — replacer ne change aucune
      // taille, il n'y a donc pas de boucle.
      if (window.ResizeObserver){
        var ro = new ResizeObserver(repack);
        Array.prototype.forEach.call(gallery.children, function(el){ ro.observe(el); });
      }
      // Et par-dessus, l'événement `load` de chaque image. C'est redondant une
      // fois les images en cache, mais c'est le premier affichage — images
      // encore vides, donc hautes de zéro — qui produisait un mur tassé et des
      // affiches superposées. Mieux vaut deux déclencheurs qu'un silence.
      Array.prototype.forEach.call(gallery.querySelectorAll('img'), function(im){
        if (!im.complete) im.addEventListener('load', repack, { once: true });
      });
      window.addEventListener('resize', repack);
      window.addEventListener('load', repack);
    });
  }

  // Paged document viewer: one page shown at a time, images preloaded lazily
  // as the reader advances.
  function initDocViewers(scope){
    scope.querySelectorAll('.doc-viewer').forEach(function(v){
      var pages;
      try { pages = JSON.parse(decodeURIComponent(v.getAttribute('data-doc-pages'))); }
      catch(e){ return; }
      if (!pages || pages.length < 1) return;

      var img = v.querySelector('.doc-stage img');
      var count = v.querySelector('.doc-count');
      var prev = v.querySelector('.doc-prev');
      var next = v.querySelector('.doc-next');
      var full = v.querySelector('.doc-full');
      var i = 0;

      var noun = v.getAttribute('data-doc-noun') || 'Page';

      function show(n){
        i = Math.max(0, Math.min(pages.length - 1, n));
        img.src = pages[i];
        img.alt = noun + ' ' + (i + 1);
        count.textContent = (i + 1) + ' / ' + pages.length;
        prev.disabled = (i === 0);
        next.disabled = (i === pages.length - 1);
        // warm the neighbouring page so paging feels instant
        var ahead = pages[i + 1];
        if (ahead){ var p = new Image(); p.src = ahead; }
      }
      prev.addEventListener('click', function(){ show(i - 1); });
      next.addEventListener('click', function(){ show(i + 1); });
      v.addEventListener('keydown', function(e){
        if (e.key === 'ArrowLeft') show(i - 1);
        if (e.key === 'ArrowRight') show(i + 1);
      });

      // Pages open full-screen exactly like a photo. Paging inside the overlay
      // reports back through `show`, so closing it leaves the reader on the
      // page you stopped at rather than snapping back. The button matters as
      // much as the click: on touch there is no cursor to hint at it.
      if (!window.__EDIT_MODE__){
        var openFull = function(){ lightbox().open(pages, i, show); };
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', openFull);
        if (full) full.addEventListener('click', openFull);
      } else if (full){
        full.remove();
      }

      v.tabIndex = 0;
      show(0);

      function markReady(){ v.classList.add('is-ready'); }
      if (img.complete && img.naturalWidth) markReady();
      else img.addEventListener('load', markReady, { once: true });
    });
  }

  // Full-screen viewer, shared by the galleries and the document reader: one
  // overlay for the whole page, built the first time something needs it.
  // Right-click, dragging and the long-press "save image" menu are suppressed
  // inside it — this discourages casual copying, it is NOT real protection
  // (a screenshot or the browser's dev tools still get the file).
  var lightboxAPI = null;
  function lightbox(){
    if (lightboxAPI) return lightboxAPI;

    var box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('aria-hidden', 'true');
    box.innerHTML =
      '<button class="lightbox-close" type="button" aria-label="Fermer">' + UI_ICON.close + '</button>' +
      '<button class="lightbox-nav lightbox-prev" type="button" aria-label="Précédent">' + UI_ICON.prev + '</button>' +
      '<img alt="" draggable="false">' +
      '<button class="lightbox-nav lightbox-next" type="button" aria-label="Suivant">' + UI_ICON.next + '</button>';
    document.body.appendChild(box);

    var imgEl = box.querySelector('img');
    var srcs = [];
    var index = 0;
    var onChange = null;

    function show(i){
      index = (i + srcs.length) % srcs.length;
      imgEl.src = srcs[index];
      var multiple = srcs.length > 1;
      box.querySelector('.lightbox-prev').style.display = multiple ? '' : 'none';
      box.querySelector('.lightbox-next').style.display = multiple ? '' : 'none';
      if (onChange) onChange(index);
    }
    function close(){
      box.classList.remove('is-open');
      box.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      onChange = null;
    }

    box.querySelector('.lightbox-close').addEventListener('click', close);
    box.querySelector('.lightbox-prev').addEventListener('click', function(e){ e.stopPropagation(); show(index - 1); });
    box.querySelector('.lightbox-next').addEventListener('click', function(e){ e.stopPropagation(); show(index + 1); });
    box.addEventListener('click', function(e){ if (e.target === box) close(); });
    box.addEventListener('contextmenu', function(e){ e.preventDefault(); });
    box.addEventListener('dragstart', function(e){ e.preventDefault(); });
    document.addEventListener('keydown', function(e){
      if (!box.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(index - 1);
      if (e.key === 'ArrowRight') show(index + 1);
    });

    lightboxAPI = {
      open: function(list, start, sync){
        srcs = list;
        onChange = null;              // the opening frame is not a page change
        show(start || 0);
        onChange = sync || null;
        box.classList.add('is-open');
        box.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      }
    };
    return lightboxAPI;
  }

  // Click any gallery image to view it full-screen.
  function initLightbox(scope){
    // in the editor a click on an image belongs to the editing controls
    if (window.__EDIT_MODE__) return;
    var gallery = scope.querySelectorAll('.detail-gallery img');
    if (!gallery.length) return;

    var srcs = Array.prototype.map.call(gallery, function(im){ return im.getAttribute('src'); });
    gallery.forEach(function(im, i){
      im.style.cursor = 'zoom-in';
      im.addEventListener('click', function(){ lightbox().open(srcs, i); });
    });
  }

  // Les sections principales viennent des données, plus du HTML : c'est ce qui
  // permet de les créer, renommer et réordonner depuis le panneau. Chaque page
  // de grille porte un conteneur `data-sections-page`, et reçoit les sections
  // qui lui sont affectées.
  var DEFAULT_SECTIONS = [
    { id: 'perso', page: 'perso', kicker: '01 — Perso', title: 'Projets perso', desc: '' },
    { id: 'academique', page: 'academique', kicker: '02 — Académique', title: 'Projets académiques', desc: '' },
    { id: 'stage', page: 'academique', kicker: 'Stage — En Esprit', title: 'Stage de deuxième', desc: '' }
  ];

  function sectionsOf(site){
    var list = site && Array.isArray(site.sections) ? site.sections : null;
    return (list && list.length) ? list : DEFAULT_SECTIONS;
  }

  // Le dégradé portait sur un mot choisi à la main dans le HTML. Le titre étant
  // désormais du texte libre, c'est le dernier mot qui le reçoit : on garde
  // l'effet sans demander de balises à qui écrit le titre.
  function titleWithAccent(title){
    var words = String(title || '').trim().split(/\s+/);
    if (words.length < 2) return '<span class="grad-text">' + (words[0] || '') + '</span>';
    var last = words.pop();
    return words.join(' ') + ' <span class="grad-text">' + last + '</span>';
  }

  function renderSections(site){
    var sections = sectionsOf(site);
    document.querySelectorAll('[data-sections-page]').forEach(function(host){
      var page = host.getAttribute('data-sections-page');
      var mine = sections.filter(function(s){ return (s.page || 'perso') === page; });
      host.innerHTML = mine.map(function(s, n){
        return '<section class="projects-section" id="' + s.id + '" data-section-id="' + s.id + '">' +
          '<div class="wrap">' +
            '<div class="section-head' + (n ? ' sub' : '') + '">' +
              '<span class="kicker" data-section-kicker>' + (s.kicker || '') + '</span>' +
              (n ? '<h2' : '<h1') + ' data-section-title>' + titleWithAccent(s.title) + (n ? '</h2>' : '</h1>') +
              '<p data-section-desc>' + (s.desc || '') + '</p>' +
            '</div>' +
            '<div class="grid" data-group="' + s.id + '"></div>' +
          '</div>' +
        '</section>';
      }).join('');
    });
  }

  function renderGrids(projects){
    var shown = window.__EDIT_MODE__ ? projects : projects.filter(function(p){ return !p.hidden; });
    document.querySelectorAll('.grid[data-group]').forEach(function(grid){
      var group = grid.dataset.group;
      var list = group === 'featured' ? shown.filter(function(p){ return p.featured; }) : shown.filter(function(p){ return p.ctx === group; });
      grid.innerHTML = list.map(cardHTML).join('');
    });

    var cards = document.querySelectorAll('.card');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(e){ if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
      }, { threshold: 0.12 });
      cards.forEach(function(c){ io.observe(c); });
    } else {
      cards.forEach(function(c){ c.classList.add('in'); });
    }
  }

  // ---- nav-cards: stay visible from the start, but sway gently with scroll —
  // each card moves at a slightly different rate/direction for a subtle
  // parallax "alive" feel while the page scrolls. (static markup, no data) ----
  var navCards = document.querySelectorAll('.nav-card');
  if (navCards.length && !reduceMotionQuery.matches) {
    var navSpeeds = [0.035, -0.035];
    var ticking = false;
    var updateNavParallax = function(){
      var y = window.scrollY;
      navCards.forEach(function(c, i){
        var speed = navSpeeds[i % navSpeeds.length];
        var offset = Math.max(-10, Math.min(10, y * speed));
        c.style.setProperty('--py', offset.toFixed(1) + 'px');
      });
      ticking = false;
    };
    window.addEventListener('scroll', function(){
      if (!ticking) { requestAnimationFrame(updateNavParallax); ticking = true; }
    }, { passive: true });
    updateNavParallax();
  }

  // ---- scramble-to-decrypt hover (Schoolbell handwriting -> readable) ----
  var SCRAMBLE_CHARS = '!<>-_\\/[]{}—=+*^?#$%&@';

  function TextScramble(el){
    this.el = el;
    this.frame = 0;
    this.timer = null;
    this.queue = [];
    this.resolve = null;
    this.update = this.update.bind(this);
  }
  // toReadable=true plays the decrypt wave (cursive -> readable), false plays
  // the re-encrypt wave (readable -> cursive) — same mechanics, opposite goal,
  // so the two directions actually look like mirrored animations instead of
  // an identical scramble that just snaps the font at the very end.
  TextScramble.prototype.setText = function(newText, toReadable){
    var oldChars = Array.from(this.el.textContent);
    var newChars = Array.from(newText);
    var length = Math.max(oldChars.length, newChars.length);
    var self = this;
    var promise = new Promise(function(res){ self.resolve = res; });
    this.toReadable = toReadable;
    this.queue = [];
    // scale the stagger to the text length so the whole wave — regardless
    // of how long the string is — lands at a comfortable middle pace
    // (33ms ticks; worst-case ~24 frames ≈ 800ms including jitter).
    var perCharDelay = 16 / Math.max(1, length);
    for (var i = 0; i < length; i++){
      var from = oldChars[i] || '';
      var to = newChars[i] || '';
      var start = i * perCharDelay + Math.random() * 2;
      var end = start + 3 + Math.random() * 3;
      this.queue.push({ from: from, to: to, start: start, end: end, char: '' });
    }
    clearInterval(this.timer);
    this.frame = 0;
    this.timer = setInterval(this.update, 33);
    this.update();
    return promise;
  };
  function wrapReadable(ch){
    return '<span class="plain-readable">' + ch + '</span>';
  }
  // a line break is structural, not a visible character — it always renders
  // as <br> and is never scrambled, so hard breaks (e.g. before "Autodidacte")
  // survive the decrypt/re-encrypt animation instead of collapsing flat.
  TextScramble.prototype.update = function(){
    var output = '';
    var complete = 0;
    var toReadable = this.toReadable;
    for (var i = 0; i < this.queue.length; i++){
      var q = this.queue[i];
      if (q.to === '\n'){
        output += '<br>';
        complete++;
        continue;
      }
      if (this.frame >= q.end){
        complete++;
        // settled: the "readable" side of this transition needs an explicit
        // font (the container's own font-family is always the cursive one).
        output += toReadable ? wrapReadable(q.to) : (q.to || ' ');
      } else if (this.frame >= q.start){
        if (!q.char || Math.random() < 0.45){
          q.char = (q.to === ' ' || q.to === '') ? ' ' : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        }
        output += '<span class="dud">' + q.char + '</span>';
      } else {
        // not reached yet: still showing the *previous* state, which is
        // readable when we're mid re-encrypt, cursive when mid-decrypt.
        output += toReadable ? (q.from || ' ') : wrapReadable(q.from || ' ');
      }
    }
    this.el.innerHTML = output;
    if (complete === this.queue.length){
      clearInterval(this.timer);
      if (this.resolve){ this.resolve(); this.resolve = null; }
      return;
    }
    this.frame++;
  };

  function readWithBreaks(el){
    var out = '';
    el.childNodes.forEach(function(node){
      if (node.nodeType === 3) out += node.data;
      else if (node.nodeName === 'BR') out += '\n';
    });
    // collapse any run of whitespace that contains a newline (incl. the
    // source-formatting indentation around a real <br>) down to one \n,
    // then collapse any remaining horizontal whitespace to a single space.
    return out.replace(/[ \t]*\n[ \t\n]*/g, '\n').replace(/[ \t]+/g, ' ').trim();
  }
  function renderPlain(el, text){
    el.innerHTML = text.split('\n').join('<br>');
  }

  // phones/tablets can't hover, so the trigger has to change: play the wave
  // as each paragraph scrolls into view instead of waiting for a pointer
  // that will never come, and re-encrypt it on the way out so it can replay
  // next time the reader scrolls back up to it.
  var hoverCapable = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function initScramble(){
    document.querySelectorAll('.scramble').forEach(function(el){
      var original = readWithBreaks(el);
      renderPlain(el, original);

      if (reduceMotionQuery.matches){
        if (hoverCapable){
          el.addEventListener('mouseenter', function(){ el.classList.add('decrypted'); });
          el.addEventListener('mouseleave', function(){ el.classList.remove('decrypted'); });
        } else {
          var obsStatic = new IntersectionObserver(function(entries){
            entries.forEach(function(entry){ el.classList.toggle('decrypted', entry.isIntersecting); });
          }, { threshold: 0.3 });
          obsStatic.observe(el);
        }
        return;
      }

      var fx = new TextScramble(el);
      if (hoverCapable){
        el.addEventListener('mouseenter', function(){
          el.classList.add('decrypted');
          fx.setText(original, true);
        });
        el.addEventListener('mouseleave', function(){
          fx.setText(original, false).then(function(){ el.classList.remove('decrypted'); });
        });
      } else {
        var obs = new IntersectionObserver(function(entries){
          entries.forEach(function(entry){
            if (entry.isIntersecting){
              el.classList.add('decrypted');
              fx.setText(original, true);
            } else {
              fx.setText(original, false).then(function(){ el.classList.remove('decrypted'); });
            }
          });
        }, { threshold: 0.3 });
        obs.observe(el);
      }
    });
  }

  // ---- everything above is markup/behaviour wiring; the actual content
  // (texts, projects, favori) is fetched once from data.json so it can be
  // edited from /admin.html without touching any code. When a preview embeds
  // the data inline (window.__SITE_DATA__ — see the artifact build step),
  // that's used instead of fetching the sibling file. ----
  // `cache: 'no-cache'` = revalider systematiquement, pas « ne pas mettre en
  // cache ». GitHub Pages sert data.json avec max-age=600 : sans ca, un
  // navigateur garde jusqu'a 10 minutes le contenu d'avant l'enregistrement
  // depuis l'admin. Le fichier porte un ETag, donc la revalidation renvoie
  // presque toujours un 304 vide.
  var loadSiteData = window.__SITE_DATA__
    ? Promise.resolve(window.__SITE_DATA__)
    : fetch('data.json', { cache: 'no-cache' }).then(function(res){ return res.json(); });

  loadSiteData
    .then(function(data){
      var site = data.site || {};
      var projects = data.projects || [];
      // les cartes en ont besoin pour signaler le favori ; renseigné avant
      // renderGrids, qui est ce qui les fabrique
      favoriId = site.favoriProjectId || null;
      applySiteTexts(site);
      applyFavori(site, projects);
      renderTimeline(site.timeline);
      renderSections(site);   // avant renderGrids : c'est lui qui cree les grilles
      renderGrids(projects);
      renderProjectDetail(site, projects);
      initScramble();
    })
    .catch(function(err){
      console.error('Impossible de charger data.json', err);
      // fall back to whatever static markup is already in the page,
      // and still wire up the scramble effect on it.
      initScramble();
    });
})();
