---
name: Vending Mocha
description: Instructions for adding new blog posts and projects to the site.
---

# Content Management

This guide explains how to add new content to the site.

## Blog Posts

Blog posts are located in the `posts/` directory at the project root. They are Markdown files (`.md`).

### Adding a New Post

1.  Create a new file in `posts/` with a descriptive filename (e.g., `my-new-post.md`).
2.  Add the required frontmatter at the top of the file:

```yaml
---
title: "Your Post Title"
date: "YYYY-MM-DD"
summary: "A brief summary of your post to be displayed in the list view."
---
```

3.  Write your content below the frontmatter using standard Markdown.

### Example

```markdown
---
title: "Understanding React Hooks"
date: "2024-03-15"
summary: "A deep dive into useState and useEffect."
---

# Introduction

React hooks are powerful...
```

## Projects

Projects are located in the `projects/` directory at the project root. They are Markdown files (`.md`).

### Adding a New Project

1.  Create a new file in `projects/` with a descriptive filename (e.g., `awesome-app.md`).
2.  Add the required frontmatter:

```yaml
---
title: "Project Name"
description: "A short description of what the project does."
link: "https://link-to-project.com"
status: "active" # options: "active", "inactive", "dead"
weight: 10 # Higher numbers appear first in the list
---
```

3.  (Optional) Add detailed project documentation below the frontmatter.

### Example

```markdown
---
title: "Task Master 3000"
description: "A comprehensive todo list application."
link: "https://github.com/username/task-master"
status: "active"
weight: 5
---
```

## Regeneration

The site uses scripts to generate JSON data from these Markdown files.
- `scripts/generate-posts-data.js`
- `scripts/generate-projects-data.js`

These scripts run automatically during the build process (`npm run build`). In development (`npm run dev`), the `vite.config.ts` is configured to watch for changes in these files and regenerate the data (Note: currently configured to watch `src/posts` and `src/projects`, which might need adjustment if hot-reloading isn't working for the root directories).
