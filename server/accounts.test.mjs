import {test} from 'node:test';import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';
import {createApi} from './api.mjs';
test('accounts, purchases and progress are server-owned and isolated',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'psihogym-accounts-'));const dbPath=join(dir,'test.sqlite');let server=createApi({dbPath,testPurchases:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 let base=`http://127.0.0.1:${server.address().port}`;
 const call=async(path,body,cookie='',method=body?'POST':'GET',origin='http://127.0.0.1:4182')=>{const r=await fetch(base+'/api'+path,{method,headers:{Origin:origin,'Content-Type':'application/json',Cookie:cookie},body:body?JSON.stringify(body):undefined});return {status:r.status,body:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]}};
 try{
 const a=await call('/register',{email:'a@example.test',name:'A',password:'Long test password A'});assert.equal(a.status,200);assert.ok(a.cookie);assert.equal(a.body.user.email,'a@example.test');
 const b=await call('/register',{email:'b@example.test',name:'B',password:'Long test password B'});assert.equal(b.status,200);
 assert.equal((await call('/login',{email:'a@example.test',password:'wrong'})).status,401);
 assert.equal((await call('/checkout/test',{programIds:['emocionalni-razvoj']})).status,401);
 assert.equal((await call('/checkout/test',{programIds:['emocionalni-razvoj']},a.cookie,'POST','https://evil.test')).status,403);
 const purchase=await call('/checkout/test',{programIds:['emocionalni-razvoj'],userId:b.body.user.id,amount:1},a.cookie);assert.equal(purchase.status,200);assert.equal(purchase.body.purchases.length,1);
 assert.equal((await call('/checkout/test',{programIds:['emocionalni-razvoj']},a.cookie)).body.purchases.length,1);
 assert.equal((await call('/programs/emocionalni-razvoj/access',undefined,b.cookie)).status,403);
 assert.equal((await call('/programs/emocionalni-razvoj/progress',{done:['l1'],current:'l2'},a.cookie,'PUT')).status,200);
 assert.equal((await call('/programs/emocionalni-razvoj/progress',{done:['evil'],current:'l1'},a.cookie,'PUT')).status,400);
 assert.equal((await call('/programs/emocionalni-razvoj/progress',{done:['l1'],current:'l1'},b.cookie,'PUT')).status,403);
 assert.deepEqual((await call('/session',undefined,b.cookie)).body.progress,{});
 await new Promise(r=>server.close(r));server=createApi({dbPath,testPurchases:false});await new Promise(r=>server.listen(0,'127.0.0.1',r));base=`http://127.0.0.1:${server.address().port}`;
 const again=await call('/login',{email:'a@example.test',password:'Long test password A'});assert.deepEqual(again.body.progress['emocionalni-razvoj'],{done:['l1'],current:'l2'});assert.equal(again.body.purchases.length,1);
 assert.equal((await call('/checkout/test',{programIds:['stres']},again.cookie)).status,403);
 await call('/logout',{},again.cookie);assert.equal((await call('/session',undefined,again.cookie)).body.user,null);
 }finally{await new Promise(r=>server.close(r));rmSync(dir,{recursive:true,force:true});}
});
