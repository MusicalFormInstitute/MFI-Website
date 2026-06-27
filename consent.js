/* ============================================================
   MFI Cookie Consent + Google Analytics + Google Ads loader
   - Loads Google tags (GA + Google Ads) via Consent Mode v2.
   - REGION-AWARE consent (added 2026-06):
       * EEA + UK  -> opt-IN required (GDPR / ePrivacy). Analytics and
         ad signals default DENIED, the cookie banner is shown, and they
         upgrade to granted only when the user clicks Accept.
       * US / Canada / rest of world -> opt-OUT regimes. Analytics and ad
         signals default GRANTED with no banner, so analytics and Ads
         conversion measurement work without a gate.
   - Global Privacy Control (GPC) is honored EVERYWHERE as an opt-out:
     if GPC is on and the user has not explicitly accepted, consent is
     forced denied and the banner is skipped (CCPA/CPRA).
   - The legally-critical TAG behavior is enforced by Consent Mode's
     region-scoped defaults below, which use Google's OWN geolocation.
     The timezone check is used ONLY to decide whether to render the
     banner UI, so an imperfect timezone read can never cause a
     non-consented cookie in the EEA (Google still defaults it denied).
   - User choice persists in localStorage so the banner appears once.
   ============================================================ */
(function() {
  'use strict';

  var GA_ID = 'G-VLH6Y1FM16';
  var AW_ID = 'AW-8028324232';
  var STORAGE_KEY = 'mfi_cookie_consent';
  var ACCEPT = 'granted';
  var DENY = 'denied';

  // EEA member states + EEA-EFTA (Iceland, Liechtenstein, Norway) + UK.
  // Used for the Consent Mode region-scoped default below.
  var EEA_UK_REGIONS = [
    'AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE',
    'IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE',
    'IS','LI','NO','GB'
  ];

  // dataLayer + gtag stub must exist before gtag.js loads.
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  function consentObj(state, extra) {
    var o = {
      'analytics_storage': state,
      'ad_storage': state,
      'ad_user_data': state,
      'ad_personalization': state
    };
    if (extra) { for (var k in extra) { o[k] = extra[k]; } }
    return o;
  }

  // Best-effort region check, used for BANNER visibility ONLY (see header).
  // EEA is almost entirely Europe/* timezones; UK is Europe/London;
  // Atlantic/* covers EEA island territories (Azores, Canary, Madeira, Faroe)
  // and Iceland (Atlantic/Reykjavik).
  function inConsentRequiredRegion() {
    try {
      var tz = (Intl.DateTimeFormat().resolvedOptions().timeZone || '');
      if (/^Europe\//.test(tz)) return true;
      if (/^Atlantic\/(Azores|Canary|Madeira|Faroe|Reykjavik)/.test(tz)) return true;
      return false;
    } catch (e) {
      return true; // unknown -> be safe, show the banner
    }
  }

  // Prior choice (if any) from localStorage.
  var savedChoice = null;
  try { savedChoice = localStorage.getItem(STORAGE_KEY); } catch (e) {}

  // Global Privacy Control: if on and not explicitly accepted, force deny
  // everywhere and skip the banner.
  var gpcOn = (typeof navigator !== 'undefined' && navigator.globalPrivacyControl === true);
  if (gpcOn && savedChoice !== ACCEPT) {
    savedChoice = DENY;
    try { localStorage.setItem(STORAGE_KEY, DENY); } catch (e) {}
  }

  // --- Consent Mode v2 defaults (set BEFORE gtag.js loads) ---
  if (savedChoice === ACCEPT) {
    gtag('consent', 'default', consentObj(ACCEPT));            // user opted in everywhere
  } else if (savedChoice === DENY) {
    gtag('consent', 'default', consentObj(DENY));              // explicit reject / GPC, deny everywhere
  } else {
    // No choice yet. Region-specific first (EEA/UK denied), then the
    // catch-all granted for US / Canada / rest of world.
    gtag('consent', 'default', consentObj(DENY, {
      'region': EEA_UK_REGIONS,
      'wait_for_update': 500
    }));
    gtag('consent', 'default', consentObj(ACCEPT));
  }

  // Single gtag.js load services both GA and Google Ads.
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(s);

  gtag('js', new Date());
  gtag('config', GA_ID, { 'anonymize_ip': true });
  gtag('config', AW_ID);

  // Banner: render ONLY where opt-in is required (EEA/UK) and there is no
  // prior choice. US / Canada / rest of world get no gate (already granted).
  if (savedChoice === ACCEPT || savedChoice === DENY) return;
  if (!inConsentRequiredRegion()) return;

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
