import copy from "rollup-plugin-copy";
import postcss from "rollup-plugin-postcss";
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import replace from '@rollup/plugin-replace';
import { getComponentsFolders, getCssFiles} from './scripts/buildUtils';
import generatePackageJson from 'rollup-plugin-generate-package-json';
import terser from "@rollup/plugin-terser";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import postcssUrl from 'postcss-url';

const packageJson = require('./package.json');

const commonPlugins = [
  replace({
	preventAssignment: true,
    __IS_DEV__: process.env.NODE_ENV === 'development',
  }),
  peerDepsExternal(),
  resolve(),
  commonjs(),
  terser(),
  typescript({
    tsconfig: './tsconfig.json',
    useTsconfigDeclarationDir: true,
  }),
  
  copy({
    targets: [
      {
        src: 'src/assets/*',
        dest: 'dist/assets',  // Copy assets to dist/assets
      },
      // {
      //   src: 'src/**/*.css',  // Ensure that CSS files from the source are copied
      //   dest: 'dist', // Copy them to the dist folder
      // },
    ],
  }),
];

// Returns rollup configuration for a given component
function component(commonPlugins, folder) {
  const cssFiles = getCssFiles(`src/${folder}`, ['css']);
  return {
    input: `src/${folder}/index.ts`,
    output: [
      {
        file: `dist/${folder}/index.esm.js`,
        exports: 'named',
        format: 'esm',
        banner: `'use client';`,
      },
      {
        file: `dist/${folder}/index.cjs.js`,
        exports: 'named',
        format: 'cjs',
        banner: `'use client';`,
      }
    ],
    plugins: [
      ...commonPlugins,
      postcss({
        extract: cssFiles.length > 0 ? `${cssFiles[0]}` : false,
        minimize: true,        
      }),
      generatePackageJson({
        baseContents: {
          name: `${packageJson.name}/${folder}`,
          private: true,
          main: './index.cjs.js',
          module: './index.esm.js',
          types: './index.d.ts',
          peerDependencies: packageJson.peerDependencies,
        },
        outputFolder: `dist/${folder}/`
      }),
    ],
    // Don't bundle node_modules 
    external: [/node_modules/],
  };
}

export default [
  // Build all components in ./src/*
  ...getComponentsFolders('./src').map((folder) => component(commonPlugins, folder)),

  // Build the main file that includes all components and utils
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.esm.js',
        exports: 'named',
        format: 'esm',
        banner: `'use client';`,
      },
      {
        file: 'dist/index.cjs.js',
        exports: 'named',
        format: 'cjs',
        banner: `'use client';`,
      }
    ],
    plugins: [...commonPlugins,
      postcss({
        plugins: [
          postcssUrl({
            url: 'inline', // This can be 'copy' or 'inline' depending on your needs
            useHash: true, // Optionally hash the URLs for cache busting
          })
        ],
        extract: 'styles.css', // This will extract the common styles into a global `styles.css`
        minimize: true, // Minify the CSS
      }),
    ],
     external: ["react", "react-dom", 'react-bootstrap', 'react-icons', 'react-router-dom', /node_modules/],
  },
];