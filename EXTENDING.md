# Extending h-include

Extending h-include is quite simple. Follow the pattern below and then look at the method table at the bottom of this page.

You might want to read the source code of lib/h-include.js and lib/h-include-extensions.js to know how this are connected and to get inspired.

```
(function() {
  var proto = Object.create(HInclude.HIncludeElement.prototype);

  proto.connectedCallback = function(){ ... };

  var MyOwnIncludeElement = function() {
    return Reflect.construct(HTMLElement, arguments, MyOwnIncludeElement);
  };
  MyOwnIncludeElement.prototype = proto;

  customElements.define('my-own-include', MyOwnIncludeElement);
  return MyOwnIncludeElement;
})();
```

If needed, you can also call the "super method" like this:
```
window.HInclude.HIncludeElement.prototype.methodThatWasOverridden.apply(this, arguments);
```

(Note: In h-include 3.0, `window.HIncludeElement` was moved to `window.HInclude.HIncludeElement`)

## Overridable methods

| Function | Arguments | Default behavior | Returns                                                     |
|-----------------|------------------------------|------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------|
| `createContainer` | `request` | Creates a DOM container from the request | DOM element |
| `extractFragment` | `container`, `fragment`, `request` | Queries the container with a fragment selector. The default fragment selector is 'body'. | DOM Element |
| `replaceContent`  | `fragmentElement` | Replaces the innerHTML of the element with the innerHTML of the fragmentElement | `void` |
| `onEnd`  | `request` | Add status information to the `@class` attribute of the h-include element | `void` |

