# EduManage Pro - School Management System

Comprehensive administrative dashboard for student, staff, academic, shareholder, attendance, examination, and financial management.

## Local Development

```bash
npm install
npm run dev
```

## Deploying to GitHub Pages

This project is pre-configured for GitHub Pages (`vite.config.ts` uses `base: './'`, `public/.nojekyll` is included, and `.github/workflows/deploy.yml` automates the build).

1. Push the full project (including `.github/workflows/deploy.yml`) to your GitHub repository's `main` branch.
2. In your GitHub repository, go to **Settings → Pages**.
3. Under **Build and deployment → Source**, select **GitHub Actions** (do **not** select "Deploy from a branch" on raw source files, as browsers cannot execute `.tsx` files directly without building `dist/`).
4. GitHub Actions will automatically run `npm run build` and publish `./dist` to GitHub Pages.
