/* =============================================================
   LISTEN  .  shared logic
   -------------------------------------------------------------
   Reads certified CEP recordings from the public registry (anon
   key, same pattern the registry and social kit already use),
   merges them with the editorial words in content.js, and renders
   three views: the collection landing (/listen), the founding
   collection (/listen/collection), and a single recording
   (/listen/record?id=CEP-000001).

   No audio is hosted. Players are embedded from the artist's
   platform. Every recording deep-links to its registry record for
   the neutral verification.
   ============================================================= */
(function () {
  'use strict';

  var SUPA = 'https://vqydcmpraydbepckczzd.supabase.co/rest/v1';
  var ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxeWRjbXByYXlkYmVwY2tjenpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNDE0MzIsImV4cCI6MjA5MDYxNzQzMn0.ew6VRo9I1EDkvDpGeVOevfR-4D9QjGRQ-rMyH1dppDg';
  var HEADERS = { apikey: ANON, Authorization: 'Bearer ' + ANON };
  var WORKER = 'https://certs.musicalform.org';
  var REGISTRY = 'https://registry.musicalform.org';

  var FIELDS = [
    'cep_id', 'primary_artist', 'track_title', 'release_title', 'label', 'genre',
    'isrc', 'certification_date', 'cover_art_url', 'artist_website',
    'spotify_link', 'apple_music_link', 'deezer_link', 'qobuz_link', 'youtube_link', 'seo_slug'
  ].join(',');

  /* The locked CEP claim string. Do not reword without approval. */
  var CEP_CLAIM = 'Produced without grid correction, pitch correction, or generative AI.';

  var CONTENT = (window.LISTEN_CONTENT || { collection: {}, order: [], records: {} });

  /* ---------- small helpers ---------- */

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* Convert plain multi-line text into paragraphs. Blank line splits
     paragraphs; single newline becomes a break. Escapes first. */
  function paras(text) {
    var t = String(text || '').trim();
    if (!t) return '';
    return t.split(/\n{2,}/).map(function (block) {
      return '<p>' + esc(block).replace(/\n/g, '<br>') + '</p>';
    }).join('');
  }

  function content(id) {
    return (CONTENT.records && CONTENT.records[id]) || {};
  }

  /* ---------- data ---------- */

  function fetchAll() {
    return fetch(SUPA + '/v_cep_public_registry?select=' + FIELDS + '&order=cep_id.asc', { headers: HEADERS })
      .then(function (r) { if (!r.ok) throw new Error('registry'); return r.json(); });
  }

  function fetchOne(id) {
    return fetch(SUPA + '/v_cep_public_registry?cep_id=eq.' + encodeURIComponent(id) + '&select=' + FIELDS + '&limit=1', { headers: HEADERS })
      .then(function (r) { if (!r.ok) throw new Error('registry'); return r.json(); })
      .then(function (rows) { return (rows && rows[0]) || null; });
  }

  /* Apply the editorial order. Listed ids first (only if live), then any
     remaining live records in registry order so nothing is dropped. */
  function ordered(records) {
    var byId = {};
    records.forEach(function (r) { byId[r.cep_id] = r; });
    var out = [], seen = {};
    (CONTENT.order || []).forEach(function (id) {
      if (byId[id] && !seen[id]) { out.push(byId[id]); seen[id] = 1; }
    });
    records.forEach(function (r) {
      if (!seen[r.cep_id]) { out.push(r); seen[r.cep_id] = 1; }
    });
    return out;
  }

  /* ---------- cover art (mirrors the social kit) ---------- */

  function artUrl(rec) {
    var u = rec.cover_art_url || '';
    if (!u) return null;
    if (/^https?:\/\//.test(u)) return u;
    return WORKER + '/cep/public/artwork/' + encodeURIComponent(u.split('/')[0]);
  }

  function coverHtml(rec, sizeClass) {
    var u = artUrl(rec);
    var alt = esc((rec.track_title || 'Cover art') + ' cover');
    if (u) {
      return '<div class="l-cover ' + (sizeClass || '') + '"><img src="' + esc(u) + '" alt="' + alt + '" loading="lazy" decoding="async"></div>';
    }
    return '<div class="l-cover ' + (sizeClass || '') + '"><div class="l-cover-empty">CEP</div></div>';
  }

  /* ---------- embeds and platform links ---------- */

  function spotifyId(url) { var m = (url || '').match(/track\/([A-Za-z0-9]+)/); return m ? m[1] : null; }
  function deezerId(url) { var m = (url || '').match(/track\/(\d+)/); return m ? m[1] : null; }
  function appleEmbed(url) { return url ? url.replace('music.apple.com', 'embed.music.apple.com') : null; }
  function ytId(url) { var m = (url || '').match(/(?:v=|youtu\.be\/|embed\/|\/shorts\/)([A-Za-z0-9_-]{11})/); return m ? m[1] : null; }

  /* Pick one player. Spotify first (compact and widely recognized),
     then Apple, then YouTube, then Deezer. Returns null if none. */
  function primaryEmbed(rec) {
    var sid = spotifyId(rec.spotify_link);
    if (sid) return { html: '<iframe class="l-embed-frame" style="border-radius:12px" src="https://open.spotify.com/embed/track/' + sid + '" width="100%" height="152" frameborder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" title="Spotify player"></iframe>', tall: false };
    var ap = appleEmbed(rec.apple_music_link);
    if (ap) return { html: '<iframe class="l-embed-frame" allow="autoplay *; encrypted-media *; clipboard-write" frameborder="0" height="175" style="width:100%;max-width:100%;overflow:hidden;border-radius:12px;background:transparent" sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation" src="' + esc(ap) + '" loading="lazy" title="Apple Music player"></iframe>', tall: false };
    var y = ytId(rec.youtube_link);
    if (y) return { html: '<div class="l-embed-video"><iframe src="https://www.youtube.com/embed/' + y + '?rel=0" title="YouTube player" frameborder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen loading="lazy"></iframe></div>', tall: true };
    var d = deezerId(rec.deezer_link);
    if (d) return { html: '<iframe class="l-embed-frame" title="Deezer player" src="https://widget.deezer.com/widget/dark/track/' + d + '" width="100%" height="152" frameborder="0" allowtransparency="true" allow="encrypted-media; clipboard-write" loading="lazy"></iframe>', tall: false };
    return null;
  }

  function platformLinks(rec) {
    var links = [];
    if (rec.spotify_link) links.push(['Spotify', rec.spotify_link]);
    if (rec.apple_music_link) links.push(['Apple Music', rec.apple_music_link]);
    if (rec.deezer_link) links.push(['Deezer', rec.deezer_link]);
    if (rec.qobuz_link) links.push(['Qobuz', rec.qobuz_link]);
    if (rec.youtube_link) links.push(['YouTube', rec.youtube_link]);
    if (!links.length) return '';
    return '<div class="l-links">' + links.map(function (l) {
      return '<a class="l-link" href="' + esc(l[1]) + '" target="_blank" rel="noopener">' + esc(l[0]) + '</a>';
    }).join('') + '</div>';
  }

  function verifyUrl(rec) { return REGISTRY + '/cep/' + encodeURIComponent(rec.cep_id); }

  function metaLine(rec) {
    var bits = [];
    if (rec.release_title && rec.release_title !== rec.track_title) bits.push(esc(rec.release_title));
    if (rec.label) bits.push(esc(rec.label));
    if (rec.genre) bits.push(esc(rec.genre));
    return bits.join(' &nbsp;.&nbsp; ');
  }

  /* An editorial slot. Shows the text when written, or a quiet,
     clearly-marked placeholder while it is empty (pre-launch). */
  function slot(label, text, opts) {
    opts = opts || {};
    var body = String(text || '').trim();
    if (body) {
      return '<section class="l-section">' +
        '<h2 class="l-section-title">' + esc(label) + '</h2>' +
        '<div class="l-prose">' + paras(body) + '</div></section>';
    }
    if (opts.hideWhenEmpty) return '';
    return '<section class="l-section l-section-empty">' +
      '<h2 class="l-section-title">' + esc(label) + '</h2>' +
      '<div class="l-placeholder">To be written.</div></section>';
  }

  /* ---------- render: collection landing (/listen) ---------- */

  function renderLanding(gridEl, footEl) {
    fetchAll().then(function (records) {
      var list = ordered(records);
      if (!list.length) { gridEl.innerHTML = '<p class="l-empty">No certified recordings are in the public registry yet.</p>'; return; }
      gridEl.innerHTML = list.map(function (rec) {
        var c = content(rec.cep_id);
        var tag = c.disclosure ? '<span class="l-card-flag" title="Affiliation disclosed">Affiliation disclosed</span>' : '';
        return '<a class="l-card" href="/listen/record?id=' + encodeURIComponent(rec.cep_id) + '">' +
          coverHtml(rec, 'l-cover-card') +
          '<div class="l-card-body">' +
          '<div class="l-card-title">' + esc(rec.track_title) + '</div>' +
          '<div class="l-card-artist">' + esc(rec.primary_artist) + '</div>' +
          tag +
          '</div></a>';
      }).join('');
      if (footEl && list.some(function (r) { return content(r.cep_id).disclosure; })) {
        footEl.innerHTML = 'One recording in this collection is affiliated with the Institute’s founder. Its page carries the disclosure.';
        footEl.style.display = 'block';
      }
    }).catch(function () {
      gridEl.innerHTML = '<p class="l-empty">The registry could not be reached. Please try again in a moment.</p>';
    });
  }

  /* ---------- render: founding collection (/listen/collection) ---------- */

  function renderCollection(essayEl, listEl) {
    var essay = (CONTENT.collection && CONTENT.collection.essay || '').trim();
    if (essay) {
      essayEl.innerHTML = '<div class="l-prose l-essay">' + paras(essay) + '</div>';
    } else {
      essayEl.innerHTML = '<div class="l-placeholder l-essay-empty">Opening essay to be written. It explains why this collection exists and is the piece that sets the editorial apart. Write it in content.js.</div>';
    }
    fetchAll().then(function (records) {
      var list = ordered(records);
      listEl.innerHTML = list.map(function (rec, i) {
        var c = content(rec.cep_id);
        var num = ('0' + (i + 1)).slice(-2);
        var listenFor = String(c.listen_for || '').trim();
        var body = listenFor
          ? '<div class="l-prose">' + paras(listenFor) + '</div>'
          : '<div class="l-placeholder">What to listen for: to be written.</div>';
        var disc = c.disclosure
          ? '<div class="l-disclosure l-disclosure-inline"><strong>Disclosure.</strong> ' + esc(c.disclosure) + '</div>'
          : '';
        return '<article class="lx-record">' +
          '<div class="lx-record-num">' + num + '</div>' +
          coverHtml(rec, 'l-cover-issue') +
          '<div class="lx-record-body">' +
          '<h2 class="lx-record-title"><a href="/listen/record?id=' + encodeURIComponent(rec.cep_id) + '">' + esc(rec.track_title) + '</a></h2>' +
          '<div class="lx-record-artist">' + esc(rec.primary_artist) + '</div>' +
          body + disc +
          '<a class="l-more" href="/listen/record?id=' + encodeURIComponent(rec.cep_id) + '">Open the recording</a>' +
          '</div></article>';
      }).join('');
    }).catch(function () {
      listEl.innerHTML = '<p class="l-empty">The registry could not be reached. Please try again in a moment.</p>';
    });
  }

  /* ---------- render: one recording (/listen/record) ---------- */

  function getId() {
    var q = new URLSearchParams(location.search).get('id');
    if (q) return q.toUpperCase();
    var m = location.pathname.match(/(CEP-\d{4,})\/?$/i);
    return m ? m[1].toUpperCase() : null;
  }

  function renderRecord(rootEl) {
    var id = getId();
    if (!id || !/^CEP-\d{4,}$/.test(id)) {
      rootEl.innerHTML = notFound('No recording was requested.');
      return;
    }
    fetchOne(id).then(function (rec) {
      if (!rec) { rootEl.innerHTML = notFound('No certified recording with that ID is in the public registry. Recordings certified ahead of release appear on their release date.'); return; }
      document.title = rec.track_title + ' . ' + rec.primary_artist + ' | Listen | The Musical Form Institute';
      var c = content(id);
      var embed = primaryEmbed(rec);
      var support = String(c.support_url || '').trim() || rec.artist_website || '';

      var listenArea = embed
        ? '<div class="l-embed">' + embed.html + '</div>'
        : '<div class="l-embed-none">Streaming links for this recording are not listed in the registry yet.</div>';

      var supportHtml = support
        ? '<a class="l-support" href="' + esc(support) + '" target="_blank" rel="noopener">Support the artist</a>'
        : '';

      var disclosure = c.disclosure
        ? '<div class="l-disclosure"><strong>Disclosure.</strong> ' + esc(c.disclosure) + '</div>'
        : '';

      /* Optional detail rows: only shown when written. */
      var details = [];
      if (String(c.personnel || '').trim()) details.push(['Personnel', c.personnel]);
      if (String(c.recorded || '').trim()) details.push(['Recorded', c.recorded]);
      var detailHtml = details.length
        ? '<dl class="l-details">' + details.map(function (d) {
            return '<dt>' + esc(d[0]) + '</dt><dd>' + esc(d[1]) + '</dd>';
          }).join('') + '</dl>'
        : '';

      rootEl.innerHTML =
        '<a class="l-back" href="/listen">Back to Listen</a>' +
        '<div class="lr-top">' +
        '<div class="lr-cover-col">' + coverHtml(rec, 'l-cover-record') + '</div>' +
        '<div class="lr-head">' +
        '<div class="lr-eyebrow">Certificate of Embodied Production</div>' +
        '<h1 class="lr-title">' + esc(rec.track_title) + '</h1>' +
        '<div class="lr-artist">' + esc(rec.primary_artist) + '</div>' +
        (metaLine(rec) ? '<div class="lr-meta">' + metaLine(rec) + '</div>' : '') +
        '<div class="lr-claim">' + esc(CEP_CLAIM) + '</div>' +
        listenArea +
        platformLinks(rec) +
        supportHtml +
        '</div></div>' +
        disclosure +
        slot('What to listen for', c.listen_for) +
        slot('How it was made', c.story) +
        (String(c.preserved || '').trim() ? slot('What the artist kept', c.preserved, { hideWhenEmpty: true }) : '') +
        detailHtml +
        '<div class="lr-verify">' +
        '<div class="lr-verify-id">' + esc(rec.cep_id) + (rec.certification_date ? ' &nbsp;.&nbsp; Certified ' + esc(rec.certification_date) : '') + '</div>' +
        '<a class="l-verify-link" href="' + esc(verifyUrl(rec)) + '" target="_blank" rel="noopener">Verify this certification in the public registry</a>' +
        '</div>' +
        '<p class="l-scope">Certification applies to this recording only. It does not certify the artist, the label, or any other recording. The public registry is the authoritative record.</p>';
    }).catch(function () {
      rootEl.innerHTML = notFound('The registry could not be reached. Please try again in a moment.');
    });
  }

  function notFound(msg) {
    return '<a class="l-back" href="/listen">Back to Listen</a>' +
      '<div class="l-notfound"><p>' + esc(msg) + '</p>' +
      '<p><a class="l-verify-link" href="' + REGISTRY + '/cep" target="_blank" rel="noopener">Browse the public CEP registry</a></p></div>';
  }

  /* ---------- expose ---------- */

  window.LISTEN = {
    renderLanding: renderLanding,
    renderCollection: renderCollection,
    renderRecord: renderRecord
  };
})();
