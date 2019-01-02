// Lazy load elements using IntersectionObserver  
window.HInclude.initLazyLoad = function(selectorArg, config){
  var selector = selectorArg || 'h-include-lazy';
  var elements = Array.prototype.slice.call(document.querySelectorAll(selector));
  var config = {
    rootMargin: config && config.rootMargin || '400px 0px',
    threshold: config && config.threshold || 0.01 // 1% of the target is visible
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
}
