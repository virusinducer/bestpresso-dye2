/* Bestpresso button for the DYE2 plugin. Served by the plugin at
 * /api/v1/plugins/dye2.reaplugin/bestpresso-button and loaded by the Bestpresso fork only while
 * the plugin is loaded. It draws one round button in the slot next to Sleep. */
(function () {
  if (window.__bestpressoDye2) return;

  var PLUGIN_ID = 'dye2.reaplugin';
  var STYLE_ID = 'bestpresso-dye2-style';
  var CSS =
    '.bp-dye2-btn{width:66px;height:56px;padding:0;border:0;border-radius:28px;display:flex;align-items:center;' +
    'justify-content:center;color:#fff;background:rgba(89,84,80,.8);cursor:pointer;' +
    'transition:background-color .18s ease,transform .18s ease}' +
    '.bp-dye2-btn:hover{background:rgba(108,101,96,.9)}' +
    '.bp-dye2-btn:active{transform:scale(.94)}' +
    '.bp-dye2-btn:focus-visible{outline:2px solid #53d68e;outline-offset:2px}' +
    '.bp-dye2-btn svg{width:26px;height:26px;display:block}' +
    '[data-theme="light"] .bp-dye2-btn{color:#2a2a2a;background:#dfe5dc}' +
    '[data-theme="light"] .bp-dye2-btn:hover{background:#d1dace}' +
    '@media(max-width:760px){.bp-dye2-btn{width:54px;height:48px}}';
  // A coffee bean: an ellipse with the centre crease.
  var ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" ' +
    'stroke-linejoin="round" aria-hidden="true"><ellipse cx="12" cy="12" rx="6.2" ry="9.2" ' +
    'transform="rotate(35 12 12)"/><path d="M8.4 5.6c3.6 1.6 3 4.6 1.4 6.2s-1 4.4 5.8 6.6"/></svg>';

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function openDye2(apiBase) {
    var back = encodeURIComponent(window.location.href);
    window.location.href = apiBase + '/plugins/' + PLUGIN_ID + '/dashboard?return=' + back;
  }

  function mount(slot, options) {
    ensureStyle();
    var apiBase = options.apiBase;
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'bp-dye2-btn';
    button.title = 'DYE2: beans, grinders and shots';
    button.setAttribute('aria-label', 'Open DYE2');
    button.innerHTML = ICON;
    button.addEventListener('click', function () { openDye2(apiBase); });
    slot.appendChild(button);
  }

  window.__bestpressoDye2 = { mount: mount, version: '__PLUGIN_VERSION__' };
})();
