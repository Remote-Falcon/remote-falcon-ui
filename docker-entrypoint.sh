#!/bin/sh
set -eu

# Replace __RUNTIME_VITE_FOO__ sentinels in built assets with the
# matching env var ($FOO). Empty/unset vars become the empty string.
REPLACE_VARS="
HOST_ENV
VERSION
CONTROL_PANEL_API
VIEWER_API
VIEWER_JWT_KEY
GOOGLE_MAPS_KEY
PUBLIC_POSTHOG_KEY
GA_TRACKING_ID
MIXPANEL_KEY
HOSTNAME_PARTS
SWAP_CP
VIEWER_PAGE_SUBDOMAIN
GITHUB_JS_PATH
CDN_JS_PATH
CLARITY_PROJECT_ID
SOCIAL_META
"

for v in $REPLACE_VARS; do
  placeholder="__RUNTIME_VITE_${v}__"
  value="$(printenv "$v" 2>/dev/null || true)"
  esc=$(printf '%s' "$value" | sed -e 's/[\/&|]/\\&/g')
  find /app/dist -type f \( -name '*.js' -o -name '*.html' -o -name '*.css' \) -print0 \
    | xargs -0 -r sed -i "s|$placeholder|$esc|g"
done

exec serve -s /app/dist -c /app/serve.json
