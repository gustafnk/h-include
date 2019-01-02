/*jslint indent: 2, browser: true, vars: true, nomen: true, loopfunc: true */
/*global alert, ActiveXObject */
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
