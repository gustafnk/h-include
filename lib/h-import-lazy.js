/*jslint indent: 2, browser: true, vars: true, nomen: true, loopfunc: true */
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
