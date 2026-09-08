# AGENTS.md

## Project overview
This repo is a Vite + React application for a ticket/exam flow. The main app bootstraps in `src/main.jsx` and the routing tree lives in `src/App.jsx`.

## Architecture and conventions
- Use functional React components and hooks.
- Route protection is centralized in `src/auth.jsx` via `ProtectedRoute` and `LoginRedirect`.
- Authentication state is shared through the `AuthContext` provider.
- The app uses a mocked API by default in `src/api.js` (`USE_MOCK_API = true`). When you change the mock contract, keep the real API branch consistent as well.
- Form validation is handled in `src/validation.js` and should remain the source of truth for client-side validation.
- Most page components live under `src/pages/`.

## Key files
- `src/App.jsx`: application routes and protected sections.
- `src/auth.jsx`: authentication provider, login/logout, route guards.
- `src/api.js`: mock and real API layer; session and exam operations.
- `src/validation.js`: validation helpers used by login and forms.
- `src/pages/LoginPage.jsx`: login form behavior and redirect flow.
- `package.json`: scripts and dependency versions.

## Commands
Run from the project root:
- `npm install`
- `npm run dev` — start the Vite dev server
- `npm run build` — production build validation
- `npm run preview` — preview the built app locally

## Project-specific behavior
- The default test credentials used by the mock auth flow are `username` + `password = "test1234"`.
- The app redirects unauthenticated users to `/login`.
- Authenticated users are redirected away from login to `/registro`.
- Nested protected routes are defined under the route group guarded by `ProtectedRoute`.

## Guidance for AI agents
- Prefer small, focused changes that match the existing component patterns.
- Keep behavior consistent between the mock API and the real API implementation.
- Preserve route guard semantics when editing auth or navigation.
- Prefer existing validation and state patterns before introducing new abstractions.
- Do not duplicate logic across pages when a shared hook or utility already exists.

## Related docs
- `src/App.jsx` for routing structure
- `src/auth.jsx` for authenticated flow
- `src/api.js` for persistence and API contract
