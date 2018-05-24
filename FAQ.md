# Frequently asked questions

## Can I include fragments from other hostnames?

Yes, if the remote origin supports CORS for your hostname (like all AJAX).

## How can I avoid a brief flash of fallback content?

It's possible to use fallback content in `<h-include>`, like this:

```
<h-include src="fragment.html">
  <a href="fallback.html">Fallback text</a>
</h-include>
```

The main use-cases would be to make it possible for browsers without JavaScript to still navigate the site. However, if not handled, fallback will be visible until the fragment request is complete and inserted in the DOM. And this behavior then degrades the experience for users with JavaScript.

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

## Why not HTML Imports?

- HTML Imports and `h-include` have different intended usages:
  - HTML Imports is mainly for loading web components
  - h-include is for HTML transclusion
- HTML Imports don't support declarative transclusion of content, you would have to build it yourself
- HTML Imports polyfills need to use eval for script execution, which breaks the [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/Security/CSP), if used
- `h-include` *doesn't* load scripts it finds in the response (it's a feature)
- The common [polyfill for HTML Imports]() is 38 KB (20 KB minified) and h-include.js is 7 KB (3 KB minified)
