/* ============================================================
   MFI Mobile Nav
   - Injects a hamburger button into the .header on every page
   - Toggles `body.mfi-nav-open` to show/hide the mobile overlay
   - Closes when a nav link is clicked or Escape is pressed
   - All visual styling lives in styles.css (.mfi-nav-toggle and
     the @media (max-width: 900px) block)
   - Desktop is unaffected: hamburger is display:none above 900px
   ============================================================ */
(function() {
  'use strict';

  function setup() {
    var nav = document.querySelector('.header .main-nav');
    if (!nav) return;

    var container = nav.parentElement;
    if (!container) return;

    // Avoid double-injection if the script somehow runs twice.
    if (container.querySelector('.mfi-nav-toggle')) return;

    var btn = document.createElement('button');
    btn.className = 'mfi-nav-toggle';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Open menu');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'mfi-main-nav');
    btn.innerHTML = '<span></span><span></span><span></span>';

    if (!nav.id) nav.id = 'mfi-main-nav';

    container.insertBefore(btn, nav);

    function setOpen(open) {
      document.body.classList.toggle('mfi-nav-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }

    btn.addEventListener('click', function() {
      setOpen(!document.body.classList.contains('mfi-nav-open'));
    });

    nav.addEventListener('click', function(e) {
      if (e.target.tagName === 'A') setOpen(false);
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && document.body.classList.contains('mfi-nav-open')) {
        setOpen(false);
      }
    });

    // If the viewport grows past mobile while open, close the overlay.
    var mq = window.matchMedia('(min-width: 901px)');
    var handler = function(e) { if (e.matches) setOpen(false); };
    if (mq.addEventListener) mq.addEventListener('change', handler);
    else if (mq.addListener) mq.addListener(handler);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();
