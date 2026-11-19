import {test} from 'node:test';import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {createApi} from './api.mjs';
import {programiById} from './program-catalog.mjs';
const day=86_400_000;
test('bilješke su trajne, vidljive samo vlasniku i dostupne za brisanje i nakon isteka pristupa',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'psihogym-notes-'));const dbPath=join(dir,'test.sqlite');const server=createApi({dbPath,testPurchases:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base=`http://127.0.0.1:${server.address().port}`;
 const call=async(path,body,cookie='',method=body?'POST':'GET')=>{const r=await fetch(base+'/api'+path,{method,headers:{Origin:'http://127.0.0.1:4182','Content-Type':'application/json',Cookie:cookie},body:body?JSON.stringify(body):undefined});return {status:r.status,body:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]}};
 const p='/programs/emocionalni-razvoj/notes';
 try{
  const a=(await call('/register',{email:'a@example.test',name:'A',password:'Long test password A'})).cookie;
  const b=(await call('/register',{email:'b@example.test',name:'B',password:'Long test password B'})).cookie;
  assert.equal((await call(p,{lessonId:'l1',body:'x'},a)).status,403);
  await call('/checkout/test',{programIds:['emocionalni-razvoj']},a);
  assert.equal((await call(p,{lessonId:'l1',body:'x'})).status,401);
  assert.equal((await call(p,{lessonId:'nepostojeca',body:'x'},a)).status,400);
  assert.equal((await call(p,{lessonId:'l1',body:'   '},a)).status,400);
  assert.equal((await call(p,{lessonId:'l1',body:'x'.repeat(5001)},a)).status,400);
  assert.equal((await call('/programs/nepostojeci/notes',undefined,a)).status,404);
  const n=await call(p,{lessonId:'l1',body:'  Danas sam primijetila…  '},a);assert.equal(n.status,201);assert.equal(n.body.body,'Danas sam primijetila…');
  await call(p,{lessonId:'l2',body:'Druga'},a);
  // Drugi korisnik ne vidi, ne mijenja i ne briše tuđe bilješke.
  assert.deepEqual((await call(p,undefined,b)).body.notes,[]);
  assert.equal((await call(p+'/'+n.body.id,{body:'tuđe'},b,'PUT')).status,403);
  await call('/checkout/test',{programIds:['emocionalni-razvoj']},b);
  assert.equal((await call(p+'/'+n.body.id,{body:'tuđe'},b,'PUT')).status,404);
  assert.equal((await call(p+'/'+n.body.id,{},b,'DELETE')).status,404);
  // Uređivanje.
  const e=await call(p+'/'+n.body.id,{body:'Uređeno'},a,'PUT');assert.equal(e.status,200);assert.equal(e.body.body,'Uređeno');
  assert.deepEqual((await call(p,undefined,a)).body.notes.map(x=>[x.lessonId,x.body]),[['l1','Uređeno'],['l2','Druga']]);
  // Istek pristupa: čitanje i brisanje rade, pisanje ne.
  const access=programiById['emocionalni-razvoj'].accessDays*day;
  const expire=(daysAgo,email)=>{const db=new DatabaseSync(dbPath);db.prepare('UPDATE purchases SET created_at=? WHERE user_id=(SELECT id FROM users WHERE email=?)').run(Date.now()-access-daysAgo*day,email);db.close();};
  expire(29,'a@example.test');
  assert.equal((await call(p,undefined,a)).body.notes.length,2);
  assert.equal((await call(p,{lessonId:'l1',body:'nova'},a)).status,403);
  assert.equal((await call(p+'/'+n.body.id,{},a,'DELETE')).status,200);
  assert.deepEqual((await call(p,undefined,a)).body.notes.map(x=>x.body),['Druga']);
  // Rok čuvanja: 30 dana nakon isteka bilješke se trajno brišu (i pri čitanju i pri pokretanju servera).
  expire(31,'a@example.test');
  assert.deepEqual((await call(p,undefined,a)).body.notes,[]);
  assert.equal((await call(p,{lessonId:'l1',body:'B ostaje'},b)).status,201);
  expire(31,'b@example.test');
  const db=new DatabaseSync(dbPath);assert.equal(db.prepare('SELECT count(*) AS n FROM notes').get().n,1);db.close();
  const restarted=createApi({dbPath});const left=new DatabaseSync(dbPath);assert.equal(left.prepare('SELECT count(*) AS n FROM notes').get().n,0);left.close();restarted.close();
 }finally{await new Promise(r=>server.close(r));rmSync(dir,{recursive:true,force:true});}
});
