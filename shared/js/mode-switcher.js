/**
 * Founder-only workspace mode switcher.
 *
 * Vimbox-style platforms let one person act as a student, a teacher or an
 * administrator. In COSYplatform that cross-mode switch is reserved for the
 * founder role. Students and teachers never see these links; direct URLs stay
 * protected by each page's role guard.
 */
(function () {
  'use strict';

  var MODES = {
    student: { label: 'Student', icon: '🎓', href: 'student.html' },
    teacher: { label: 'Teacher', icon: '🧑‍🏫', href: 'teacher.html' },
    founder: { label: 'Founder', icon: '👑', href: 'founder.html' }
  };
  var STYLE_ID = 'cosy-mode-switcher-styles';

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '.cosy-mode-switcher{display:inline-flex;align-items:center;gap:6px;flex-wrap:wrap;}',
      '.cosy-mode-switcher__label{font-size:0.68rem;font-weight:800;letter-spacing:0.07em;text-transform:uppercase;opacity:0.65;margin-right:2px;}',
      '.cosy-mode-switcher__chip{display:inline-flex;align-items:center;gap:4px;padding:5px 10px;border-radius:999px;border:1px solid rgba(148,163,184,0.4);background:rgba(148,163,184,0.12);color:inherit;text-decoration:none;font-size:0.76rem;font-weight:800;line-height:1;transition:background 0.15s ease,border-color 0.15s ease,transform 0.15s ease;}',
      '.cosy-mode-switcher__chip:hover{border-color:var(--cosy-platform-accent,#0369a1);transform:translateY(-1px);}',
      '.cosy-mode-switcher__chip.is-active{background:var(--cosy-platform-accent,#0369a1);border-color:var(--cosy-platform-accent,#0369a1);color:#fff;}'
    ].join('');
    document.head.appendChild(style);
  }

  function mount(target, options) {
    var element = typeof target === 'string' ? document.querySelector(target) : target;
    if (!element) return null;

    var role = String((options && options.role) || '').toLowerCase();
    if (role !== 'founder') {
      element.hidden = true;
      element.innerHTML = '';
      return null;
    }

    var active = String((options && options.active) || '').toLowerCase();
    injectStyles();
    element.hidden = false;
    element.className = 'cosy-mode-switcher';
    element.setAttribute('role', 'navigation');
    element.setAttribute('aria-label', 'Switch workspace mode');

    element.innerHTML = '<span class="cosy-mode-switcher__label">View as</span>' +
      Object.keys(MODES).map(function (key) {
        var mode = MODES[key];
        var isActive = key === active;
        return '<a class="cosy-mode-switcher__chip' + (isActive ? ' is-active' : '') + '" href="' +
          mode.href + '"' + (isActive ? ' aria-current="page"' : '') + '>' +
          mode.icon + ' ' + mode.label + '</a>';
      }).join('');

    return element;
  }

  window.CosyModeSwitcher = { MODES: MODES, mount: mount };
})();
