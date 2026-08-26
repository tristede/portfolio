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
  function thumbSrc(p){
    if (p.thumb) return p.thumb;
    if (p.images && p.images.length) return p.images[0];
    return '';
  }

  function cardHTML(p, i){
    var thumb = thumbSrc(p);
    return (
      '<a class="card" href="projet.html?id=' + encodeURIComponent(p.id) + '" style="transition-delay:' + ((i % 8) * 40) + 'ms">' +
        '<div class="thumb' + (thumb ? ' has-img' : '') + '">' +
          (thumb ? '<img class="thumb-img" src="' + thumb + '" alt="' + p.title + '" loading="lazy">' : '') +
          '<span class="year">' + p.year + '</span>' +
          (thumb ? '' : '<span class="icon">' + (icons[p.medium] || '') + '</span>') +
          '<span class="medium-label">' + (mediumLabel[p.medium] || p.medium) + '</span>' +
        '</div>' +
        '<div class="card-body">' +
          (p.featured ? '<span class="card-featured-label">★ Mis en avant</span>' : '') +
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
    var p = projects.filter(function(x){ return x.id === site.favoriProjectId; })[0] || projects[0];
    if (!p) return;
    var thumb = thumbSrc(p);
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
        '<a class="pill-btn" href="projet.html?id=' + encodeURIComponent(p.id) + '" style="width:fit-content;">Voir le projet →</a>' +
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
    var media = '';
    if (obj.images && obj.images.length){
      media += '<div class="detail-gallery">' + obj.images.map(function(src){
        return '<img src="' + src + '" alt="' + obj.title + '" loading="lazy">';
      }).join('') + '</div>';
    }
    if (obj.videoUrl) media += '<div class="detail-embed">' + videoEmbedHTML(obj.videoUrl) + '</div>';
    if (obj.audioUrl) media += '<div class="detail-audio">' + audioEmbedHTML(obj.audioUrl) + '</div>';
    return media;
  }

  // live preview of an external site the project links to — many sites block
  // being framed (X-Frame-Options/CSP), which fails silently, so the direct
  // link is always shown alongside as a guaranteed way to actually see it.
  function websiteEmbedHTML(link){
    return '<div class="detail-site-embed">' +
      '<iframe src="' + link + '" title="Aperçu du site" loading="lazy" referrerpolicy="no-referrer"></iframe>' +
      '<p class="detail-embed-caption">Aperçu en direct — si rien ne s\'affiche ci-dessus, ce site bloque l\'intégration ; ' +
        '<a href="' + link + '" target="_blank" rel="noopener">ouvre-le directement ↗</a>.</p>' +
    '</div>';
  }

  function subProjectsHTML(list){
    if (!list || !list.length) return '';
    return '<div class="detail-subprojects">' +
      '<h2 class="detail-sub-heading">Sous-projets</h2>' +
      list.map(function(sp){
        return '<div class="subproject">' +
          (sp.medium ? '<span class="tag">' + (mediumLabel[sp.medium] || sp.medium) + '</span>' : '') +
          '<h3>' + sp.title + '</h3>' +
          (sp.desc ? '<p class="detail-desc">' + sp.desc + '</p>' : '') +
          (sp.link ? '<a class="pill-btn" href="' + sp.link + '" target="_blank" rel="noopener">Voir ↗</a>' : '') +
          mediaBlocksHTML(sp) +
        '</div>';
      }).join('') +
    '</div>';
  }

  function renderProjectDetail(site, projects){
    var container = document.getElementById('js-project-detail');
    if (!container) return;
    var id = new URLSearchParams(window.location.search).get('id');
    var p = projects.filter(function(x){ return x.id === id; })[0];

    if (!p){
      document.title = 'Projet introuvable — Adam';
      container.innerHTML =
        '<div class="wrap" style="padding:80px 0; text-align:center;">' +
          '<h1 style="font-family:var(--font-display); font-size:22px; margin-bottom:12px;">Projet introuvable</h1>' +
          '<p style="color:var(--text-dim); margin-bottom:24px;">Ce projet n\'existe plus ou le lien est incorrect.</p>' +
          '<a class="pill-btn" href="index.html">← Retour à l\'accueil</a>' +
        '</div>';
      return;
    }

    document.title = p.title + ' — Adam';

    container.innerHTML =
      '<div class="wrap detail-wrap">' +
        '<a class="pill-btn back-link" href="' + linkForProject(p) + '">← ' + (BACK_LABEL[p.ctx] || 'Retour') + '</a>' +
        '<div class="detail-meta-row">' +
          '<span class="tag">' + (mediumLabel[p.medium] || p.medium) + '</span>' +
          '<span class="tag">' + p.year + '</span>' +
          (p.featured ? '<span class="tag">★ Mis en avant</span>' : '') +
        '</div>' +
        '<h1 class="detail-title">' + p.title + '</h1>' +
        '<div class="card-tags detail-tags">' + p.tags.map(function(t){ return '<span class="tag">#' + t.replace(/\s+/g,'') + '</span>'; }).join('') + '</div>' +
        '<p class="detail-desc">' + (p.longDesc || p.desc) + '</p>' +
        (p.link ? '<a class="btn btn-primary" href="' + p.link + '" target="_blank" rel="noopener">Visiter le site ↗</a>' : '') +
        (p.link ? websiteEmbedHTML(p.link) : '') +
        mediaBlocksHTML(p) +
        subProjectsHTML(p.subProjects) +
      '</div>';
  }

  function renderGrids(projects){
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
  var loadSiteData = window.__SITE_DATA__
    ? Promise.resolve(window.__SITE_DATA__)
    : fetch('data.json').then(function(res){ return res.json(); });

  loadSiteData
    .then(function(data){
      var site = data.site || {};
      var projects = data.projects || [];
      applySiteTexts(site);
      applyFavori(site, projects);
      renderTimeline(site.timeline);
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
