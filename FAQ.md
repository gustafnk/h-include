# Frequently asked questions

## Does `<h-include>` break SEO?

TBD, because of https://developers.google.com/search/docs/guides/lazy-loading

(I seems like this could work, but needs to be tested)

## Can I include fragments from other hostnames?

Yes, if the remote origin supports CORS for your hostname (like all AJAX).

## Why can't I used self-closing tags?

Because it seems like [W3C will never support Custom Elements with self-closing tags](https://github.com/w3c/webcomponents/issues/624).