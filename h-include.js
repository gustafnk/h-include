/*
h-include.js -- HTML Includes (version 2.1.0)

MIT License

Copyright (c) 2018 Gustaf Nilsson Kotte <gustaf.nk@gmail.com>
Copyright (c) 2005-2012 Mark Nottingham <mnot@mnot.net>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

------------------------------------------------------------------------------

See http://gustafnk.github.com/h-include/ for documentation.
*/

/*jslint indent: 2, browser: true, vars: true, nomen: true, loopfunc: true */
/*global alert, ActiveXObject */

window.HIncludeElement = (function() {

  var classprefix = "include_";

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

      // Register navigation
      var navigationAttribute = element.getAttribute('navigate');
      if (navigationAttribute === '' || navigationAttribute === 'true') {
        registerNavigation(element);
      }
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
      if (elementToCheck.nodeName === 'H-INCLUDE') {

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

    var scheme = url.substring(0, url.indexOf(":"));
    if (scheme.toLowerCase() === "data") {
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
      req.open("GET", url, true);
      req.send("");
    } catch (e) {
      outstanding -= 1;
    }
  };

  var getElement = function(elementArg, nodeName) {
    var element;
    element = elementArg;
    while (element.parentNode && element.nodeName !== nodeName) {
      element = element.parentNode;
    }

    if (element.nodeName === nodeName) {
      return element;
    }
  }

  var getLink = function(element) {
    var link = getElement(element, 'A');

    if (link && link.href.length !== 0) {
      return link;
    }
  };

  var getHinclude = function(element) {
    return getElement(element, 'H-INCLUDE');
  };

  var handle = function(e) {
    var link = getLink(e.target);

    if (!link) return;

    // Detect target attribute
    var targetAttribute = link.getAttribute('target');
    if (targetAttribute === '_top') {
      // Treat as regular link
      return;
    }

    // Navigate
    var href = link.href;
    if (!href) return;

    var hElement = getHinclude(e.target);
    hElement.setAttribute('src', href);

    e.preventDefault();
  };

  var registerNavigation = function(element) {
    element.addEventListener('click', handle, true);
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
      throw new Error("Did not find fragment in response");
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

  proto.attributeChangedCallback = function(attrName) {
    if (attrName === 'src') {
      this.refresh();
    }
  };

  proto.attachedCallback = function() {
    var mode = config && config.mode || 'buffered';

    var callback;
    if (mode === "async") {
      callback = setContentAsync;
    } else if (mode === "buffered") {
      callback = setContentBuffered;
      var timeout = config && config.timeout || 2500;
      setTimeout(showBufferedContent, timeout);
    }

    include(this, this.getAttribute("src"), this.getAttribute("media"), callback);
  };

  var refresh = function() {
    var callback = setContentBuffered;
    include(this, this.getAttribute("src"), this.getAttribute("media"), callback);
  };

  proto.refresh = refresh;

  return document.registerElement('h-include', {
    prototype: proto
  });
})();
