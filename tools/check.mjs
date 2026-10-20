import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const files=[];
async function walk(dir){for(const entry of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,entry.name);if(entry.isDirectory())await walk(p);else if(p.endsWith('.html'))files.push(p);}}
await walk('dist');
let linkCount=0,imageCount=0;
for(const file of files){
  const source=await readFile(file,'utf8');
  assert.equal((source.match(/<h1[ >]/g)||[]).length,1,`${file}: expected one h1`);
  const ids=[...source.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(new Set(ids).size,ids.length,`${file}: duplicate IDs`);
  for(const match of source.matchAll(/<a[^>]+href="([^"]+)"/g)){
    const href=match[1];
    if(!href.startsWith('/')||href.startsWith('//'))continue;
    const url=new URL(href,'https://example.test');
    const prefix=process.env.TEST_BASE||'/';
    const pathname=url.pathname.startsWith(prefix)?url.pathname.slice(prefix.length):url.pathname.slice(1);
    const target=path.join('dist',decodeURIComponent(pathname));
    const location=path.extname(target)?target:path.join(target,'index.html');
    await stat(location).catch(()=>assert.fail(`${file}: missing internal destination ${href}`));
    linkCount++;
  }
  for(const match of source.matchAll(/<img[^>]+src="([^"]+)"/g)){
    const src=match[1];if(!src.startsWith('/'))continue;
    const prefix=process.env.TEST_BASE||'/';
    const target=path.join('dist',src.startsWith(prefix)?src.slice(prefix.length):src.slice(1));
    await stat(target).catch(()=>assert.fail(`${file}: missing image ${src}`));imageCount++;
  }
  for(const match of source.matchAll(/<(?:link|script)[^>]+(?:href|src)="([^"]+)"/g)){
    const src=match[1];if(!src.startsWith('/')||src.startsWith('//'))continue;
    const prefix=process.env.TEST_BASE||'/';
    const target=path.join('dist',src.startsWith(prefix)?src.slice(prefix.length):src.slice(1));
    await stat(target).catch(()=>assert.fail(`${file}: missing head asset ${src}`));
  }
  assert(!source.includes('href="#/'),`${file}: hash route left in generated output`);
}
console.log(`Validated ${files.length} HTML files, ${linkCount} internal links and ${imageCount} image references.`);
