// Reflect.construct polyfill adopted from https://github.com/WebReflection/classtrophobic-es5
/*! (C) 2017 Andrea Giammarchi - MIT Style License */
(function() {
  var sPO = Object.setPrototypeOf ||
          function (o, p) { o.__proto__ = p; return o; };
  var hasReflect = typeof Reflect === 'object';

  if (!hasReflect) {
    window.Reflect = {
      construct: function (Super, args, Constructor) {
        [].unshift.call(args, Super);
        var C = Super.bind.apply(Super, args);
        return sPO(new C, Constructor.prototype);
      }
    }
  }
})();

/*
h-include.js -- HTML Includes (version 4.3.0)

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
    if (req.status === 200 || (req.status === 304 && !element.isRefreshing)) {
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
    showContent(element, req);
  }

  function setContentBuffered(element, req) {
    buffer.push([element, req]);
    outstanding -= 1;
    if (outstanding === 0) {
      showBufferedContent();
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

  var getUrl = function(element) {
    var whenFalseUrl = element.getAttribute('when-false-src');
    var whenCondition = whenFalseUrl && !element.conditionalInclusion.call(element, 'when');
    var mediaCondition = !element.conditionalInclusion.call(element, 'media');

    return getConditionalUrl(element, whenCondition, mediaCondition, element.altSrcInclude);
  };

  var getConditionalUrl = function(element, whenCondition, mediaCondition, altSrcInclude) {
    var url = element.getAttribute('src');
    var whenFalseUrl = element.getAttribute('when-false-src');
    var altUrl = element.getAttribute('alt');

    if(altSrcInclude) {
      url = altUrl;
    }
    else {
      if(whenCondition) {
        url = whenFalseUrl;
      }
      if(mediaCondition) {
        url = null;
      }
    }
    return url;
  };

  var useAltSrcOnError = function(element, req) {
    var altUrl = element.getAttribute('alt');

    return req.status !== 200 && req.status !== 304 && altUrl && !element.altSrcInclude;
  };

  var include = function(element, includeCallback) {
    var url = getUrl(element);
    if(!url) {
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
      if (req.readyState === 4) {
        if(useAltSrcOnError(element, req)) {
          element.altSrcInclude = true;
          outstanding -= 1;
          include(element, includeCallback);
        } else {
          includeCallback(element, req);
        }
      }
    };
    try {
      req.open('GET', url, true);
      req.send('');
    } catch (e) {
      outstanding -= 1;
    }
  };

  var proto = Object.create(HTMLElement.prototype);

  function getPredicate(identifier, context) {
    var namespaces = identifier.split('.');
    var func = namespaces.pop();
    for (var i = 0; i < namespaces.length; i++) {
      context = context[namespaces[i]];
    }
    return context[func];
  }

  proto.conditionalInclusion = function(type) {
    switch (type) {
      case 'when':
        return conditionalWhen(this);
      case 'media':
        return conditionalMedia(this);
      default:
        return false;
    }
  };

  var conditionalWhen = function(element) {
    var when = element.getAttribute('when');
    if(when) {
      var predicate = getPredicate(when, window);
      if(predicate) {
        return predicate();
      } else {
        throw new Error('Predicate function not found');
      }
    }
  };

  var conditionalMedia = function(element) {
    var media = element.getAttribute('media');
    if (media && window.matchMedia && !window.matchMedia(media).matches) {
      return false;
    }
    return true;
  };

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

    this.altSrcInclude = false;
    this.isRefreshing = false;
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

    include(this, callback);
  };

  var refresh = function() {
    this.isRefreshing = true;

    var callback = setContentBuffered;
    include(this, callback);
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
