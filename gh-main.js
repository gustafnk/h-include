// Lazy load h-include-lazy elements using IntersectionObserver
window.addEventListener('load', function() {
  var elements = document.getElementsByTagName('h-include-lazy');
  var config = {
    rootMargin: '400px 0px',
    threshold: 0.01 // 1% of the target is visible
  };

  var observer = new IntersectionObserver(onIntersection, config);
  [].forEach.call(elements, function(element) {
    observer.observe(element);
  });

  function onIntersection(entries) {
    entries.forEach(function(entry) {
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