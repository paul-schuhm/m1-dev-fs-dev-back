import { build } from 'esbuild';

const config = {
  entryPoints: ['src/kernel.js'],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile: 'dist/server.js',
  minify: process.env.NODE_ENV === 'production',
  sourcemap: true,
  target: 'node22',
  logLevel: 'info',
  keepNames: true,
  metafile: true,
  packages: 'external', // Don't bundle node_modules
  mainFields: ['module', 'main'],
  conditions: ['import', 'module', 'default'],
};

try {
  const result = await build(config);

  console.log('Build completed successfully');

  if (result.metafile) {
    console.log('Output files:', Object.keys(result.metafile.outputs));
  }
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
