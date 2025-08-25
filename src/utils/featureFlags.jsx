import { useEffect } from 'react';
import { useFeatureFlagEnabled, usePostHog } from 'posthog-js/react';

/**
 * Hook: useIsFeatureFlagEnabled
 * Evaluates a PostHog feature flag for the current user/session.
 *
 * NOTE: The PostHog browser SDK evaluates flags for the currently identified user only.
 * We accept an optional distinctId parameter to satisfy the desired API, but we do not
 * auto-identify as that would mutate global analytics identity. If your app identifies
 * users elsewhere, ensure PostHog has the correct distinct_id before using this hook.
 */
export function useIsFeatureFlagEnabled(flagName, distinctId) {
  const posthog = usePostHog?.();

  // We intentionally avoid calling posthog.identify(distinctId) here to prevent side effects.
  // This effect is just a placeholder for future extension if needed.
  useEffect(() => {
    if (!posthog) return;
    // If you ever want to identify here (not recommended automatically),
    // ensure you handle restoring previous identity and related side effects.
    // const current = posthog.get_distinct_id?.();
    // if (distinctId && current && current !== distinctId) {}
  }, [posthog, distinctId]);

  try {
    const enabled = useFeatureFlagEnabled(flagName);
    return Boolean(enabled);
  } catch (_) {
    return false;
  }
}

export default useIsFeatureFlagEnabled;
