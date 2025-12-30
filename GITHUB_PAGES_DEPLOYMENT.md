# GitHub Pages Deployment Guide

Deploy the AIDO Todo Frontend to GitHub Pages for free static hosting.

## Overview

The frontend is automatically deployed to GitHub Pages whenever code is pushed to the `main` branch. The application is exported as static HTML/CSS/JS and served from:

```
https://razaib-khan.github.io/Hackathon-2-Five-Phases/
```

## How It Works

### Build Process

1. **Next.js Static Export**: Frontend is built with `output: 'export'` when `GITHUB_PAGES=true`
2. **Base Path Configuration**: Assets served from `/Hackathon-2-Five-Phases/` repository path
3. **Image Optimization**: Disabled for static export (GitHub Pages can't run server functions)
4. **Trailing Slashes**: Enabled for proper routing in static context

### Deployment Workflow

The `deploy-github-pages` job in `frontend-ci.yml`:

1. ✅ Lint & Type Check (via lint job)
2. ✅ Unit Tests (via test job)
3. ✅ Build static site (Next.js export)
4. ✅ Upload artifact to GitHub Pages
5. ✅ Deploy to GitHub Pages

All steps run automatically on push to `main` branch.

## Setup Steps

### 1. Enable GitHub Pages in Repository Settings

```
Repository → Settings → Pages
├── Source: Deploy from a branch
├── Branch: gh-pages
└── Folder: / (root)
```

GitHub Actions automatically creates the `gh-pages` branch. No manual setup needed.

### 2. Configure Repository Settings

Ensure the following are enabled:
- ✅ GitHub Actions enabled (Settings > Actions)
- ✅ Pages configured to deploy from GitHub Actions
- ✅ Read and write permissions for Actions (Settings > Actions > General)

### 3. Update API URL (Optional)

In `.github/workflows/frontend-ci.yml`, update:

```yaml
NEXT_PUBLIC_API_URL: 'https://huggingface.co/spaces/YOUR_USERNAME/aido-todo-api'
```

Replace `YOUR_USERNAME` with your actual HuggingFace username.

### 4. Test Deployment

Push code to `main` branch:

```bash
git push origin main
```

Monitor deployment:
1. Go to repository > Actions tab
2. Find "Frontend CI/CD" workflow run
3. Watch the "Build & Deploy to GitHub Pages" job
4. Once complete, site is live at: `https://razaib-khan.github.io/Hackathon-2-Five-Phases/`

## Configuration Files

### frontend/next.config.js

```javascript
// GitHub Pages configuration for static export
output: process.env.GITHUB_PAGES ? 'export' : 'standalone',
basePath: process.env.GITHUB_PAGES ? '/Hackathon-2-Five-Phases' : '',
trailingSlash: true,

// Image optimization for static export
images: {
  unoptimized: process.env.GITHUB_PAGES ? true : false,
}
```

### .github/workflows/frontend-ci.yml

New `deploy-github-pages` job:
- Depends on lint and test jobs
- Only runs on `main` branch pushes
- Builds with `GITHUB_PAGES=true` flag
- Uploads to GitHub Pages via `actions/deploy-pages@v2`

### .github/workflows/deploy-github-pages.yml

Standalone workflow (alternative):
- Can be triggered manually via `workflow_dispatch`
- Separate from frontend-ci.yml
- Useful for deploying without full CI/CD pipeline

## Deployment Methods

### Method 1: Automatic (Recommended)

Push to `main` branch → Automatic deployment via `frontend-ci.yml`

```bash
git add .
git commit -m "feat: update frontend"
git push origin main
# GitHub Pages deployment starts automatically
```

### Method 2: Manual via Workflow Dispatch

Trigger deployment manually from GitHub Actions:

```
Repository → Actions → Deploy Frontend to GitHub Pages
→ Run workflow → Branch: main → Run workflow
```

## Accessing the Site

### Default URL
```
https://razaib-khan.github.io/Hackathon-2-Five-Phases/
```

### Custom Domain (Optional)

1. Configure custom domain in Settings > Pages
2. Update DNS records to point to GitHub Pages
3. SSL certificate auto-provisioned by GitHub

## Important Limitations

GitHub Pages is a **static hosting service**. These features won't work:

- ❌ Server-side rendering (Next.js getServerSideProps)
- ❌ API routes (pages/api/*)
- ❌ Dynamic image optimization (next/image without unoptimized)
- ❌ Environment variables from .env (only NEXT_PUBLIC_* available)

The current setup handles all these limitations by:
- Using static export (`output: 'export'`)
- Disabling image optimization (`unoptimized: true`)
- Only using public environment variables
- Serving all content as static files

## Troubleshooting

### Deployment Failed

Check the GitHub Actions logs:
1. Go to Actions tab
2. Select the failed workflow run
3. Click on "Build & Deploy to GitHub Pages" job
4. View logs for error details

Common issues:
- **Build failed**: Check `npm run build` output in logs
- **Upload failed**: Ensure Pages permissions are correct
- **Deploy failed**: Check GitHub Pages settings

### Site Not Loading

- **404 errors**: Check basePath is `/Hackathon-2-Five-Phases`
- **Assets not loading**: Verify images have `unoptimized` flag
- **Old content**: GitHub Pages cache can take 5-10 minutes to clear

### API Calls Not Working

- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check HuggingFace Space is running and healthy
- Verify CORS configuration on backend
- Check browser console for network errors

## Rollback

To revert to previous version:

```bash
# Find previous commit
git log --oneline | head -10

# Revert changes
git revert COMMIT_HASH

# Push to trigger redeployment
git push origin main
```

The previous version will be deployed within 1-2 minutes.

## Monitoring

### GitHub Pages Status

Visit repository Settings > Pages to check:
- ✅ Deployment status
- 📅 Last deployment time
- 🔗 Site URL
- 📋 Deployment history

### GitHub Actions

Monitor workflow runs:
1. Repository > Actions tab
2. View recent workflow runs
3. Check "Frontend CI/CD" for latest deployment status

## Performance

### Static Export Benefits

- ⚡ **Fast**: No server processing, instant page loads
- 📊 **Scalable**: Handle unlimited traffic at no cost
- 🔐 **Secure**: Only static files, no vulnerabilities
- 📱 **Mobile-friendly**: Works offline after first load

### Optimization Tips

1. **Reduce image size**: Compress images before adding to repo
2. **Code splitting**: Next.js automatically optimizes bundle
3. **Caching**: Browser caches static assets automatically
4. **CDN**: GitHub Pages uses Fastly CDN (worldwide)

## Migration from Vercel

If migrating from Vercel to GitHub Pages:

1. ✅ Already configured in `next.config.js` and workflows
2. ✅ GitHub Pages workflow is production-ready
3. Keep Vercel workflow for backup (optional)
4. GitHub Pages serves from `/Hackathon-2-Five-Phases/` path

## Next Steps

1. **Test locally**: `cd frontend && npm run build && npm start`
2. **Push to main**: Triggers automatic GitHub Pages deployment
3. **Verify site**: Visit `https://razaib-khan.github.io/Hackathon-2-Five-Phases/`
4. **Configure custom domain**: Optional, add in Settings > Pages
5. **Monitor deployments**: Check Actions tab for status

## Related Documentation

- [GitHub Pages Docs](https://docs.github.com/en/pages)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [GitHub Actions for Pages](https://github.com/actions/deploy-pages)

## Support

For issues:
1. Check GitHub Actions logs (detailed error messages)
2. Review this guide's Troubleshooting section
3. Check Next.js documentation for build issues
4. Create GitHub Issue if problem persists
