import { defineConfig, type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'

// Custom plugin to watch markdown files and regenerate data
const watchMarkdownPlugin = () => ({
  name: 'watch-markdown',
  configureServer(server: ViteDevServer) {
    const handleFileChange = (file: string) => {
      // Use absolute paths or relative checks to ensure we only trigger on relevant files
      const normalizedFile = file.replace(/\\/g, '/')
      if (normalizedFile.endsWith('.md')) {
        if (normalizedFile.includes('/src/posts/')) {
          console.log('Post changed, regenerating posts data...')
          exec('node scripts/generate-posts-data.js', (err) => {
            if (err) console.error('Error regenerating posts:', err)
          })
        } else if (normalizedFile.includes('/src/projects/')) {
          console.log('Project changed, regenerating projects data...')
          exec('node scripts/generate-projects-data.js', (err) => {
            if (err) console.error('Error regenerating projects:', err)
          })
        }
      }
    }

    server.watcher.on('add', handleFileChange)
    server.watcher.on('change', handleFileChange)
    server.watcher.on('unlink', handleFileChange)
  }
})

const siteConfigPath = path.resolve(__dirname, 'src/site.config.ts');
const siteConfigContent = fs.readFileSync(siteConfigPath, 'utf-8');
const basePathMatch = siteConfigContent.match(/basePath:\s*["']([^"']+)["']/);
const basePath = basePathMatch ? basePathMatch[1] : '/';

// https://vite.dev/config/
export default defineConfig({
  base: basePath,
  publicDir: 'static',
  plugins: [react(), watchMarkdownPlugin()],
  build: {
    outDir: 'docs',
  }
})
