# Extending h-include



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

## Overridable functions

| Function | Arguments | Default behavior | Returns                                                     |
|-----------------|------------------------------|------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------|
| `createContainer` | `request` | Creates a DOM container from the request | DOM element |
| `extractFragment` | `container`, `fragment`, `request` | Queries the container with a fragment selector. The default fragment selector is 'body'. | DOM Element |
| `replaceContent`  | `fragmentElement` | Replaces the innerHTML of the element with the innerHTML of the fragmentElement | `void` |
| `onEnd`  | `request` | Add status information to the `@class` attribute of the h-include element | `void` |

Override one or many functions by inheriting from the custom element, like this:
