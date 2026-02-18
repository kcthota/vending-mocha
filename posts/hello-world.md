---
title: "Welcome to Vending Mocha ☕"
date: "2026-02-17 04:00:00"
summary: "Welcome to your new blogging framework! This is a sample post to get you started."
---

## Hello World!

Welcome to **Vending Mocha**! This is a sample post. You can edit this file or add new Markdown files to the `/posts` directory to start blogging.

### Features

- **Simple and Clean UI**: Minimalist design that focuses on readability.
- **Markdown Support**: write your posts in Markdown.
- **Code Highlighting**: Syntax highlighting for code blocks.
- **SSG**: Static Site Generation for optimal performance.
- **Theme Support**: Customize your blog with different themes.
- **Deployment**: Ready for GitHub Pages deployment.

### Getting Started

To create a new Vending Mocha blog, run the following command in your terminal:

```bash
npx vending-mocha new <my-blog>
```

Follow the interactive prompts to set up your blog's configuration.

### Customization Guide

So you've cloned **Vending Mocha**. What's next? Here is a quick guide to making it your own.

#### 1. Update Configuration

Open `src/site.config.ts` and update the following:

- **title**: Your name or site title.
- **description**: A short bio or site description.
- **url**: Your website URL (used for SEO).
- **theme**: Customize colors for light and dark modes.

```typescript
export const siteConfig = {
    title: "My Awesome Blog",
    // ...
}
```

#### 2. Add Your Projects

Add new `.md` files with frontmatter to `/projects/` to add your projects.

```markdown
---
title: "My Project"
description: "What is it?"
link: "https://github.com/..."
status: "active" // active, dead, inactive
weight: 5 // higher weight projects are displayed first
---
```

#### 3. Write Posts

Just add new `.md` files to `/posts/`. The filename becomes the slug (e.g., `/posts/my-post.md` -> `/post/my-post`).

Enjoy building your new site! 🚀