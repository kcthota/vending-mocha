# vending-mocha

**vending-mocha** is a lightweight, personal blogging framework built with React, TypeScript, and Vite. It's designed to be easily cloned and customized for your own personal website and portfolio.

## Features

- **Blog**: Markdown-based blog posts using `react-markdown`.
- **Projects Showcase**: Easily display your projects with status indicators.
- **Responsive Design**: Clean, modern, and mobile-friendly.
- **Dark Mode**: Built-in dark mode support.
- **SEO Friendly**: Basic SEO setup included.

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/vending-mocha.git my-blog
    cd my-blog
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Customize Configuration:**
    - Edit `src/site.config.ts` to update your personal information (name, bio, links).
    - Update `src/projects.json` with your own projects.
    - Add your blog posts to `posts/`.

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

## Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the main application for production.
- `npm run build:all`: Builds the main application and all sub-projects.
- `npm run preview`: Locally preview the production build.
- `npm run serve:docs`: Serve the built documentation folder.
- `npm run lint`: Runs ESLint.

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
Edit `src/projects.json` and add a new object to the array:

```json
{
  "name": "My Project",
  "description": "Description of the project.",
  "link": "https://github.com/...",
  "status": "active"
}
```
