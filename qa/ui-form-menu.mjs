import {chromium} from 'file:///C:/Users/dbesl/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const b=await chromium.launch();const results=[];
for(const [width,height] of [[320,568],[390,844],[640,450],[844,390],[955,860]]){
const p=await b.newPage({viewport:{width,height},hasTouch:true});await p.goto('http://127.0.0.1:4182/kontakt');await p.waitForTimeout(400);
await p.locator('.nav__burger').click();await p.waitForTimeout(500);
const menu=await p.locator('.menu').evaluate(e=>({overflow:document.documentElement.scrollWidth>innerWidth,scrollable:e.scrollHeight>e.clientHeight,links:[...e.querySelectorAll('a')].map(a=>({text:a.textContent.trim(),width:a.getBoundingClientRect().width}))}));
await p.keyboard.press('Escape');await p.getByRole('button',{name:'Upit',exact:true}).click();
const upit=await p.locator('form:not([hidden])').count();await p.getByRole('button',{name:'Savjetovanje',exact:true}).click();
const other=p.locator('input[name=ocekivanje_drugo_text]');const disabledBefore=await other.isDisabled();await p.locator('input[name=ocekivanje_drugo]').check();const enabledAfter=await other.isEnabled();
const widths=await p.evaluate(()=>({controls:document.querySelector('.kontakt-toggles').clientWidth,form:document.querySelector('form:not([hidden])').clientWidth,overflow:document.documentElement.scrollWidth>innerWidth}));
results.push({width,height,menu,visibleInquiryForms:upit,disabledBefore,enabledAfter,...widths});await p.close();
}
const p=await b.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});await p.goto('http://127.0.0.1:4182/o-nama');await p.locator('.on-about-career').scrollIntoViewIfNeeded();await p.waitForTimeout(250);results.push({reducedMotion:true,careerParagraphsVisible:await p.locator('.on-about-career .v4-split.is-in').count()});await p.close();
fs.writeFileSync('C:/Projects/psihogym_ui_pass/qa/forms-menu.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results));await b.close();

