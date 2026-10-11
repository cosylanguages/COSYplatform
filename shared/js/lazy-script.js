window.CosyLazy = window.CosyLazy || {};

(function() {
  const cache = new Map();

  window.CosyLazy.load = function(src) {
    if (cache.has(src)) {
      return cache.get(src);
    }

    const promise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = (err) => reject(err || new Error(`Failed to load script: ${src}`));
      (document.head || document.documentElement).appendChild(script);
    });

    cache.set(src, promise);
    return promise;
  };
})();
