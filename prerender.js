import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import prettier from 'prettier';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toAbsolute = (p) => path.resolve(__dirname, p);

async function prerender() {
    // 1. Read the template (client build output)
    const templatePath = toAbsolute('docs/index.html');
    if (!fs.existsSync(templatePath)) {
        console.error('docs/index.html not found. Run client build first.');
        process.exit(1);
    }
    const template = fs.readFileSync(templatePath, 'utf-8');

    // 2. Import the server entry (SSR build output)
    const serverEntryPath = toAbsolute('dist/server/entry-server.js');
    if (!fs.existsSync(serverEntryPath)) {
        console.error('dist/server/entry-server.js not found. Run server build first.');
        process.exit(1);
    }
    const { render } = await import(serverEntryPath);

    // 3. Determine routes to prerender
    const routesToPrerender = ['/', '/projects'];

    // Add blog post routes and pagination
    const postsPath = toAbsolute('src/posts.json');
    if (fs.existsSync(postsPath)) {
        const posts = JSON.parse(fs.readFileSync(postsPath, 'utf-8'));

        // Add post routes
        posts.forEach(post => {
            routesToPrerender.push(`/post/${post.slug}`);
        });

        // Add paginated routes
        const POSTS_PER_PAGE = 50;
        const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
        for (let i = 2; i <= totalPages; i++) {
            routesToPrerender.push(`/page/${i}`);
        }
    }

    // 4. Render and save each route
    for (const url of routesToPrerender) {
        try {
            const { html: renderedHtml, helmet } = render(url);

            let html = template.replace('<!--app-html-->', renderedHtml);

            const helmetHead = `
                ${helmet.title.toString()}
                ${helmet.meta.toString()}
                ${helmet.link.toString()}
                ${helmet.script.toString()}
                <link rel="alternate" type="application/rss+xml" title="RSS Feed for Krishna Thota" href="/rss.xml" />
            `;
            html = html.replace('<!--app-head-->', helmetHead);

            const formattedHtml = await prettier.format(html, { parser: 'html' });

            // Determine output file path
            // For '/', it is docs/index.html
            // For others, it is docs/subpath/index.html (to support clean URLs)
            let filePath = `docs${url === '/' ? '/index.html' : `${url}/index.html`}`;
            const absoluteFilePath = toAbsolute(filePath);
            const dir = path.dirname(absoluteFilePath);

            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            fs.writeFileSync(absoluteFilePath, formattedHtml);
            console.log(`Pre-rendered: ${url} -> ${filePath}`);
        } catch (e) {
            console.error(`Failed to render ${url}:`, e);
        }
    }

    // 5. Generate Sitemap
    const { siteConfig } = await import(serverEntryPath);
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${routesToPrerender.map(url => `
  <url>
    <loc>${siteConfig.url}${url === '/' ? '' : url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
  `).join('')}
</urlset>`;

    fs.writeFileSync(toAbsolute('docs/sitemap.xml'), sitemap);
    console.log('Generated sitemap.xml');
}

prerender();
