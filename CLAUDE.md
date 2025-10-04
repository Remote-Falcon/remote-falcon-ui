# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Remote Falcon UI is a React-based web application that provides both a control panel for show owners and viewer-facing pages for public interaction with light shows. The application is built with Vite, uses Material-UI for the design system, and communicates with two backend GraphQL APIs (Control Panel and Viewer).

## Technology Stack

- **Build Tool**: Vite 6.x
- **Framework**: React 18.3
- **State Management**: Redux Toolkit with Redux Persist
- **Routing**: React Router v6
- **API Communication**: Apollo Client with multi-endpoint support
- **UI Framework**: Material-UI (MUI) v5
- **Authentication**: JWT-based with custom context
- **Testing**: Cypress for E2E tests
- **Styling**: SCSS modules + Emotion

## Development Commands

### Running the Application
```bash
npm run dev          # Start development server (Vite)
npm run serve        # Preview production build locally
```

### Building
```bash
npm run build        # Production build (sourcemaps disabled)
```

### Linting
```bash
npm run lint         # Run ESLint with auto-fix
```

### Testing
```bash
npm run cypress:open  # Open Cypress test runner UI
npm run cypress:run   # Run Cypress tests headlessly
```

### Utilities
```bash
npm run nuke-modules  # Remove node_modules directory
```

## Architecture

### Application Structure

The application has three main routing sections:
1. **LoginRoutes** - Authentication pages (login, signup, password reset, email verification)
2. **MainRoutes** - Control panel pages for show owners (protected by `AuthGuard`)
3. **ViewerRoutes** - Public-facing viewer pages (protected by `ViewerGuard`)

### Key Directories

- `src/views/pages/controlPanel/` - Control panel feature pages:
  - `dashboard/` - Main dashboard
  - `viewerSettings/` - Configure viewer experience
  - `viewerPage/` - Customize viewer page
  - `sequences/` - Manage light sequences
  - `accountSettings/` - Account management
  - `tracker/` - Analytics and tracking
  - `showsMap/` - Geographic show locations
  - `admin/` - Admin tools
  - `imageHosting/` - Image management
  - `askWattson/` - AI assistant integration

- `src/views/pages/externalViewer/` - Public viewer page
- `src/views/pages/authentication/` - Login, signup, password reset
- `src/views/pages/landing/` - Landing page

### State Management

Redux store slices:
- `show` - Show data and authentication state
- `controlPanel` - Control panel specific state
- `menu` - Navigation menu state
- `snackbar` - Global notifications
- `components` - UI component state

### API Integration

The app uses Apollo Client with `@habx/apollo-multi-endpoint-link` to communicate with two separate GraphQL APIs:
- **Control Panel API** - `/remote-falcon-control-panel` (for authenticated show owner operations)
- **Viewer API** - `/remote-falcon-viewer` (for public viewer operations)

API configuration is defined in `src/index.jsx` and uses environment variables:
- `VITE_CONTROL_PANEL_API` - Control panel API URL
- `VITE_VIEWER_API` - Viewer API URL

GraphQL queries and mutations are organized in `src/utils/graphql/`:
- `controlPanel/queries.jsx` and `controlPanel/mutations.jsx`
- `viewer/queries.jsx` and `viewer/mutations.jsx`

Each query/mutation uses the `@api(name: controlPanel)` or `@api(name: viewer)` directive to route to the correct endpoint.

### Authentication

JWT-based authentication is managed through `src/contexts/JWTContext.jsx`:
- Tokens are stored in localStorage
- Session management via `setSession()` and `setImpersonationSession()`
- Token verification via `verifyToken()`
- Support for admin impersonation

### Environment Configuration

Key environment variables in `.env`:
- `VITE_HOST_ENV` - Environment identifier (local/staging/prod)
- `VITE_CONTROL_PANEL_API` - Control panel GraphQL endpoint
- `VITE_VIEWER_API` - Viewer GraphQL endpoint
- `VITE_VIEWER_JWT_KEY` - JWT key for viewer tokens
- `VITE_GOOGLE_MAPS_KEY` - Google Maps API key
- `VITE_PUBLIC_POSTHOG_KEY` - PostHog analytics key
- `VITE_GA_TRACKING_ID` - Google Analytics tracking ID
- `VITE_VIEWER_PAGE_SUBDOMAIN` - Subdomain for viewer pages

### Theming

The app supports multiple themes defined in `src/assets/scss/`:
- Six preset themes (`_theme1.module.scss` through `_theme6.module.scss`)
- Theme variables in `_themes-vars.module.scss`
- User can customize: font family, border radius, preset color, nav type (light/dark)

### Route Guards

- `AuthGuard` - Protects control panel routes, requires valid JWT
- `ViewerGuard` - Protects viewer routes, handles viewer-specific authentication

### Lazy Loading

All page components use React.lazy() with a custom `Loadable` wrapper for code splitting.

## Deployment

### Docker
The Dockerfile in this repository is for a **different service** (appears to be a Quarkus/GraalVM native image backend), not this UI application. Ignore it when working on the UI.

### Kubernetes
Kubernetes manifests are in `k8s/manifest.yml`:
- Deployment with rolling updates
- Service (ClusterIP on port 3000)
- Ingress with two hosts (main and subdomain)
- Health checks on `/health.json`

The application expects to run on port 3000 in production.

## Important Patterns

### GraphQL Usage
Always specify the API endpoint when writing queries/mutations:
```javascript
export const MY_QUERY = gql`
  query @api(name: controlPanel) {
    myQuery {
      field
    }
  }
`;
```

### Redux Usage
Use typed hooks from the store:
```javascript
import { useDispatch, useSelector } from 'store';
```

### Component Organization
- UI components in `src/ui-component/`
- Feature-specific components in respective `src/views/pages/` subdirectories
- Shared cards and extended components in `src/ui-component/cards/` and `src/ui-component/extended/`

### Alerts and Notifications
Use global helpers from `src/views/pages/globalPageHelpers.jsx`:
- `showAlert()` - Modern alert system
- `showAlertOld()` - Legacy alert system (for compatibility)

## Testing

Cypress tests are configured with:
- Base URL: `http://localhost:3000`
- Experimental run all specs enabled
- Tests located in `cypress/` directory
