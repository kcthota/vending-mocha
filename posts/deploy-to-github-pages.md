---
title: "Deploying to GitHub Pages 🚀"
date: "2026-02-17 04:00:00"
summary: "A step-by-step guide to deploying your Vending Mocha blog to GitHub Pages using GitHub Actions."
---

Deploying your Vending Mocha blog to GitHub Pages is straightforward. We'll use GitHub Actions to automatically build and deploy your site whenever you push changes to the `main` branch.

## Prerequisites

1.  A GitHub account.
2.  A Vending Mocha project pushed to a GitHub repository.

## Step 1: Configure Your Site

Open `src/site.config.ts` and ensure the `url` property matches your GitHub Pages URL.

If you are using a custom domain:
```typescript
export const siteConfig = {
    title: "My Blog",
    url: "https://www.example.com", // Your custom domain
    // ...
};
```

If you are using the default GitHub Pages URL (`username.github.io/repo-name`):
```typescript
export const siteConfig = {
    title: "My Blog",
    url: "https://username.github.io/repo-name", // REPLACE with your actual URL
    // ...
};
```

> **Important:** The `url` setting is critical for asset loading, especially if your site is hosted in a subdirectory (like `/repo-name/`).

## Step 2: Create the GitHub Actions Workflow

Create a new file in your repository at `.github/workflows/deploy.yml` and paste the following content:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
    paths-ignore:
      - 'docs/**' # Don't trigger if only the output folder changes

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build project
        run: npm run build:all

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs
          cname: your-domain.com # Optional - if you are using a custom domain
```

This workflow does the following:
1.  Triggers on every push to `main`.
2.  Sets up Node.js.
3.  Installs dependencies.
4.  Builds your site (and any sub-projects).
5.  Deploys the `docs` folder (the build output) to the `gh-pages` branch.

## Step 3: Configure GitHub Pages Settings

1.  Go to your repository on GitHub.
2.  Navigate to **Settings** > **Pages**.
3.  Under **Build and deployment**, select **Deploy from a branch**.
4.  Under **Branch**, select `gh-pages` and ensure the folder is `/ (root)`.
5.  Click **Save**.

## Step 4: Push and Verify

Commit and push your changes to GitHub:

```bash
git add .
git commit -m "Add deployment workflow"
git push origin main
```

Go to the **Actions** tab in your repository to watch the build progress. Once it completes (green checkmark), your site should be live at the URL you configured! 

Happy blogging! ☕
