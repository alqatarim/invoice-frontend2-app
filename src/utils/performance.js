// Performance monitoring utilities
export const measurePerformance = (name, fn) => {
  if (typeof window !== 'undefined' && window.performance) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`⚡ ${name}: ${(end - start).toFixed(2)}ms`);
    }
    
    return result;
  }
  return fn();
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Memory leak prevention
export const createAbortController = () => {
  if (typeof AbortController !== 'undefined') {
    return new AbortController();
  }
  return { signal: null, abort: () => {} };
};

// Bundle size optimization helper
export const preloadComponent = (componentImport) => {
  if (typeof window !== 'undefined') {
    // Preload during idle time
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        componentImport();
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        componentImport();
      }, 100);
    }
  }
};
