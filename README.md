# h-include.js

<a href="https://travis-ci.org/gustafnk/h-include"><img src="https://secure.travis-ci.org/gustafnk/h-include.png?branch=master"></a>

Tired of regenerating HTML pages from templates? Want more from Web caches?
*h-include* makes one thing very easy; including other bits of HTML into your
Web page, _using the browser_.

h-include is declarative client-side inclusion for the Web; it allows easy
composition of Web pages using the browser -- making your pages more modular,
more cacheable, and easier to maintain. 

Based on [hinclude.js](https://github.com/mnot/hinclude) by [@mnot](https://github.com/mnot/).

## Usage

Include a document

```
<h-include src="/other/document/here.html"></h-include>
```

Include a document and extract a fragment

```
<h-include src="/other/document/here.html" fragment=".container"></h-include>
```

Include a document on another origin (needs CORS)

```
<h-include src="http://other-origin.org/some/document/here.html"></h-include>
```

Refresh an h-include element

```
document.getElementsByTagName('h-include')[0].refresh()
```

## Other features

 - Supports sync mode (batch include, timeout based) and async mode (insert on response)
 - Changing the @src attribute works as expected and includes a new resource
 - Throws if caught in an infinite include loop, avoiding the [Droste effect](https://en.wikipedia.org/wiki/Droste_effect).

See [the demo page](http://gustafnk.github.com/h-include/) for more documentation and
examples.

## Configuration

Set buffered include timeout (default is `2500` ms):

```
HIncludeConfig = { timeout: 10000 };
```

Set include mode to `async` (default is `buffered`):

```
HIncludeConfig = { mode: 'async' };
```

## Installation

Install using npm:

```shell
$ npm install h-include
```

Install using bower:

```shell
$ bower install h-include
```

## Dependencies

h-include provides a custom element `<h-include>`. This means that you have
to use a polyfill for enabling [W3C Custom Elements](http://w3c.github.io/webcomponents/spec/custom/) for browsers not supporting it.

We recommend using [document-register-element](https://github.com/WebReflection/document-register-element) (3KB) as the polyfill for [W3C Custom Elements](http://w3c.github.io/webcomponents/spec/custom/).

## Overridable function on the custom element

| Function | Arguments | Default behavior | Example override use case                                                     |
|-----------------|------------------------------|------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------|
| `createContainer` | `request` | Creates a DOM container from the request | Loop through links to resources and  replace relative URLs with absolute URLs |
| `extractFragment` | `container`, `fragment`, `request` | Queries the container with a fragment selector. The default fragment selector is 'body'. | Improved error handling if fragment doesn't match |
| `replaceContent`  | `fragmentElement` | Replaces the innerHTML of the element with the innerHTML of the fragmentElement | DOM diffing |
| `onEnd`  | `request` | Add status information to the `@class` attribute of the h-include element | |

Override one or many functions by inheriting from the custom element, like this:

```
var proto = Object.create(HIncludeElement.prototype);

proto.onEnd = function(req){
  HIncludeElement.prototype.onEnd.apply(this, arguments); // call super

  // your code here
}

document.registerElement('h-include-improved', {
  prototype: proto,
});
```

## Lazy loading example

```
window.addEventListener('load', function() {
  var elements = document.getElementsByTagName('h-include-lazy');
  var config = {
    rootMargin: '400px 0px',
    threshold: 0.01 // 1% of the target is visible
  };

  var observer = new IntersectionObserver(onIntersection, config);
  [].forEach.call(elements, element => {
    observer.observe(element);
  });

  function onIntersection(entries) {
    entries.forEach(entry => {
      if (entry.intersectionRatio > 0) {
        observer.unobserve(entry.target);
        entry.target.refresh();
      }
    });
  }
});

var proto = Object.create(HIncludeElement.prototype);

proto.attachedCallback = function(){}

document.registerElement('h-include-lazy', {
  prototype: proto,
});
```

## How to avoid a brief flash of fallback content

Put this code before the first `h-include` or in the `<head>` element.

```
<script>
  <!-- https://gist.github.com/egeorjon/6755681 -->
  document.documentElement.className = document.documentElement.className.replace( /(?:^|\s)no-script(?!\S)/g , '' )
</script>

<style>
  h-include:not(.included) {
    visibility: hidden;
  }
  .no-script h-include, h-include.included {
    visibility: visible;
  }
</style>
```

## Does this break SEO

Yes, client-side transclusion suffers from all problems with client-side-only rendering. You should not use it for SEO sensitive content. That being said, SEO value could be a lot less below-the-fold, which opens up for lazy loading possibilities, etc.

## Browser support

All modern browsers and IE down to IE10 is supported. If you find something quirky, please file an issue.

## On HTTP/2

Browsers with HTTP/2 are [using HTTP/2 for xhr requests as well](http://stackoverflow.com/questions/32592258/do-current-xhr-implementations-take-advantage-of-http-2). So if both the server and the current browser supports HTTP/2, all requests made with h-include will go through the same TCP connection, given that they have the same origin.

## Why not HTML Imports?

- HTML Imports and h-include have different intended usages:
  - HTML Imports is mainly for loading web components
  - h-include is for HTML transclusion
- HTML Imports don't support declarative transclusion of content, you would have to build it yourself
- HTML Imports polyfills need to use eval for script execution, which breaks the [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/Security/CSP), if used
- h-include *doesn't* load scripts it finds in the response (it's a feature)
- The common [polyfill for HTML Imports]() is 38 KB (20 KB minified) and h-include.js is 7 KB (3 KB minified)
