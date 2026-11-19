import {chromium} from 'file:///C:/Users/dbesl/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const b=await chromium.launch();const output=[];
const sizes=[[320,568],[375,812],[390,844],[768,1024],[955,860],[1024,768],[1280,720],[1366,768],[1920,1080],[2560,1440],[844,390]];
const routes=['/','/o-nama','/savjetovanje','/programi',...['emocionalni-razvoj','anksioznost','stres','odnosi','samopouzdanje'].map(id=>'/programi/'+id),'/kontakt','/kosarica'];
for(const [width,height]of sizes){await Promise.all(routes.map(async route=>{const p=await b.newPage({viewport:{width,height},hasTouch:width<961});const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:4182'+route);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(500);const data=await p.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,images:[...document.images].filter(e=>e.complete&&e.naturalWidth===0).map(e=>e.src)}));output.push({width,height,route,...data,errors});await p.close();}));}
fs.writeFileSync('C:/Projects/psihogym_ui_pass/qa/regression.json',JSON.stringify(output,null,2));console.log(JSON.stringify({cases:output.length,failures:output.filter(r=>r.overflow||r.errors.length||r.images.length)}));await b.close();

