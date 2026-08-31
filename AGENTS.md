# Project Setup

Last updated: 2026-08-26

Factual state of this project, for the assistant's reference. Record project
state here only — structure, installed packages, active patterns. Keep it brief.

## Stack

A **Vite + React** single-page app (JSX), styled with **Tailwind CSS v4**. The
dev server runs with live reload, so edits appear in the preview immediately —
no build or restart needed to see a change.

The app is rendered inside **React StrictMode** in dev. StrictMode
intentionally double-invokes components, effects, and state updaters (mounting
each component twice on the first render) to surface unsafe side effects. Write
code that tolerates this: effects must clean up after themselves (return a
teardown from `useEffect`), and rendering, reducers, and state updaters must be
pure — no side effects, mutation, or one-off work outside an effect. Don't treat
the double render as a bug or try to suppress it; just write idempotent,
effect-safe code and it behaves correctly in production (where StrictMode adds
no double-invocation).

Installed dependencies are managed in `package.json`: React, react-dom,
react-router-dom, Vite, @vitejs/plugin-react, lucide-react, Supabase,
Tailwind CSS v4, and @tailwindcss/vite.

## Tailwind v4 notes

This is Tailwind **v4**, not v3. Almost all utilities are identical, but:

- The stylesheet entry is `@import "tailwindcss";` (not the three `@tailwind`
  directives). Already set up in `src/index.css`.
- **Theme customization goes in `tailwind.config.cjs`** (custom colors, fonts,
  spacing under `theme.extend`). It is wired in via `@config` in `index.css` —
  edit the config file as you would in v3. You may instead define tokens with a
  `@theme { --color-brand: …; }` block in `index.css`.
- **Never add `postcss.config`, `postcss`, or `autoprefixer`** — vendor
  prefixing is built into the v4 engine. Adding them breaks the build.
- A few renamed utilities vs v3: `shadow` → `shadow-sm`, `shadow-sm` →
  `shadow-xs`, `rounded` → `rounded-sm`, `outline-none` → `outline-hidden`,
  `flex-shrink-0` → `shrink-0`, and `bg-opacity-50` → the `bg-black/50` slash
  syntax. The default border color is now `currentColor` (set one explicitly,
  e.g. `border border-gray-200`).
- Arbitrary values (`w-[473px]`, `text-[#1da1f2]`, `grid-cols-[1fr_2fr]`) work
  exactly as in v3.

## Structure

```
src/
  App.jsx      # Root component — replace with the user's app
  main.jsx     # Entry point — renders <App/> into #root, imports index.css
  index.css    # @import "tailwindcss" + @config bridge
public/
  favicon.svg  # Placeholder — replace with the user's mark
index.html
package.json · vite.config.js · tailwind.config.cjs
```

`dist/` is committed (the deploy reads from it); `node_modules/` is ignored.

## Current project: BuildOS

Construction management SaaS platform. Dark theme (#0b0f0e), Syne (display) + DM Sans (body) typefaces, electric lime accent (#e8ff4d).

### Pages (react-router, BrowserRouter in main.jsx)
- `/` — Home (hero with construction photo, features grid, AI section, testimonials)
- `/features` — Full feature breakdown by module category
- `/dashboard` — Live project dashboard demo with portfolio view + AI alert
- `/pricing` — 3-tier pricing with monthly/annual toggle, FAQ
- `/contact` — Contact form that saves to the `contact_enquiries` table
- `/signin` — Combined sign-in / create account page (AuthRoute: redirects to /app if logged in)

### App pages (protected, require auth — AppShell layout with sidebar)
- `/app` — Live dashboard (AppDashboard): KPI cards + projects + tasks + field reports from live data
- `/app/projects` — Projects list; "New Project" button goes to wizard
- `/app/projects/new` — New Project Wizard (4-step: company name → project details → tasks + assign → launch)
- `/app/tasks` — Task list with filter tabs (All / My Tasks / status), click task to open detail panel; employee posts progress updates (message + status + % complete) — updates save to task_updates and refresh dashboard
- `/app/schedule` — Schedule milestones with Add Milestone modal
- `/app/reports` — Field reports with Submit Report modal
- `/app/financials` — Budget burn overview per project
- `/app/team` — Team members list (role-gated)
- `/app/settings` — Profile editor + sign out

### Auth
- Supabase Auth handles sign-in and signup.
- `users` profile table fields: full_name, job_title, role, organization_id, phone, avatar_url, is_active, last_seen + timestamps.
- `src/lib/auth.jsx` — AuthContext with useAuth(), AuthProvider, signIn(), signUp(), signOut()
- ProtectedRoute redirects to /signin if not logged in; AuthRoute redirects to /app if already logged in.

### Data storage
- Supabase tables store app data.
- `contact_enquiries` table: name, company, email, phone, company_size, message. Public insert only.
- `task_updates` table: task_id, project_id, author_id, author_name, message, progress_pct, new_status, timestamps. Auth-required write. Employee progress updates feed directly to dashboard "Team Updates" panel.

### Assets
- `/static/stock_hero-construction-d8aa7f-0.jpg` — hero background
- `/static/stock_feature-field-c017be-0.jpg`, `-1.jpg`, `-2.jpg` — testimonial avatars

### Key files
- `src/lib/supabase.js` — shared Supabase client
- `src/lib/db.js` — small Supabase table helper for list/create/update calls
- `src/layouts/SiteLayout.jsx` — Nav + Outlet + Footer wrapper
- `src/components/Nav.jsx`, `Footer.jsx`

## Routing & asset paths

The published `dist/` is served from more than one base path (the live site at
`/`, and read-only history snapshots under a longer prefix). The build uses a
relative asset base plus a `<base href>` in `index.html` so the same output
works from any of them — so two rules keep links and assets from breaking:

- **Never hardcode root-absolute URLs** (a leading `/`) for in-app assets or
  links — `/logo.png`, `/about`, `fetch("/data.json")`. Import assets
  (`import logo from "./logo.png"`) or reference them relatively; they then
  resolve against the base automatically.
  - **Exception — `/static/…`.** Files in the project's `static/` directory are
    served by the platform at the fixed absolute URL `/static/<filename>`, which
    resolves the same on every base path (live, preview, snapshots) because it's
    mapped outside the app, not bundled into `dist/`. Reference these **exactly**
    as `/static/<file>` (e.g. `<img src="/static/photo.jpg">`) — leading slash and
    all. This is the one allowed root-absolute path. Never copy a `static/` asset
    into the app (`public/`, `src/`) and never reach it with a relative `../`
    path. (The get-image skill saves design images into `static/` and prints the
    `/static/<file>` path to use verbatim.)
- **If you add a router**, set its basename from the document base, never a
  literal `/`:

  ```jsx
  import { createBrowserRouter } from "react-router";
  // strip the trailing slash; "/" becomes "" which react-router wants
  const basename = new URL(document.baseURI).pathname.replace(/\/$/, "");
  const router = createBrowserRouter(routes, { basename });
  ```

  (or `<BrowserRouter basename={basename}>`). This makes the app mount
  correctly whether served from `/` or a longer prefix.
