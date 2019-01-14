// Reflect.construct polyfill adopted from https://github.com/WebReflection/classtrophobic-es5
/*! (C) 2017 Andrea Giammarchi - MIT Style License */
(function() {
  var sPO = Object.setPrototypeOf ||
          function (o, p) { o.__proto__ = p; return o; };
  var hasReflect = typeof Reflect === 'object';

  if (!hasReflect) {
    Reflect = {
      construct: function (Super, args, Constructor) {
        [].unshift.call(args, Super);
        var C = Super.bind.apply(Super, args);
        return sPO(new C, Constructor.prototype);
      }
    }
  }
})();

/*
h-include.js -- HTML Includes (version 3.0.0)

MIT Style License

Copyright (c) 2016-2019 Gustaf Nilsson Kotte <gustaf.nk@gmail.com>
Copyright (c) 2005-2012 Mark Nottingham <mnot@mnot.net>

------------------------------------------------------------------------------

See http://gustafnk.github.com/h-include/ for documentation.
*/

/*jslint indent: 2, browser: true, vars: true, nomen: true, loopfunc: true */

window.HInclude = {};
window.HInclude.HIncludeElement = window.HIncludeElement = (function() {

  var tagname = 'h-include';
  var TAGNAME = tagname.toUpperCase();
  var classprefix = 'include_';

  var config = window.HIncludeConfig;

  var buffer = [];
  var outstanding = 0;

  function showContent(element, req){
    var fragment = element.getAttribute('fragment') || 'body';
    if (req.status === 200 || req.status === 304) {
      var container = element.createContainer.call(element, req);

      if (config && config.checkRecursion) {
        checkRecursion(element);
      }

      var node = element.extractFragment.call(element, container, fragment, req);
      element.replaceContent.call(element, node);
    }

    element.onEnd.call(element, req);
  }

  function setContentAsync(element, req) {
    if (req.readyState === 4) {
      showContent(element, req);
    }
  }

  function setContentBuffered(element, req) {
    if (req.readyState === 4) {
      buffer.push([element, req]);
      outstanding -= 1;
      if (outstanding === 0) {
        showBufferedContent();
      }
    }
  }

  function showBufferedContent() {
    while (buffer.length > 0) {
      var toShow = buffer.pop();

      try {
        showContent(toShow[0], toShow[1]);
      } catch(error) { // rethrow error without stopping the loop
        setTimeout(function() { throw error; });
      }
    }
  }

  var checkRecursion = function(element){
    // Check for recursion against current browser location
    if(element.getAttribute('src') === document.location.href) {
      throw new Error('Recursion not allowed');
    }

    // Check for recursion in ascendents
    var elementToCheck = element.parentNode;
    while (elementToCheck.parentNode) {
      if (elementToCheck.nodeName === TAGNAME) {

        if (element.getAttribute('src') === elementToCheck.getAttribute('src')) {
          throw new Error('Recursion not allowed');
        }
      }

      elementToCheck = elementToCheck.parentNode;
    }
  };

  var include = function(element, url, media, includeCallback) {
    if (media && window.matchMedia && !window.matchMedia(media).matches) {
      return;
    }

    var scheme = url.substring(0, url.indexOf(':'));
    if (scheme.toLowerCase() === 'data') {
      throw new Error('data URIs are not allowed');
    }

    var req = new XMLHttpRequest();

    // Check if `withCredentials` should be true
    var withCredentialsAttribute = element.getAttribute('with-credentials');
    if (withCredentialsAttribute === '' || withCredentialsAttribute === 'true') {
      req.withCredentials = true;
    }

    outstanding += 1;
    req.onreadystatechange = function () {
      includeCallback(element, req);
    };
    try {
      req.open('GET', url, true);
      req.send('');
    } catch (e) {
      outstanding -= 1;
    }
  };

  var proto = Object.create(HTMLElement.prototype);

  proto.createContainer = function(req){
    var container = document.implementation.createHTMLDocument(' ').documentElement;
    container.innerHTML = req.responseText;

    return container;
  };

  proto.extractFragment = function(container, fragment, req) {
    var node = container.querySelector(fragment);

    if (!node) {
      throw new Error('Did not find fragment in response');
    }

    return node;
  };

  proto.replaceContent = function(node) {
    this.innerHTML = node.innerHTML;
  };

  proto.onEnd = function(req) {
    var tokens = this.className.split(/\s+/);
    var otherClasses = tokens.filter(function(token){
      return !token.match(/^include_\d+$/i) && !token.match(/^included/i);
    }).join(' ');

    this.className = otherClasses + (otherClasses ? ' ' : '') +
      'included ' + classprefix + req.status;
  };

  proto.connectedCallback = function() {
    var mode = config && config.mode || 'buffered';

    var callback;
    if (mode === 'async') {
      callback = setContentAsync;
    } else if (mode === 'buffered') {
      callback = setContentBuffered;
      var timeout = config && config.timeout || 2500;
      setTimeout(showBufferedContent, timeout);
    }

    include(this, this.getAttribute('src'), this.getAttribute('media'), callback);
  };

  var refresh = function() {
    var callback = setContentBuffered;
    include(this, this.getAttribute('src'), this.getAttribute('media'), callback);
  };

  proto.refresh = refresh;

  // `customElements.define()` requires `class HIncludeElement extends HTMLElement`.
  // But that would be a syntax error in older browsers. This is our work-around.
  // See https://medium.com/@robertgrosse/how-es6-classes-really-work-and-how-to-build-your-own-fd6085eb326a
  var HIncludeElement = function() {
    return Reflect.construct(HTMLElement, arguments, HIncludeElement);
  };
  HIncludeElement.prototype = proto;
  customElements.define(tagname, HIncludeElement);
  return HIncludeElement;
})();
