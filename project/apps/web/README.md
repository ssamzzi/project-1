# Life Science Lab Tools (Static Next.js)

## Run locally

```bash
cd project/apps/web
npm install
npm run dev
```

## Build for Cloudflare Pages

```bash
cd project/apps/web
npm install
npm run build
```

This project uses Next.js static export (`output: 'export'`), so the output folder is `out/`.

## Cloudflare Pages settings

- Framework preset: **Next.js**
- Build command: `npm run build`
- Build output directory: `out`
- Node version: **20.x** (or newer LTS)

## Deployment workflow

1. Commit code to your GitHub repository.
2. In Cloudflare Pages, create a project and connect the GitHub repo.
3. Set:
   - Branch: your production branch (ex: `main`)
   - Build command: `npm run build`
   - Build output directory: `out`
4. Deploy.

## Notes

- No server-side login/database is required.
- All calculations run in-browser and can be shared using encoded URL query state.
