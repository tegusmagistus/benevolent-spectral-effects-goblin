/** Idempotent, additive header refinements and BSEG 011 sigil-metal finish. */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
const path='public/index.html';
for(const file of ['public/console-refinements.css','public/console-refinements.js','public/assets/header-guardian.webp','public/console-metal.css','public/assets/sigil-metal-frame.svg','public/assets/sigil-metal-rail.svg'])if(!existsSync(file))throw Error('Missing refinement asset: '+file);
let html=readFileSync(path,'utf8');
html=html.replace(/<link\s+href="console-refinements\.css[^\"]*"\s+rel="stylesheet"\s*\/?\s*>/g,'');
html=html.replace(/<link\s+href="console-metal\.css[^\"]*"\s+rel="stylesheet"\s*\/?\s*>/g,'');
html=html.replace(/<script\s+src="console-refinements\.js[^\"]*"><\/script>/g,'');
html=html.replace(/<link href="preview-window\.css" rel="stylesheet"\/>\n?/g,'');
html=html.replace('</head>','<link href="console-refinements.css?v=009" rel="stylesheet"/>\n<link href="console-metal.css?v=011" rel="stylesheet"/>\n<link href="preview-window.css" rel="stylesheet"/>\n</head>');
html=html.replace('</body>','<script src="console-refinements.js?v=009"></script>\n</body>');
html=html.replaceAll('Guardian reference','Preview');
new Function(readFileSync('public/console-refinements.js','utf8'));
writeFileSync(path,html);
console.log('BSEG 011 finish preserved.');
await import('./deep-build.mjs');
