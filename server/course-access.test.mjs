import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {createApi} from './api.mjs';
import {programiById, programPrice} from './program-catalog.mjs';

const shopOrigin = 'http://127.0.0.1:4182';
const day = 86_400_000;
const totals = {'emocionalni-razvoj':13, anksioznost:23, stres:20, odnosi:14, samopouzdanje:15};

async function shop(t) {
  const dir = mkdtempSync(join(tmpdir(),'psihogym-courses-'));
  const dbPath = join(dir,'shop.sqlite');
  let server, base;
  async function start() {
    server = createApi({dbPath, testPurchases:true});
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    base = 'http://127.0.0.1:' + server.address().port + '/api';
  }
  const stop = () => new Promise(resolve => server.close(resolve));
  await start();
  const db = new DatabaseSync(dbPath);
  t.after(async () => { await stop(); db.close(); rmSync(dir,{recursive:true,force:true}); });
  async function request(path, cookie='', body, method=body ? 'POST' : 'GET') {
    const response = await fetch(base+path, {
      method, headers:{origin:shopOrigin, cookie,'content-type':'application/json'},
      body:body ? JSON.stringify(body) : undefined,
    });
    return {
      status:response.status, data:await response.json(),
      cookie:response.headers.get('set-cookie')?.split(';')[0], cache:response.headers.get('cache-control'),
    };
  }
  const register = async name => {
    const response = await request('/register','',{name,email:name+'@example.test',password:'Private test account 2026'});
    assert.equal(response.status,200);
    return response.cookie;
  };
  return {request,register,db,restart:async () => { await stop(); await start(); }};
}

test('each program delivers its sourced outline only to its buyer',async t=>{
  const {register,request} = await shop(t);
  const buyer = await register('buyer'), other = await register('other');
  const ids = Object.keys(totals);
  const purchase = await request('/checkout/test',buyer,{programIds:ids});
  assert.equal(purchase.status,200);
  for (const id of ids) {
    const path = '/programs/'+id+'/curriculum';
    assert.equal((await request(path)).status,401);
    assert.equal((await request(path,other)).status,403);
    const response = await request(path,buyer);
    assert.equal(response.status,200);
    assert.equal(response.cache,'no-store');
    const lessons = response.data.modules.flatMap(module=>module.lessons);
    assert.equal(lessons.length,totals[id]);
    assert.equal(new Set(lessons.map(lesson=>lesson.id)).size,totals[id]);
    assert.ok(lessons.every(lesson=>lesson.title && lesson.description));
    const order = purchase.data.purchases.find(order=>order.programId===id);
    assert.equal(order.totalLessons,lessons.length);
    assert.equal(order.expiresAt-order.purchasedAt,90*day);
    const current = lessons.at(-1).id;
    const progress = {done:lessons.map(lesson=>lesson.id),current};
    assert.deepEqual((await request('/programs/'+id+'/progress',buyer,progress,'PUT')).data,progress);
  }
});

test('access expires, and an idempotent renewal retains progress and order history',async t=>{
  const {db,register,request}=await shop(t);
  const cookie = await register('renew');
  const id = 'emocionalni-razvoj', courses = {programIds:[id]};
  assert.equal((await request('/checkout/test',cookie,courses)).status,200);
  const progress = {done:['r1'],current:'bonus'};
  assert.equal((await request('/programs/'+id+'/progress',cookie,progress,'PUT')).status,200);
  db.prepare('UPDATE purchases SET created_at=? WHERE program_id=?').run(Date.now()-90*day,id);
  const expired = (await request('/session',cookie)).data;
  assert.equal(expired.purchases.length,0);
  assert.equal(expired.expiredPurchases[0].programId,id);
  assert.equal((await request('/programs/'+id+'/curriculum',cookie)).status,403);
  assert.equal((await request('/programs/'+id+'/progress',cookie,progress,'PUT')).status,403);
  const purchases=await Promise.all([1,2].map(()=>request('/checkout/test',cookie,courses)));
  assert.ok(purchases.every(p=>p.status===200 && p.data.purchases.length===1));
  const first = db.prepare('SELECT * FROM purchases').get(), renewal = db.prepare('SELECT * FROM purchase_renewals').all();
  assert.equal(renewal.length,1);
  assert.equal(renewal[0].purchase_id,first.id);
  assert.equal(renewal[0].amount_cents,Math.round(programPrice(programiById[id],renewal[0].created_at)*100));
  assert.ok(first.created_at < renewal[0].created_at);
  assert.deepEqual((await request('/session',cookie)).data.progress[id],progress);
  assert.equal((await request('/programs/'+id+'/curriculum',cookie)).status,200);
});

test('v1 bonus bookmarks migrate once; the new regular lesson 11 survives future starts',async t=>{
  const {db,register,request,restart}=await shop(t);
  const cookie = await register('legacy');
  const {user} = (await request('/session',cookie)).data;
  await request('/checkout/test',cookie,{programIds:['odnosi']});
  db.prepare('INSERT INTO progress VALUES(?,?,?,?,?)').run(user.id,'odnosi',JSON.stringify(['l1','l11','l12']),'l12',Date.now());
  db.exec('PRAGMA user_version=1');
  await restart();
  const old = (await request('/session',cookie)).data.progress.odnosi;
  assert.deepEqual(old,{done:['l1','bonus'],current:'bonus'});
  const next = {done:['l1','l11','bonus'],current:'l11'};
  assert.deepEqual((await request('/programs/odnosi/progress',cookie,next,'PUT')).data,next);
  await restart();
  assert.deepEqual((await request('/session',cookie)).data.progress.odnosi,next);
});
