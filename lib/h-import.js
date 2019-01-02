/*jslint indent: 2, browser: true, vars: true, nomen: true, loopfunc: true */
window.HInclude.HImportElement = (function() {
  var proto = Object.create(HInclude.HIncludeElement.prototype);

  proto.createContainer = function(req){
    var container = document.implementation.createHTMLDocument(' ').documentElement;
    container.innerHTML = req.responseText;

    var importableElements =
      Array.prototype.slice.call(container.querySelectorAll('script, link'));

    var urls = importableElements.map(function(element) {
      if (element.tagName === 'SCRIPT') {
        return element.src;
      } else if (
          element.tagName === 'LINK' &&
          element.rel &&
          element.rel.toLowerCase() === 'stylesheet') {
        return element.href;
      }
    });

    loadjs(urls, {
      async: false,
    });

    return container;
  };

  proto.replaceContent = function(node) {};

  var HImportElement = function() {
    return Reflect.construct(HTMLElement, arguments, HImportElement);
  };
  HImportElement.prototype = proto;

  customElements.define('h-import', HImportElement);
  return HImportElement;
})();
