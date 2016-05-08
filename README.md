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

Attach an onSuccess callback

```
var onSuccess = function(){
  // ...
}

document.getElementsByTagName('h-include')[0].onSuccess = onSuccess;
```

Other features:

 - Supports sync mode (batch include, timeout based) and async mode (insert on response)
 - Changing the @src attribute works as expected and includes a new resource
 - Throws if caught in an infinite include loop, avoiding the [Droste effect](https://en.wikipedia.org/wiki/Droste_effect).

See [the demo page](http://gustafnk.github.com/h-include/) for more documentation and
examples.

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