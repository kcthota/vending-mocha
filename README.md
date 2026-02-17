# Vending Mocha

**Vending Mocha** is a lightweight, personal blogging framework built with React, TypeScript, and Vite. It's designed to be easily cloned and customized for your own personal website and portfolio.

## Features

- **Blog**: Support for markdown based blog posts.
- **Projects Showcase**: Easily display your projects with status indicators.
- **Responsive Design**: Clean, modern, and mobile-friendly.
- **Dark Mode**: Built-in dark mode support.
- **SEO Friendly**: Basic SEO setup included.

## CLI Usage
    
You can use the built-in CLI to easily create a new blog or upgrade an existing one.

### Create a New Blog
Run the following command to start a new project:

```bash
npx vending-mocha new my-blog
```

Follow the interactive prompts to set up your project name, title, and description.

### Upgrade an Existing Blog
To upgrade your blog to the latest version of `vending-mocha` while preserving your content and configuration:

```bash
npx vending-mocha upgrade
```

## Getting Started

1. **Navigate to the project directory:**
    ```bash
    cd my-blog
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Customize Configuration:**
    - Edit `src/site.config.ts` to update your site configuration.    
    - Add your blog posts to `posts/` in markdown format.
    - Add your projects to `/projects` in markdown format with frontmatter.

4.  **Run the development server:**
    ```bash
    npm run preview
    ```

## Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the main application for production.
- `npm run build:all`: Builds the main application and all sub-projects.
- `npm run preview`: Locally preview the production build.

## Customization

### Adding Posts
Create a new Markdown file in `posts/`. Ensure it has the required frontmatter:

```markdown
---
title: "My New Post"
date: "2024-01-01"
summary: "A brief summary of the post."
---
```

### Adding Projects
Create a new Markdown file in `/projects`. Ensure it has the required frontmatter:

```markdown
---
title: "My Project"
description: "Description of the project."
link: "https://github.com/..."
status: "active"
---
```
