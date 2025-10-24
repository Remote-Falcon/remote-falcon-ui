import posthog from 'posthog-js';

export const trackPosthogEvent = (name, data = {}) => {
  if (import.meta.env?.MODE !== 'production') {
    // eslint-disable-next-line no-console
    console.debug('[PostHog] event', name, data);
  }
  posthog.capture?.(name, data);
};

