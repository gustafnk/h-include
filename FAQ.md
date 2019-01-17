# Frequently asked questions

## Does `<h-include>` break SEO?

*No*, because of https://developers.google.com/search/docs/guides/rendering and https://developers.google.com/search/docs/guides/lazy-loading 

Tests:
- [Google indexes regular h-include](https://www.google.com/search?ei=reNAXJqPAYKqrgSmpY3YCg&q=site%3Ahttps%3A%2F%2Fgustafnk.github.io%2Fh-include+%22This+element+was+included%22&oq=site%3Ahttps%3A%2F%2Fgustafnk.github.io%2Fh-include+%22This+element+was+included%22&gs_l=psy-ab.3...9293.9293..10130...0.0..0.69.69.1......0....1..gws-wiz.Lr0UjtrrJBg)
- [Google indexes h-include-lazy](https://www.google.com/search?ei=BcpAXOjVG-eprgTd1IewBw&q=site%3Ahttps%3A%2F%2Fgustafnk.github.io%2Fh-include+%22This+element+was+included+by+lazy+inclusion%22&oq=site%3Ahttps%3A%2F%2Fgustafnk.github.io%2Fh-include+%22This+element+was+included+by+lazy+inclusion%22&gs_l=psy-ab.3...2480.2480..2789...0.0..0.55.55.1......0....1..gws-wiz.pSjjs2-4rII)

## Can I include fragments from other hostnames?

Yes, if the remote origin supports CORS for your hostname (like all AJAX).

## Why can't I used self-closing tags?

Because it seems like [W3C will never support Custom Elements with self-closing tags](https://github.com/w3c/webcomponents/issues/624).
