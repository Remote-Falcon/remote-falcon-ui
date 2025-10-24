export const trackClarityEvent = (name, data = {}) => {
  if (typeof window !== 'undefined' && window?.clarity) {
    window.clarity('event', name, data);
  }
};

