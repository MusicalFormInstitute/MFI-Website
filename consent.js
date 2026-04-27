/* ============================================================
   MFI Cookie Consent + Google Analytics + Google Ads loader
   - Loads Google tags (GA + Google Ads) on every page that
     includes this script.
   - Uses Google Consent Mode v2: storage and ad signals load
     denied by default, then upgrade to granted together when
     the user clicks Accept on the cookie banner.
   - User choice (granted | denied) is persisted in localStorage
     so the banner only appears once per device.
   - Respects the browser's Global Privacy Control (GPC) signal:
     if GPC is on, the banner does not appear and consent stays
     denied (matches the Privacy Policy section 7).
   - Self-contained: no external CSS, builds banner HTML at
     runtime, attaches to body.
   ============================================================ */
(function() {
  'use strict';

  var GA_ID = 'G-3KDMLQS97C';
  var AW_ID = 'AW-8028324232';
  var STORAGE_KEY = 'mfi_cookie_consent';
  var ACCEPT = 'granted';
  var DENY = 'denied';

  // dataLayer + gtag stub must exist before gtag.js loads.
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  // Read prior choice (if any) from localStorage.
  var savedChoice = null;
  try { savedChoice = localStorage.getItem(STORAGE_KEY); } catch (e) {}

  // Honor Global Privacy Control: if GPC signal is on and the user
  // has not explicitly accepted yet, treat as a deny choice and skip
  // the banner entirely.
  var gpcOn = (typeof navigator !== 'undefined' && navigator.globalPrivacyControl === true);
  if (gpcOn && savedChoice !== ACCEPT) {
    savedChoice = DENY;
    try { localStorage.setItem(STORAGE_KEY, DENY); } catch (e) {}
  }

  // Initial consent state. Accept grants both analytics and ad signals
  // together; Reject (or no choice yet) keeps both denied.
  var initialState = (savedChoice === ACCEPT) ? ACCEPT : DENY;

  // Set Consent Mode default BEFORE loading gtag.js.
  gtag('consent', 'default', {
    'analytics_storage': initialState,
    'ad_storage': initialState,
    'ad_user_data': initialState,
    'ad_personalization': initialState,
    'wait_for_update': 500
  });

  // A single gtag.js load services both the GA and Google Ads tags.
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(s);

  gtag('js', new Date());
  gtag('config', GA_ID, { 'anonymize_ip': true });
  gtag('config', AW_ID);

  // If the user has already chosen, do not render the banner.
  if (savedChoice === ACCEPT || savedChoice === DENY) return;

  // Build banner styles + HTML and append to body when DOM is ready.
  function showBanner() {
    var style = document.createElement('style');
    style.textContent = [
      '#mfi-cookie-banner {',
      '  position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999;',
      '  background: #1a1a1a; color: #fff;',
      '  font-family: "Poppins", sans-serif; font-size: 13px; line-height: 1.55;',
      '  border-top: 3px solid #DF693B;',
      '  box-shadow: 0 -4px 16px rgba(0,0,0,0.18);',
      '  padding: 18px 24px;',
      '}',
      '#mfi-cookie-banner-inner {',
      '  max-width: 1200px; margin: 0 auto;',
      '  display: flex; align-items: center; gap: 24px; flex-wrap: wrap;',
      '}',
      '#mfi-cookie-banner-text { flex: 1 1 320px; min-width: 0; }',
      '#mfi-cookie-banner-text strong { color: #fff; font-weight: 700; margin-right: 4px; }',
      '#mfi-cookie-banner-text a { color: #5D92CD; text-decoration: underline; }',
      '#mfi-cookie-banner-actions { display: flex; gap: 8px; flex-shrink: 0; }',
      '.mfi-cb-btn {',
      '  padding: 9px 18px; border-radius: 4px; border: 1px solid transparent;',
      '  font-family: inherit; font-size: 13px; font-weight: 600;',
      '  letter-spacing: 0.3px; cursor: pointer; transition: opacity 0.15s;',
      '  white-space: nowrap;',
      '}',
      '.mfi-cb-btn:hover { opacity: 0.85; }',
      '.mfi-cb-accept { background: #DF693B; color: #fff; }',
      '.mfi-cb-reject { background: transparent; color: #fff; border-color: rgba(255,255,255,0.3); }',
      '@media (max-width: 640px) {',
      '  #mfi-cookie-banner { padding: 14px 16px; }',
      '  #mfi-cookie-banner-inner { gap: 14px; }',
      '  #mfi-cookie-banner-actions { width: 100%; }',
      '  .mfi-cb-btn { flex: 1; padding: 11px 14px; }',
      '}'
    ].join('\n');
    document.head.appendChild(style);

    var bar = document.createElement('div');
    bar.id = 'mfi-cookie-banner';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-label', 'Cookie consent');
    bar.innerHTML =
      '<div id="mfi-cookie-banner-inner">' +
        '<div id="mfi-cookie-banner-text">' +
          '<strong>Cookies.</strong>' +
          'We use Google Analytics and Google Ads cookies to measure how visitors use the Site and to attribute conversions from our advertising. ' +
          'No personal information sold. ' +
          'See our <a href="/privacy">Privacy Policy</a> for detail.' +
        '</div>' +
        '<div id="mfi-cookie-banner-actions">' +
          '<button class="mfi-cb-btn mfi-cb-reject" id="mfi-consent-reject" type="button">Reject</button>' +
          '<button class="mfi-cb-btn mfi-cb-accept" id="mfi-consent-accept" type="button">Accept</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(bar);

    document.getElementById('mfi-consent-accept').addEventListener('click', function() {
      try { localStorage.setItem(STORAGE_KEY, ACCEPT); } catch (e) {}
      gtag('consent', 'update', {
        'analytics_storage': ACCEPT,
        'ad_storage': ACCEPT,
        'ad_user_data': ACCEPT,
        'ad_personalization': ACCEPT
      });
      bar.parentNode.removeChild(bar);
    });

    document.getElementById('mfi-consent-reject').addEventListener('click', function() {
      try { localStorage.setItem(STORAGE_KEY, DENY); } catch (e) {}
      // Consent stays denied. No update needed.
      bar.parentNode.removeChild(bar);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showBanner);
  } else {
    showBanner();
  }
})();
