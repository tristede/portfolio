(function(){
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  var reduceMotionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };

  var icons = {
    video: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2.5" y="6" width="14" height="12" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M16.5 10.2l5-2.7v9l-5-2.7" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    audio: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 12h2l2.5-6 3 12 2.5-9 2 6H21" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    graphisme: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.6"/><circle cx="8.5" cy="9" r="1.6" stroke="currentColor" stroke-width="1.6"/><path d="M3 16l5-5 4 4 3-3 6 6" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    social: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="6" cy="12" r="2.4" stroke="currentColor" stroke-width="1.6"/><circle cx="18" cy="6" r="2.4" stroke="currentColor" stroke-width="1.6"/><circle cx="18" cy="18" r="2.4" stroke="currentColor" stroke-width="1.6"/><path d="M8.1 10.8L15.9 7.2M8.1 13.2l7.8 3.6" stroke="currentColor" stroke-width="1.6"/></svg>',
    event: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4.5" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M3 9.5h18M8 3v3M16 3v3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    ecrit: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 20l1-4L16 5l3 3-11 11-4 1z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>'
  };
  var mediumLabel = {
    video: 'Vidéo', audio: 'Audio', graphisme: 'Graphisme',
    social: 'Réseaux sociaux', event: 'Événementiel', ecrit: 'Écrit'
  };

  // shared across all pages — each page just filters what it needs
  var projects = [
    // Projets perso
    { title: "Ilonka Club", year: 2025, ctx: "perso", medium: "graphisme", tags: ["Graphisme","Affiche"], desc: "Identité visuelle et affiche promotionnelle pour un showcase événementiel." },
    { title: "Union Oasis Forest", year: 2025, ctx: "perso", medium: "graphisme", tags: ["Graphisme","Identité visuelle"], desc: "Création d'identité visuelle pour le projet Union Oasis Forest." },
    { title: "Miniatures YouTube", year: 2023, ctx: "perso", medium: "graphisme", tags: ["Graphisme","Miniature"], desc: "Conception de miniatures pensées pour maximiser le taux de clic." },
    { title: "Montage vidéo style YouTube", year: 2025, ctx: "perso", medium: "video", tags: ["Montage vidéo"], desc: "Montage dynamique dans les codes du format YouTube." },
    { title: "Écriture, enregistrement & mixage chant/rap", year: 2025, ctx: "perso", medium: "audio", tags: ["Audio","Composition"], desc: "De l'écriture à l'enregistrement jusqu'au mixage final." },
    { title: "Artwork rap / pochette d'albums", year: 2025, ctx: "perso", medium: "graphisme", tags: ["Graphisme","Pochette d'album"], desc: "Création de visuels de pochettes pour des projets rap." },
    { title: "Événementiel : Stand Zennit", year: 2022, ctx: "perso", medium: "event", tags: ["Événementiel"], desc: "Organisation et animation d'un stand lors d'un événement." },
    { title: "Community management : easypermis.be", year: 2025, ctx: "perso", medium: "social", tags: ["Community management","Réseaux sociaux"], desc: "Gestion de la ligne éditoriale et des publications.", featured: true },
    // Projets académiques
    { title: "Production d'un reportage vidéo", year: 2025, ctx: "academique", medium: "video", tags: ["Vidéo","Reportage"], desc: "Réalisation d'un reportage vidéo de bout en bout." },
    { title: "Projet 360° : DEI-Belgique", year: 2025, ctx: "academique", medium: "video", tags: ["Vidéo 360°"], desc: "Production d'un contenu vidéo immersif à 360°." },
    { title: "Carte de visite : Echo Nexus", year: 2025, ctx: "academique", medium: "graphisme", tags: ["Graphisme","Identité visuelle"], desc: "Design d'une carte de visite pour le projet Echo Nexus." },
    { title: "Réalisation d'un épisode de podcast", year: 2024, ctx: "academique", medium: "audio", tags: ["Audio","Podcast"], desc: "Enregistrement, montage et mixage d'un épisode de podcast.", featured: true },
    { title: "Projet évènementiel : Cinematek", year: 2023, ctx: "academique", medium: "event", tags: ["Événementiel"], desc: "Conception d'un projet événementiel autour de la Cinematek." },
    { title: "Écriture d'articles de presse", year: 2025, ctx: "academique", medium: "ecrit", tags: ["Rédaction"], desc: "Rédaction d'articles dans un cadre journalistique." },
    // Stage — En Esprit
    { title: "La mélo de la semaine", year: 2025, ctx: "stage", medium: "audio", tags: ["Audio","Contenu récurrent"], desc: "Format audio récurrent réalisé durant le stage." },
    { title: "Montage vidéo : long format", year: 2025, ctx: "stage", medium: "video", tags: ["Montage vidéo"], desc: "Montage d'un contenu vidéo au format long." },
    { title: "Post d'actualité", year: 2025, ctx: "stage", medium: "social", tags: ["Réseaux sociaux"], desc: "Création de publications d'actualité pour les réseaux." },
    { title: "Thumbnails YouTube", year: 2025, ctx: "stage", medium: "graphisme", tags: ["Graphisme","Miniature"], desc: "Conception de miniatures YouTube pour la structure." },
    { title: "Reel / TikTok", year: 2025, ctx: "stage", medium: "video", tags: ["Vidéo","Format court"], desc: "Réalisation de formats courts pour Reels et TikTok.", featured: true },
    { title: "Création d'un logo vectoriel", year: 2025, ctx: "stage", medium: "graphisme", tags: ["Graphisme","Logo"], desc: "Conception d'un logo vectoriel pour un besoin interne." }
  ];

  function cardHTML(p, i){
    return (
      '<article class="card" style="transition-delay:' + ((i % 8) * 40) + 'ms">' +
        '<div class="thumb">' +
          '<span class="year">' + p.year + '</span>' +
          '<span class="icon">' + icons[p.medium] + '</span>' +
          '<span class="medium-label">' + mediumLabel[p.medium] + '</span>' +
        '</div>' +
        '<div class="card-body">' +
          (p.featured ? '<span class="card-featured-label">★ Mis en avant</span>' : '') +
          '<h3>' + p.title + '</h3>' +
          '<p class="desc">' + p.desc + '</p>' +
          '<div class="card-tags">' + p.tags.map(function(t){ return '<span class="tag">#' + t.replace(/\s+/g,'') + '</span>'; }).join('') + '</div>' +
        '</div>' +
      '</article>'
    );
  }

  document.querySelectorAll('.grid[data-group]').forEach(function(grid){
    var group = grid.dataset.group;
    var list = group === 'featured' ? projects.filter(function(p){ return p.featured; }) : projects.filter(function(p){ return p.ctx === group; });
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

  // nav-cards stay visible from the start, but sway gently with scroll —
  // each card moves at a slightly different rate/direction for a subtle
  // parallax "alive" feel while the page scrolls.
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

  document.querySelectorAll('.scramble').forEach(function(el){
    var original = readWithBreaks(el);
    renderPlain(el, original);
    if (reduceMotionQuery.matches){
      el.addEventListener('mouseenter', function(){ el.classList.add('decrypted'); });
      el.addEventListener('mouseleave', function(){ el.classList.remove('decrypted'); });
      return;
    }
    var fx = new TextScramble(el);
    el.addEventListener('mouseenter', function(){
      el.classList.add('decrypted');
      fx.setText(original, true);
    });
    el.addEventListener('mouseleave', function(){
      fx.setText(original, false).then(function(){ el.classList.remove('decrypted'); });
    });
  });
})();
