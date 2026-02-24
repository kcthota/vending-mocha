---
title: "Introducing the Life in Weeks Feature ⏳"
date: "2026-02-22"
summary: "A new feature to visualize your life in weeks"
---

**Life in Weeks** ⏳. This feature allows you to visualize your entire life, past, present, and future, as a grid of small squares 🟩, where each square represents a single week.

This feature was deeply inspired by 💡: the **[Life in Weeks App](https://lifeweeks.app/)** which in turn was inspired by **[Tim Urban's Wait But Why](https://waitbutwhy.com/2014/05/life-weeks.html)**.

## 📝 How to Add Life Events

Adding your life events is simple! ✨ You just need to create Markdown files in your `life/` directory with the relevant frontmatter details. Here's a step-by-step guide:

1.  📁 **Create a file:** In your project's root folder, find the `life/` directory (create it if it doesn't exist). Create a new `.md` file inside, such as `my-birthday.md`.
2.  ✍️ **Add Frontmatter:** Open the file and add the following frontmatter at the top:

```yaml
---
title: "Turned 18!"
date: "2010-05-15" # for security reasons, we also support YYYY-MM format
color: "#0d8427ff"
description: "Finally an adult! Had a huge party with friends."
tags:
  - "milestone"
  - "birthday"
---
```

### 📋 Frontmatter Fields Explanation
- 🏷️ **`title`**: The title of the event (shown on the timeline).
- 📅 **`date`**: The date of the event in `YYYY-MM-DD` format (or just `YYYY-MM` if you only know the month).
- 🎨 **`color`** *(optional)*: A custom hex color code for this specific event's block. Defaults to a dark gray (`#333333`) if not provided. The `site.config.ts` handles light/dark mode overrides if applicable!
- 📜 **`description`** *(optional)*: A more detailed description of the event that will show up when lingering on the specific week.
- 🔖 **`tags`** *(optional)*: A list of tags categorized for your event.

Once you add the markdown file with these details, our build scripts will pick them up and update your Life in Weeks board automatically. 🚀