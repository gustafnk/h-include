/*
h-include.js -- HTML Includes (version 1.1.0)

MIT License

Copyright (c) 2016 Gustaf Nilsson Kotte <gustaf.nk@gmail.com>
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

/*jslint indent: 2, browser: true, vars: true, nomen: true */
/*global alert, ActiveXObject */

window.HIncludeElement = (function() {

  var classprefix = "include_";

  var metaCache = {};
  var buffer = [];
  var outstanding = 0;

  function show_content(element, req){
    var fragment = element.getAttribute('fragment') || 'body';
    if (req.status === 200 || req.status === 304) {
      var container = element.createContainer.call(element, req);

      checkRecursion(element);

      var node = element.extractFragment.call(element, container, fragment, req);
      element.replaceContent.call(element, node);
    }

    element.onEnd.call(element, req);
  }

  function set_content_async(element, req) {
    if (req.readyState === 4) {
      show_content(element, req);
    }
  }

  function set_content_buffered(element, req) {
    if (req.readyState === 4) {
      buffer.push([element, req]);
      outstanding -= 1;
      if (outstanding === 0) {
        show_buffered_content();
      }
    }
  }

  function show_buffered_content() {
    while (buffer.length > 0) {
      var toShow = buffer.pop();
      show_content(toShow[0], toShow[1]);
    }
  }

  function get_meta(name, value_default) {

    // Since get_meta is called on each createdCallback, we use caching
    var cached = metaCache[name];
    if (cached) {
      return cached;
    }

    var metas = document.getElementsByTagName("meta");
    for (var i = 0; i < metas.length; i += 1) {
      var meta_name = metas[i].getAttribute("name");
      if (meta_name === name) {
        var meta_value = metas[i].getAttribute("content");
        metaCache[name] = meta_value;
        return meta_value;
      }
    }
    return value_default;
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

  var include = function(element, url, media, incl_cb) {
    if (media && window.matchMedia && !window.matchMedia(media).matches) {
      return;
    }

    var scheme = url.substring(0, url.indexOf(":"));
    if (scheme.toLowerCase() === "data") {
      throw new Error('data URIs are not allowed');
    }

    var req = false;
    if (window.XMLHttpRequest) {
      try {
        req = new XMLHttpRequest();
      } catch (e1) {
        req = false;
      }
    } else if (window.ActiveXObject) {
      try {
        req = new ActiveXObject("Microsoft.XMLHTTP");
      } catch (e2) {
        req = false;
      }
    }
    if (req) {
      outstanding += 1;
      req.onreadystatechange = function () {
        incl_cb(element, req);
      };
      try {
        req.open("GET", url, true);
        req.send("");
      } catch (e3) {
        outstanding -= 1;
        alert("Include error: " + url + " (" + e3 + ")");
      }
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

    var mode = get_meta("include_mode", "buffered");

    var callback;
    if (mode === "async") {
      callback = set_content_async;
    } else if (mode === "buffered") {
      callback = set_content_buffered;
      var timeout = get_meta("include_timeout", 2.5) * 1000;
      setTimeout(show_buffered_content, timeout);
    }

    include(this, this.getAttribute("src"), this.getAttribute("media"), callback);
  };

  var refresh = function() {
    var callback = set_content_buffered;
    include(this, this.getAttribute("src"), this.getAttribute("media"), callback);
  };

  proto.refresh = refresh;

  return document.registerElement('h-include', {
    prototype: proto
  });
})();
