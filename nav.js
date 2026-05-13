/* ============================================================
   MFI Nav
   - Injects a hamburger button into the .header on every page
   - Toggles `body.mfi-nav-open` to show/hide the mobile overlay
   - Handles desktop dropdown clicks (touch/keyboard accessible)
   - Closes when a nav link is clicked or Escape is pressed
   - Visual styling lives in styles.css
   ============================================================ */
(function() {
  'use strict';

  function setupMobileToggle() {
    var nav = document.querySelector('.header .main-nav');
    if (!nav) return;
    var container = nav.parentElement;
    if (!container) return;
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

    var mq = window.matchMedia('(min-width: 901px)');
    var handler = function(e) { if (e.matches) setOpen(false); };
    if (mq.addEventListener) mq.addEventListener('change', handler);
    else if (mq.addListener) mq.addListener(handler);
  }

  function setupDropdowns() {
    var items = document.querySelectorAll('.main-nav .nav-has-dropdown');
    if (!items.length) return;

    // Close all open dropdowns
    function closeAll() {
      items.forEach(function(item) { item.classList.remove('is-open'); });
    }

    items.forEach(function(item) {
      var link = item.querySelector(':scope > .nav-link');
      if (!link) return;

      // Keyboard: Enter/Space toggles dropdown on the parent link
      link.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          // Let the link navigate on Enter; but Space toggles dropdown
          if (e.key === ' ') {
            e.preventDefault();
            var wasOpen = item.classList.contains('is-open');
            closeAll();
            if (!wasOpen) item.classList.add('is-open');
          }
        } else if (e.key === 'Escape') {
          item.classList.remove('is-open');
          link.blur();
        }
      });

      // Touch devices (no hover): first tap on parent expands, second tap follows link
      // Detect via pointer events
      link.addEventListener('click', function(e) {
        // Only on screens that don't support hover (touch-primary devices)
        if (!window.matchMedia('(hover: none)').matches) return;
        if (window.innerWidth <= 900) return; // mobile uses flat menu
        if (!item.classList.contains('is-open')) {
          e.preventDefault();
          closeAll();
          item.classList.add('is-open');
        }
        // else: second tap, allow link to navigate normally
      });
    });

    // Click outside any dropdown closes them all
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.nav-has-dropdown')) closeAll();
    });
  }

  function setup() {
    setupMobileToggle();
    setupDropdowns();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();
