# BacRubcom

Public GitHub Pages site for `bacrub.com`.

## Runway Asset Generation

Runway API calls must run outside the browser so the API secret is never exposed
on the public site. This repo includes a manual GitHub Actions workflow that
uses the repository secret `RUNWAYML_API_SECRET`, generates a video with Runway,
downloads the output, and commits only the generated asset back to the site.

Setup:

1. In GitHub, add repository secret `RUNWAYML_API_SECRET`.
2. Open Actions -> Generate Runway Asset -> Run workflow.
3. Enter a Bacrub prompt and optional reference image URL.
4. Keep the default output path `assets/runway/latest.mp4` unless you want a named asset.

The homepage has a guarded media slot for `assets/runway/latest.mp4`. If the
file is not present, visitors see a neutral placeholder; after the workflow
commits the file, the video is shown automatically. Keep generated videos short
enough for GitHub's file size limits.

Local test:

```bash
npm test
```

Local generation, after setting `RUNWAYML_API_SECRET`:

```bash
npm run runway:generate -- --prompt "A premium Bacrub pen breathalyzer product video with a subtle blue OLED glow"
```
