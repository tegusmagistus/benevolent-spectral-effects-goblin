/** Idempotent, additive BSEG 009 appearance/scroll refinements. */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
const path='public/index.html';
for(const file of ['public/console-refinements.css','public/console-refinements.js','public/assets/header-guardian.webp'])if(!existsSync(file))throw Error('Missing refinement asset: '+file);
let html=readFileSync(path,'utf8');
html=html.replace(/<link\s+href="console-refinements\.css[^\"]*"\s+rel="stylesheet"\s*\/?\s*>/g,'');
html=html.replace(/<script\s+src="console-refinements\.js[^\"]*"><\/script>/g,'');
html=html.replace('</head>','<link href="console-refinements.css?v=009" rel="stylesheet"/>\n</head>');
html=html.replace('</body>','<script src="console-refinements.js?v=009"></script>\n</body>');
new Function(readFileSync('public/console-refinements.js','utf8'));
writeFileSync(path,html);
console.log('BSEG 009: taller header, reference-facing guardian, larger GOBLIN, live sparkle/icon motion and scrollable FX list.');
