import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

const isCI = process.env.GITHUB_ACTIONS === 'true';

export default defineConfig({
  site: 'https://filustrias.github.io',
  base: isCI ? '/evidencias-clinicas' : '/',
  trailingSlash: 'ignore',
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  build: {
    format: 'directory',
  },
  vite: {
    build: {
      cssCodeSplit: true,
    },
  },
});
