import {test} from 'node:test';import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';
import {createApi} from './api.mjs';
test('neuspjele prijave s jedne adrese ne zaključavaju ostale korisnike',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'psihogym-limits-'));const server=createApi({dbPath:join(dir,'test.sqlite')});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base=`http://127.0.0.1:${server.address().port}`;
 const call=(path,body,ip)=>fetch(base+'/api'+path,{method:'POST',headers:{Origin:'http://127.0.0.1:4182','Content-Type':'application/json','X-Forwarded-For':ip},body:JSON.stringify(body)}).then(r=>r.status);
 try{
  assert.equal(await call('/register',{email:'a@example.test',name:'A',password:'Long test password A'},'10.0.0.1'),200);
  // Napadač s jedne adrese troši svoj limit…
  for(let i=0;i<15;i++)assert.equal(await call('/login',{email:`x${i}@example.test`,password:'wrong'},'10.0.0.66'),401);
  assert.equal(await call('/login',{email:'a@example.test',password:'Long test password A'},'10.0.0.66'),429);
  // …a ostali se i dalje prijavljuju.
  assert.equal(await call('/login',{email:'a@example.test',password:'Long test password A'},'10.0.0.1'),200);
  // Uspješne prijave se ne broje.
  for(let i=0;i<20;i++)assert.equal(await call('/login',{email:'a@example.test',password:'Long test password A'},'10.0.0.2'),200);
  // Pogađanje lozinke jednog računa s više adresa zaustavlja limit po e-mailu.
  for(let i=0;i<10;i++)assert.equal(await call('/login',{email:'a@example.test',password:'wrong'},'10.1.0.'+i),401);
  assert.equal(await call('/login',{email:'a@example.test',password:'Long test password A'},'10.2.0.1'),429);
  // Masovna registracija s jedne adrese.
  for(let i=0;i<9;i++)assert.equal(await call('/register',{email:`r${i}@example.test`,name:'R',password:'Long test password R'},'10.0.0.9'),200);
  assert.equal(await call('/register',{email:'r9@example.test',name:'R',password:'Long test password R'},'10.0.0.9'),200);
  assert.equal(await call('/register',{email:'r10@example.test',name:'R',password:'Long test password R'},'10.0.0.9'),429);
 }finally{await new Promise(r=>server.close(r));rmSync(dir,{recursive:true,force:true});}
});
