/* Preview loader: uses the compiled design-system bundle if present, otherwise compiles the component .jsx sources in the browser. Card scripts use type="text/x-ds" and read window.CLIFDS. */
(function () {
  var base = new URL('.', document.currentScript.src).href;
  var FILES = ['brand/Lockup.jsx', 'brand/SectionHeader.jsx', 'core/Button.jsx', 'core/TextLink.jsx', 'core/Tag.jsx', 'core/FilterChip.jsx',
    'data/DataPanel.jsx', 'data/KeyValueList.jsx', 'data/PublicationRow.jsx', 'navigation/ContextBar.jsx', 'navigation/SiteHeader.jsx', 'navigation/SiteFooter.jsx'];
  function fromBundle() {
    var k = Object.keys(window).find(function (k) { if (!/_[0-9a-f]{6}$/.test(k)) return false; try { return window[k] && window[k].__errors; } catch (e) { return false; } });
    return k ? window[k] : null;
  }
  function compile() {
    return Promise.all(FILES.map(function (f) { return fetch(base + f).then(function (r) { return r.text(); }); })).then(function (srcs) {
      var names = [];
      var code = srcs.map(function (s) {
        return s.replace(/^\s*import[^;]*;\s*$/gm, '').replace(/export\s+function\s+([A-Za-z0-9_]+)/g, function (_, n) { names.push(n); return 'function ' + n; });
      }).join('\n');
      code += '\nreturn {' + names.join(',') + '};';
      var out = Babel.transform(code, { presets: ['react'], parserOpts: { allowReturnOutsideFunction: true } }).code;
      return new Function('React', out)(React);
    });
  }
  function run(NS) {
    window.CLIFDS = NS;
    document.querySelectorAll('script[type="text/x-ds"]').forEach(function (s) {
      var out = Babel.transform(s.textContent, { presets: ['react'] }).code;
      new Function(out)();
    });
  }
  function start() { var b = null; try { b = fromBundle(); } catch (e) {} (b ? Promise.resolve(b) : compile()).then(run).catch(function (e) { console.error('[CLIF DS loader]', e); }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
