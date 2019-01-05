/*jslint indent: 2, browser: true, vars: true, nomen: true, loopfunc: true */

// Only loads on refresh(), to be used with initLazyLoad (below)
window.HInclude.HIncludeLazyElement = (function() {
  var proto = Object.create(HInclude.HIncludeElement.prototype);

  proto.connectedCallback = function(){};

  var HIncludeLazyElement = function() {
    return Reflect.construct(HTMLElement, arguments, HIncludeLazyElement);
  };
  HIncludeLazyElement.prototype = proto;

  customElements.define('h-include-lazy', HIncludeLazyElement);
  return HIncludeLazyElement;
})();

// Imports resource fragments (containing links to scripts and styles)
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

// Import resource fragments only on refresh(), to be used with initLazyLoad (below)
window.HInclude.HImportLazyElement = (function() {
  var proto = Object.create(HInclude.HImportElement.prototype);

  proto.connectedCallback = function(){};

  var HImportLazyElement = function() {
    return Reflect.construct(HTMLElement, arguments, HImportLazyElement);
  };
  HImportLazyElement.prototype = proto;

  customElements.define('h-import-lazy', HImportLazyElement);
  return HImportLazyElement;
})();

// Lazy load elements using IntersectionObserver 
window.HInclude.initLazyLoad = function(selectorArg, configArg){
  var selector = selectorArg || 'h-include-lazy, h-import-lazy';
  var elements = Array.prototype.slice.call(document.querySelectorAll(selector));
  var config = {
    rootMargin: config && configArg.rootMargin || '400px 0px',
    threshold: config && configArg.threshold || 0.01 // 1% of the target is visible
  };

  var observer = new IntersectionObserver(onIntersection, config);
  [].forEach.call(elements, function(element) {
    observer.observe(element);
  });

  function onIntersection(entries) {
    entries.forEach(function(entry) {
      if (entry.intersectionRatio > 0) {
        observer.unobserve(entry.target);
        entry.target.refresh();
      }
    });
  }
};
