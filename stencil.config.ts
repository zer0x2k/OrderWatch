import { Config } from '@stencil/core';
import { postcss } from '@stencil-community/postcss';
import autoprefixer from 'autoprefixer';
import tailwindcss from 'tailwindcss';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import tailwind, { tailwindHMR, tailwindGlobal } from 'stencil-tailwind-plugin';
import tailwindConfig from './tailwind.config';

export const config: Config = {
  globalStyle: 'src/global/app.css',
  globalScript: 'src/global/app.ts',
  taskQueue: 'async',
  outputTargets: [
    {
      type: 'www',
      // comment the following line to disable service workers in production
      serviceWorker: null,
      baseUrl: 'https://myapp.local/',
      copy: [{ src: '../node_modules/ccxt/dist/ccxt.browser.js', dest: 'assets/cctx.js' }],
    },
  ],
  plugins: [
    tailwind({
      tailwindConf: tailwindConfig,
      //tailwindCssPath: './src/global/app.css'
    }),
    tailwindHMR({
      tailwindConf: tailwindConfig,
    }),
  ],
  rollupPlugins: {
    after: [nodePolyfills()],
  },
};
