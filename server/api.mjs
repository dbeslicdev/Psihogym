import http from 'node:http';
import {DatabaseSync} from 'node:sqlite';
import {randomBytes,randomUUID,scrypt as scryptCallback,timingSafeEqual,createHash} from 'node:crypto';
import {promisify} from 'node:util';
import {mkdirSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {courseAccess, isPurchasable, programCurriculum, validatedProgress} from './course-access.mjs';
const scrypt=promisify(scryptCallback), digest=v=>createHash('sha256').update(v).digest('hex');
export function createApi({dbPath,origin='http://127.0.0.1:4182',testPurchases=false}={}) {
 mkdirSync(dirname(dbPath),{recursive:true});const db=new DatabaseSync(dbPath);
 db.exec(`PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;
 CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,email TEXT UNIQUE NOT NULL,name TEXT NOT NULL,password_hash TEXT NOT NULL,salt TEXT NOT NULL,created_at INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),expires_at INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS purchases(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),program_id TEXT NOT NULL,amount_cents INTEGER NOT NULL,kind TEXT NOT NULL CHECK(kind IN ('test','paid')),created_at INTEGER NOT NULL,UNIQUE(user_id,program_id));
 CREATE TABLE IF NOT EXISTS progress(user_id TEXT NOT NULL REFERENCES users(id),program_id TEXT NOT NULL,done TEXT NOT NULL,current TEXT,updated_at INTEGER NOT NULL,PRIMARY KEY(user_id,program_id));
 `);
 const courses = courseAccess(db);
 const ttl=7*24*3600000, rates=new Map();
 const fail=(status,message)=>Object.assign(new Error(message),{status});
 const secureCookie = new URL(origin).protocol === 'https:' ? '; Secure' : '';
 const cookie=(token,age=ttl/1000)=>`pg_session=${token}; HttpOnly; SameSite=Strict; Path=/api; Max-Age=${age}${secureCookie}`;
 const getSession=req=>{const token=/(?:^|;\s*)pg_session=([a-f0-9]{64})(?:;|$)/.exec(req.headers.cookie||'')?.[1];if(!token)return null;return db.prepare('SELECT users.* FROM sessions JOIN users ON users.id=sessions.user_id WHERE token_hash=? AND expires_at>?').get(digest(token),Date.now());};
 const account=user=> user?{user:{id:user.id,email:user.email,username:user.email,ime:user.name},...courses.list(user.id),progress:Object.fromEntries(db.prepare('SELECT * FROM progress WHERE user_id=?').all(user.id).map(p=>[p.program_id,{done:JSON.parse(p.done),current:p.current}]))}:{user:null,purchases:[],expiredPurchases:[],progress:{}};
 const issue=(user,res)=>{db.prepare('DELETE FROM sessions WHERE expires_at<=?').run(Date.now());const t=randomBytes(32).toString('hex');db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(digest(t),user.id,Date.now()+ttl);res.setHeader('Set-Cookie',cookie(t));return account(user);};
 const server=http.createServer(async(req,res)=>{
  res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
  const send=(data,status=200)=>{res.statusCode=status;res.end(JSON.stringify(data));};
  try {
   const path=new URL(req.url,'http://localhost').pathname;
   if(req.method!=='GET'&&req.headers.origin!==origin)throw fail(403,'Zahtjev nije dopušten.');
   let body = {};
   if (req.method !== 'GET') {
    const type = req.headers['content-type']?.split(';')[0].trim().toLowerCase();
    if (type !== 'application/json') throw fail(415, 'Očekivan JSON.');
    let size = 0;
    const chunks = [];
    for await (const chunk of req) {
     size += chunk.length;
     if (size > 16384) throw fail(413, 'Zahtjev je prevelik.');
     chunks.push(chunk);
    }
    try { body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); }
    catch { throw fail(400, 'Neispravan zahtjev.'); }
    if (body === null || typeof body !== 'object' || Array.isArray(body)) throw fail(400, 'Neispravan zahtjev.');
   }
   if(path==='/api/session'&&req.method==='GET')return send({...account(getSession(req)),testPurchases});
   if(['/api/login','/api/register'].includes(path)&&req.method==='POST'){
    const now=Date.now(),key=req.socket.remoteAddress;for(const [k,v]of rates)if(v.until<now)rates.delete(k);
    const rate=rates.get(key)||{count:0,until:now+60000};rate.count++;rates.set(key,rate);if(rate.count>15)throw fail(429,'Previše pokušaja. Pokušaj ponovno za minutu.');
    const email=typeof body.email==='string'?body.email.trim().toLowerCase():'';const password=body.password;
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||typeof password!=='string'||password.length>128)throw fail(400,'Provjeri e-mail i lozinku.');
    if(path==='/api/register'){
     if(password.length<12||typeof body.name!=='string'||!body.name.trim()||body.name.length>100)throw fail(400,'Unesi ime i lozinku od najmanje 12 znakova.');
     const salt=randomBytes(16).toString('hex'),hash=(await scrypt(password,salt,64)).toString('hex');
     try{db.prepare('INSERT INTO users VALUES(?,?,?,?,?,?)').run(randomUUID(),email,body.name.trim(),hash,salt,now)}catch(e){if(e.code?.includes('SQLITE')||String(e).includes('UNIQUE'))throw fail(409,'Račun nije moguće registrirati. Pokušaj se prijaviti.');throw e;}
    }
    const user=db.prepare('SELECT * FROM users WHERE email=?').get(email);
    const actual=await scrypt(password,user?.salt||'00000000000000000000000000000000',64);
    if(!user||!timingSafeEqual(actual,Buffer.from(user.password_hash,'hex')))throw fail(401,'Neispravan e-mail ili lozinka.');
    return send(issue(user,res));
   }
   if(path==='/api/logout'&&req.method==='POST'){const token=/(?:^|;\s*)pg_session=([a-f0-9]{64})(?:;|$)/.exec(req.headers.cookie||'')?.[1];if(token)db.prepare('DELETE FROM sessions WHERE token_hash=?').run(digest(token));res.setHeader('Set-Cookie',cookie('',0));return send({ok:true});}
   const user=getSession(req);if(!user)throw fail(401,'Prijavi se za nastavak.');
   if(path==='/api/checkout/test'&&req.method==='POST'){
    if(!testPurchases)throw fail(403,'Testne kupnje nisu uključene.');
    const ids=body.programIds;if(!Array.isArray(ids)||!ids.length||ids.length>10||new Set(ids).size!==ids.length||ids.some(id=>!isPurchasable(id)))throw fail(400,'Neispravan odabir programa.');
    courses.grantTestPurchase(user.id, ids);
    return send(account(user));
   }
   const match=path.match(/^\/api\/programs\/([a-z0-9-]+)\/(progress|access|curriculum)$/);
   if(match){const [,id,action]=match;if(!courses.list(user.id).purchases.some(order=>order.programId===id))throw fail(403,'Nemaš pristup ovom programu.');
    if(action==='curriculum'&&req.method==='GET')return send(programCurriculum(id));
    if(action==='access'&&req.method==='GET')return send({allowed:true});
    if(action==='progress'&&req.method==='PUT'){
     const value=validatedProgress(id,body);if(!value)throw fail(400,'Neispravna lekcija.');
     db.prepare('INSERT INTO progress VALUES(?,?,?,?,?) ON CONFLICT(user_id,program_id) DO UPDATE SET done=excluded.done,current=excluded.current,updated_at=excluded.updated_at').run(user.id,id,JSON.stringify(value.done),value.current,Date.now());return send(value);
    }
   }
   throw fail(404,'Nije pronađeno.');
  }catch(e){if(!e.status)console.error('API error:',e.code||e.name);send({error:e.status?e.message:'Poslužitelj trenutačno nije dostupan.'},e.status||500);}
 });
 server.on('close',()=>db.close());return server;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 if(process.env.NODE_ENV==='production')throw new Error('Local account server: production deployment requires HTTPS, email verification/recovery and operational review.');
 const dbPath=process.env.PSIHOGYM_DB||fileURLToPath(new URL('./data/accounts.sqlite',import.meta.url));
 createApi({dbPath,testPurchases:process.env.ALLOW_TEST_PURCHASES==='true'}).listen(Number(process.env.API_PORT)||4183,'127.0.0.1',()=>console.log('Account API listening on loopback.'));
}
