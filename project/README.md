# project-1

This folder contains the Life Science Lab Tools static site.

## Run

```bash
cd project
npm run setup
npm run dev
```

If you prefer to run directly:

```bash
cd project/apps/web
npm install
npm run dev
```

## Cloudflare Pages build

Use root commands (from `project/`):

- Build command: `npm run build`
- Output directory: `apps/web/out`

## Fast verify flow

Install once, then run test/build without reinstalling every time:

```bash
cd project
npm run setup
npm run test:fast
npm run build:fast
```

For long commands, use heartbeat wrappers (`npm run test`, `npm run build`) to print periodic progress and auto-timeout (default 900s).

Node version: 20 LTS+
