import { createServer } from 'node:http';
import { readFileSync, statSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('./game',import.meta.url));
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg'};
createServer((req,res)=>{
  try {
    const url=new URL(req.url||'/', 'http://localhost');
    const file=resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
    if(!file.startsWith(root+sep)||!statSync(file).isFile())throw Error('Not found');
    res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(readFileSync(file));
  }catch{res.writeHead(404);res.end('Not found');}
}).listen(8080,'127.0.0.1',()=>console.log('Amberline Airpost at http://127.0.0.1:8080'));
