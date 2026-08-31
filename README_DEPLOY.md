# BuildOS Deployment

This app is a Vite React single-page app backed by Supabase.

## Environment Variables

Set these variables in your hosting provider before building:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Build Settings

- Install command: `npm ci`
- Build command: `npm run build`
- Publish directory: `dist`

For SPA routing, configure your host to rewrite all unmatched paths to `/index.html`.

## Local Verification

```bash
npm ci
npm run build
npm run preview
```
