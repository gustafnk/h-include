# h-include.js

<a href="https://travis-ci.org/gustafnk/h-include"><img src="https://secure.travis-ci.org/gustafnk/h-include.png?branch=master"></a>

Declarative client-side transclusion. Perfect for Microfrontend architectures, in combination with server-side transclusion technologies like [Edge-Side Includes](https://en.wikipedia.org/wiki/Edge_Side_Includes).

Based on [hinclude.js](https://github.com/mnot/hinclude) by [@mnot](https://github.com/mnot/).

*Breaking change in version 2.0*: changed configuration mechanism to use JavaScript instead of meta tag.

## Usage

Include a document

```
<h-include src="/other/document/here.html"></h-include>
```

Include a document and extract a fragment

```
<h-include src="/other/document/here.html" fragment=".container"></h-include>
```

Refresh an h-include element

```
document.getElementsByTagName('h-include')[0].refresh()
```

## Rendering Mode

By default, each include is fetched in the background and the page is updated only when they all are available.

This is bounded by a timeout, by default five seconds. After the timeout,
h-include will show what it has and keep on listening for the remaining responses.

However, it's also possible to have h-includes become visible as they're available, see the configuration section below. While this shows the included content quicker, it may be less visually smooth.


## Other features

 - Media query support
 - Easy to inherit to create lazy loaded includes
 - Changing the @src attribute works as expected and includes a new resource

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

Throw if caught in an infinite include loop, to avoid the [Droste effect](https://en.wikipedia.org/wiki/Droste_effect):

```
HIncludeConfig = { checkRecursion: true };
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

## Media query support

It's possible to use media queries to have different fragments for different devices:

```
<h-include media="screen and (max-width: 600px)" src="small.html"></h-include>
<h-include media="screen and (min-width: 601px)" src="large.html"></h-include>
```

## Error Handling

If fetching the included URL results in a 404 Not Found status code, the class of the include element will be changed to include_404. Likewise, a 500 Server Error status code will result in the include element’s class being changed to include_500.


## Browser support

All modern browsers and IE down to IE10 is supported. If you find something quirky, please file an issue.

## On HTTP/2

Browsers with HTTP/2 are [using HTTP/2 for xhr requests as well](http://stackoverflow.com/questions/32592258/do-current-xhr-implementations-take-advantage-of-http-2). So if both the server and the current browser supports HTTP/2, all requests made with h-include will go through the same TCP connection, given that they have the same origin.

## FAQ

Please see the [FAQ](FAQ.md) for some frequently asked questions.

