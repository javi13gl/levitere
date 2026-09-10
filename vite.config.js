import { defineConfig } from 'vite';

// Static single-page site. `base` is '/' for a root-domain deploy; change it
// (e.g. '/levitere/') if the site is ever served from a subpath.
export default defineConfig({
  base: '/',
  server: { host: true },
  build: {
    target: 'es2020',
    assetsInlineLimit: 0,
  },
});
