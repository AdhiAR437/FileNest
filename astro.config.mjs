import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
export default defineConfig({
  site: 'https://filepebble.com',
  integrations: [react(), sitemap({ filter: (page) => !new URL(page).pathname.match(/^\/licenses\/?$/) })],
  trailingSlash: 'always',
  output: 'static',
});
