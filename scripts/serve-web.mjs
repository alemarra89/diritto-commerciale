import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
const pages = process.argv.includes('--pages');
const root = resolve(pages ? 'dist-pages' : 'dist');
const basePath = pages ? JSON.parse(readFileSync(resolve(root, 'deployment.json'), 'utf8')).basePath : '';
const port = Number(process.env.PORT || (pages ? 4174 : 4173));
const types = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.json': 'application/json', '.css': 'text/css', '.png': 'image/png', '.ico': 'image/x-icon', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg' };
createServer(async (req, res) => {
  try {
    let path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (basePath) {
      if (path === basePath) { res.writeHead(302, { Location: basePath + '/' }); res.end(); return; }
      if (!path.startsWith(basePath + '/')) { res.writeHead(404); res.end('Fuori dal percorso del sito'); return; }
      path = path.slice(basePath.length);
    }
    let target = resolve(root, '.' + path);
    let status = 200;
    if (target !== root && !target.startsWith(root + sep)) { res.writeHead(403); res.end(); return; }
    try { if (!(await stat(target)).isFile()) target = resolve(root, 'index.html'); }
    catch {
      if (!extname(path)) { target = resolve(root, pages ? '404.html' : 'index.html'); status = pages ? 404 : 200; }
    }
    const data = await readFile(target);
    res.writeHead(status, { 'Content-Type': types[extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(data);
  } catch { res.writeHead(404); res.end('Non trovato. Esegui prima npm run build:web.'); }
}).listen(port, '0.0.0.0', () => console.log(`Anteprima web: http://localhost:${port}${basePath}/`));
