---
title: "How to Customize Vending Mocha 🎨"
date: "2024-01-03"
summary: "A quick guide on how to update the configuration, styling, and content of your new blog."
---

# Customization Guide

So you've cloned **Vending Mocha**. What's next? Here is a quick guide to making it your own.

## 1. Update Configuration

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

## 2. Add Your Projects

Head over to `src/projects.json` and add your own projects. The schema is simple:

```json
{
    "name": "My Project",
    "description": "What is it?",
    "link": "https://github.com/...",
    "status": "active" // active, dead, inactive
}
```

## 3. Write Posts

Just add new `.md` files to `src/posts/`. The filename becomes the slug (e.g., `src/posts/my-post.md` -> `/post/my-post`).

That's it! You're ready to deploy. 🚀
