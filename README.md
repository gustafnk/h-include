# h-include.js

<a href="https://travis-ci.org/gustafnk/h-include"><img src="https://secure.travis-ci.org/gustafnk/h-include.svg?branch=master"></a>

Declarative client-side transclusion, using [Custom Elements V1](https://developers.google.com/web/fundamentals/web-components/customelements). Perfect for [Microfrontend architectures](https://micro-frontends.org/), in combination with server-side transclusion technologies like [Edge-Side Includes](https://en.wikipedia.org/wiki/Edge_Side_Includes).

Based on [hinclude.js](https://github.com/mnot/hinclude) by [@mnot](https://github.com/mnot/).

*Breaking changes in version 3.0*:

- Because h-include is now using Custom Elements V1, we recommend that you update your polyfill (i.e. [document-register-element](https://github.com/WebReflection/document-register-element)) to the latest version.
- If you have created your own custom elements that inherit from h-include, they too need to be based on Custom Elements V1. See [EXTENDING.md](EXTENDING.md) for an example how to extend h-include.
- The `navigate` attribute is broken out into the separate element `<h-include-navigate>`, located in `lib/h-include-extensions.js`.

## Usage

Include an HTML resource like this:

```
<h-include src="/url/to/fragment.html"></h-include>
```

Each `<h-include>` element will create an AJAX request to the URL and replace the `innerHTML` of the element with the response of the request.

See [the demo page](http://gustafnk.github.com/h-include/) for live examples.

## Installation

Install using npm:

```shell
$ npm install h-include
```

Install using bower:

```shell
$ bower install h-include
```

## Rendering Mode

By default, each include is fetched in the background and the page is updated only when they all are available.

This is bounded by a timeout, by default 2500 ms. After the timeout,
h-include will show what it has and keep on listening for the remaining responses.

However, it's also possible to have responses from `<h-include>` elements become visible as they become available, by providing configuration:

```
HIncludeConfig = { mode: 'async' };
```

While this shows the included content quicker, it may be less visually smooth.

## Custom Elements polyfill

You need to use a polyfill for enabling [W3C Custom Elements](http://w3c.github.io/webcomponents/spec/custom/) for browsers not supporting Custom Elements V1.

We recommend using [document-register-element](https://github.com/WebReflection/document-register-element) (5KB minified and gzipped) as the polyfill for [W3C Custom Elements](http://w3c.github.io/webcomponents/spec/custom/).

Example:

```
<head>
  <script>this.customElements||document.write('<script src="//unpkg.com/document-register-element"><\x2fscript>');</script>
  <script type="text/javascript" src="/path/to/h-include.js"></script>
</head>
<body>
  ...
  <h-include src=">
  ...
</body>
```

## Extensions

Additional extensions are located in [`lib/h-include-extensions.js`](https://github.com/gustafnk/h-include/blob/master/lib/h-include-extensions.js) and have `lib/h-include.js` as a dependency:

```
<script type="text/javascript" src="/lib/h-include.js"></script>
<script type="text/javascript" src="/lib/h-include-extensions.js"></script>
```

All extensions inherit h-include's base behavior, when applicable.

To create your own elements that inherit from `<h-include>`, see [EXTENDING.md](EXTENDING.md).

### h-include-lazy

Only includes the HTML resource if the element is about to enter the viewport, by default 400 pixels margin, using the [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) (which needs to be polyfilled).

After page load, elements in the DOM need to registered to the Intersection Observer:

```
<script src="https://polyfill.io/v2/polyfill.min.js?features=IntersectionObserver"></script>
<script type="text/javascript" src="/lib/h-include.js"></script>
<script type="text/javascript" src="/lib/h-include-extensions.js"></script>
<script>
window.addEventListener('load', function() {
  HInclude.initLazyLoad();
});
</script>
```

Example:

```
<h-include-lazy src="fragment.html"></h-include-lazy>

...


<h-include-lazy src="lazy-loaded-fragment.html"></h-include-lazy>
```

### h-import

Request an HTML resource and include all found script and stylesheet references.

Example:

```
<h-import src="resource-fragment.html"></h-import>
```

If possible, use [Edge-Side Includes](https://en.wikipedia.org/wiki/Edge_Side_Includes) (or similar) to import statically loaded resource fragments, due to performance reasons.

To load resources, h-import and h-import-lazy call `HInclude.loadResources` with an array of urls to resources. By default, this method delegates the resource loadin to [loadjs](https://github.com/muicss/loadjs), which needs to be on the `window` object. However, `HInclude.loadResources` can be replaced with a loader of your choice.

### h-import-lazy

When lazy loading fragments, it might be the case that additional style and script resources need to be loaded as well. For example, think of a lazy loaded footer with rather specific styling. For these scenarios, use h-import-lazy.

After page load, elements in the DOM need to registered to the Intersection Observer:

```
<script src="https://polyfill.io/v2/polyfill.min.js?features=IntersectionObserver"></script>
<script type="text/javascript" src="/lib/h-include.js"></script>
<script type="text/javascript" src="/lib/h-include-extensions.js"></script>
<script>
window.addEventListener('load', function() {
  HInclude.initLazyLoad();
});
</script>
```

Example:

```
<h-include-lazy src="fragment.html"></h-include-lazy>

...


<h-import-lazy src="lazy-loaded-resource-fragment.html"></h-import-lazy>
```

## h-include-navigate

Use `<h-include-navigate>` to let link navigation events be captured by the element itself, which changes the `src` attribute and triggers a refresh.

Use `target="_top"` to let link inside `h-include` behave as a normal link.


#### Helper function: HInclude.initLazyLoad

By default, the selector for `HInclude.initLazyLoad` is `'h-include-lazy, h-import-lazy'` and the Intersection Observer `rootMargin` and `threshold` default values are `400px 0px` and `0.01` respectively. These can be overridden:

```
HInclude.initLazyLoad('css style selector', {rootMargin: '200px 0', threshold: 0.2});
```

#### Helper function: HInclude.loadResources

Load an array of script and stylesheet resources (to be overridden).

## Advanced usage

### Refresh method

Refresh an element by using the `refresh()` method:

```js
const element = document.getElementsByTagName('h-include')[0];
element.refresh();
```

### Media queries

Use media queries to have different fragments for different devices:

```
<h-include media="screen and (max-width: 600px)" src="small.html"></h-include>
<h-include media="screen and (min-width: 601px)" src="large.html"></h-include>
```

`<h-include>` will not listen to changes to screen orientation or size.

### Fragment extraction

Include an HTML resource and extract a fragment of the response by using a selector:

```
<h-include src="..." fragment=".container"></h-include>
```

### XMLHttpRequest.withCredentials

Enable [XMLHttpRequest.withCredentials](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials):
```
<h-include src="..." with-credentials></h-include>
```

## Configuration

Set buffered include timeout (default is `2500` ms):

```js
HIncludeConfig = { timeout: 10000 };
```

Set include mode to `async` (default is `buffered`):

```js
HIncludeConfig = { mode: 'async' };
```

Throw if caught in an infinite include loop (default is `false`):

```js
HIncludeConfig = { checkRecursion: true };
```

If `checkRecursion` is `true`, h-include will traverse the DOM upwards to find another h-include element with the same src attribute, until the root node. This operation takes a few CPU cycles per h-include, which is why it's not enable by default.


## Error Handling

If fetching the included URL results in a 404 Not Found status code, the class of the include element will be changed to include_404. Likewise, a 500 Server Error status code will result in the include element’s class being changed to include_500.

## Browser support

All modern browsers and IE down to IE10 are supported. If you find something quirky, please file an issue.

## HTTP/2 improves XHR performance

Browsers with HTTP/2 are [using HTTP/2 for xhr requests as well](http://stackoverflow.com/questions/32592258/do-current-xhr-implementations-take-advantage-of-http-2). So, if both the server and the current browser supports HTTP/2, all requests made with h-include will go through the same TCP connection, given that they have the same origin.

## FAQ

Please see the [FAQ](FAQ.md) for some frequently asked questions.

