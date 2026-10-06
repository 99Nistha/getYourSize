import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ command }) => {
  if (command === 'build') {
    return {
      build: {
        lib: {
          entry: resolve(__dirname, 'src/index.js'),
          name: 'GetYourSize',
          formats: ['iife'],
          fileName: () => 'getyoursize.js',
        },
        outDir: 'dist',
        target: 'es2018',
        sourcemap: true,
      },
    };
  }

  // dev: serve the whole project so demo/ can import from src/
  return {
    server: {
      open: '/demo/html-table-chart.html',
    },
  };
});
