import { spawnSync } from 'node:child_process';
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs';

const repo = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'diritto-commerciale';
const basePath = (process.env.GITHUB_PAGES_BASE_PATH ?? (repo.endsWith('.github.io') ? '' : `/${repo}`)).replace(/\/$/, '');
if (basePath !== '' && !/^\/[a-zA-Z0-9._/-]+$/.test(basePath)) throw new Error('Percorso GitHub Pages non valido');
const result = spawnSync(process.execPath, ['node_modules/expo/bin/cli', 'export', '--platform', 'web', '--output-dir', 'dist-pages'], {
  stdio: 'inherit',
  env: { ...process.env, GITHUB_PAGES_BASE_PATH: basePath },
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
const html = readFileSync('dist-pages/index.html', 'utf8');
if (basePath && !html.includes(`${basePath}/_expo/`)) throw new Error('Il bundle web non contiene il prefisso previsto');
copyFileSync('dist-pages/index.html', 'dist-pages/404.html');
writeFileSync('dist-pages/.nojekyll', '');
writeFileSync('dist-pages/deployment.json', JSON.stringify({ basePath }) + '\n');
console.log(`GitHub Pages pronto: dist-pages, percorso ${basePath || '/'}, fallback SPA 404.html.`);
