# gh-pages — asset host

This branch is **auto-managed**. Do not edit it by hand.

It serves the contents of `asset/` from the `main` branch via GitHub Pages so
the portfolio site (deployed on Netlify) can load images, videos, audio, and
fonts directly from a free GitHub-backed CDN.

## URL pattern

```
https://aaadityaas.github.io/Portfolio---2026/asset/<path>
```

## Updating

After changing any files inside `asset/` on `main`, run:

```bash
./scripts/sync-assets-to-gh-pages.sh
```

from the project root. The script copies the current `asset/` folder into
this branch and pushes it.
