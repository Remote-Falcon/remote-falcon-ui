# Step 1: Create the build artifacts with runtime-replaceable sentinels
FROM node:22.14.0-alpine AS build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json ./
COPY package-lock.json ./
RUN npm ci --silent

COPY . ./

# Bake sentinel values that the runtime entrypoint replaces from env vars.
# Building from source still works for local dev (env vars at runtime override).
ENV VITE_HOST_ENV=__RUNTIME_VITE_HOST_ENV__
ENV VITE_VERSION=__RUNTIME_VITE_VERSION__
ENV VITE_CONTROL_PANEL_API=__RUNTIME_VITE_CONTROL_PANEL_API__
ENV VITE_VIEWER_API=__RUNTIME_VITE_VIEWER_API__
ENV VITE_VIEWER_JWT_KEY=__RUNTIME_VITE_VIEWER_JWT_KEY__
ENV VITE_GOOGLE_MAPS_KEY=__RUNTIME_VITE_GOOGLE_MAPS_KEY__
ENV VITE_PUBLIC_POSTHOG_KEY=__RUNTIME_VITE_PUBLIC_POSTHOG_KEY__
ENV VITE_GA_TRACKING_ID=__RUNTIME_VITE_GA_TRACKING_ID__
ENV VITE_MIXPANEL_KEY=__RUNTIME_VITE_MIXPANEL_KEY__
ENV VITE_HOSTNAME_PARTS=__RUNTIME_VITE_HOSTNAME_PARTS__
ENV VITE_SWAP_CP=__RUNTIME_VITE_SWAP_CP__
ENV VITE_VIEWER_PAGE_SUBDOMAIN=__RUNTIME_VITE_VIEWER_PAGE_SUBDOMAIN__
ENV VITE_GITHUB_JS_PATH=__RUNTIME_VITE_GITHUB_JS_PATH__
ENV VITE_CDN_JS_PATH=__RUNTIME_VITE_CDN_JS_PATH__
ENV VITE_CLARITY_PROJECT_ID=__RUNTIME_VITE_CLARITY_PROJECT_ID__
ENV VITE_SOCIAL_META=__RUNTIME_VITE_SOCIAL_META__

RUN npm run build

# Step 2: Compact production image
FROM node:22.14.0-alpine AS production
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/serve.json ./serve.json
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh \
 && npm install serve -g --silent

EXPOSE 3000

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
