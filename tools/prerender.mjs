import { build } from 'esbuild';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const repository = process.env.GITHUB_REPOSITORY?.split('/')[1];
const base = process.env.GITHUB_ACTIONS === 'true' && repository && !repository.endsWith('.github.io') ? `/${repository}/` : '/';
await mkdir('.build', { recursive: true });
await build({entryPoints:['src/main.js'],bundle:true,platform:'node',format:'esm',outfile:'.build/render.mjs',loader:{'.css':'empty'},define:{'import.meta.env.BASE_URL':JSON.stringify(base)}});
const { getPage } = await import(pathToFileURL(path.resolve('.build/render.mjs')).href);
const routes=['','services','services/furniture','services/mattress','services/carpets','services/curtains','services/delicate','services/complex','works','works/combined','works/old-sofa','works/chemistry','prices','about','academy','journal','journal/photos','journal/price','journal/prepare','privacy'];
const template=await readFile('dist/index.html','utf8');
const escape=(str)=>str.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
for(const route of routes){
  const {html,title}=getPage(route);
  const target=path.join('dist',route);
  await mkdir(target,{recursive:true});
  const introduction=html.match(/<h1[^>]*>([\s\S]*?)<\/h1>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/);
  const description=introduction?.[2]?.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim().slice(0,210)||'Профессиональная химчистка мебели, матрасов, ковров и штор. Подход к каждой ткани и разборы реальных работ.';
  let source=template.replace('<div id="app"></div>',`<div id="app">${html}</div>`).replace(/<title>.*?<\/title>/,`<title>${escape(title)}</title>`).replace(/property="og:title" content="[^"]*"/,`property="og:title" content="${escape(title)}"`).replace(/name="description" content="[^"]*"/,`name="description" content="${escape(description)}"`).replace(/property="og:description" content="[^"]*"/,`property="og:description" content="${escape(description)}"`);
  if(process.env.SITE_URL){
    const origin=process.env.SITE_URL.replace(/\/$/,'');
    const canonical=`${origin}/${route}${route?'/':''}`;
    const schema=JSON.stringify({'@context':'https://schema.org','@type':'DryCleaningOrLaundry',name:'Чистотека',url:origin+'/',telephone:'+79099143570',email:'hello@chistoteca.ru',areaServed:['Москва','Московская область'],founder:{'@type':'Person',name:'Никита Семьянов'},sameAs:['https://t.me/chisto_academy','https://www.youtube.com/@Nikita_himchistka']});
    source=source.replace('</head>',`<link rel="canonical" href="${canonical}" /><meta property="og:url" content="${canonical}" /><meta property="og:image" content="${origin}/assets/service-01.webp" /><script type="application/ld+json">${schema}</script></head>`);
  }
  await writeFile(path.join(target,'index.html'),source);
}
const missing=getPage('404');
await writeFile('dist/404.html',template.replace('<div id="app"></div>',`<div id="app">${missing.html}</div>`).replace(/<title>.*?<\/title>/,`<title>${missing.title}</title>`));
await writeFile('dist/.nojekyll','');
if(process.env.SITE_URL){
  const origin=process.env.SITE_URL.replace(/\/$/,'');
  const xml=`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.filter(r=>r!=='privacy').map(r=>`<url><loc>${origin}/${r}${r?'/':''}</loc></url>`).join('')}</urlset>`;
  await writeFile('dist/sitemap.xml',xml);
  await writeFile('dist/robots.txt',`User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
}
console.log(`Prerendered ${routes.length} pages. Base path: ${base}`);
