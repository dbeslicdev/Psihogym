import http from 'node:http';
import {DatabaseSync} from 'node:sqlite';
import {randomBytes,randomUUID,scrypt as scryptCallback,timingSafeEqual,createHash} from 'node:crypto';
import {promisify} from 'node:util';
import {mkdirSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {courseAccess, isLesson, isPurchasable, programCurriculum, validatedProgress} from './course-access.mjs';
const scrypt=promisify(scryptCallback), digest=v=>createHash('sha256').update(v).digest('hex');
export function createApi({dbPath,origin='http://127.0.0.1:4182',testPurchases=false}={}) {
 mkdirSync(dirname(dbPath),{recursive:true});const db=new DatabaseSync(dbPath);
 db.exec(`PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;
 CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,email TEXT UNIQUE NOT NULL,name TEXT NOT NULL,password_hash TEXT NOT NULL,salt TEXT NOT NULL,created_at INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),expires_at INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS purchases(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),program_id TEXT NOT NULL,amount_cents INTEGER NOT NULL,kind TEXT NOT NULL CHECK(kind IN ('test','paid')),created_at INTEGER NOT NULL,UNIQUE(user_id,program_id));
 CREATE TABLE IF NOT EXISTS progress(user_id TEXT NOT NULL REFERENCES users(id),program_id TEXT NOT NULL,done TEXT NOT NULL,current TEXT,updated_at INTEGER NOT NULL,PRIMARY KEY(user_id,program_id));
 CREATE TABLE IF NOT EXISTS notes(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),program_id TEXT NOT NULL,lesson_id TEXT NOT NULL,body TEXT NOT NULL,created_at INTEGER NOT NULL,updated_at INTEGER NOT NULL);
 CREATE INDEX IF NOT EXISTS notes_owner ON notes(user_id,program_id,created_at);
 `);
 // Bilješke mogu sadržavati podatke o zdravlju: vidljive su samo vlasniku, nikad se ne logiraju.
 const noteLimit={body:5000,perProgram:500};
 const noteBody=v=>{if(typeof v!=='string'||!v.trim()||v.length>noteLimit.body)throw fail(400,'Bilješka mora imati od 1 do '+noteLimit.body+' znakova.');return v.trim();};
 const noteRow=n=>({id:n.id,lessonId:n.lesson_id,body:n.body,createdAt:n.created_at,updatedAt:n.updated_at});
 const courses = courseAccess(db);
 // Rok čuvanja: bilješke se brišu 30 dana nakon isteka pristupa programu. Obnova unutar roka ih zadržava.
 const noteRetention=30*24*3600000;
 const purgeNotes=(now=Date.now(),userIds=db.prepare('SELECT DISTINCT user_id FROM notes').all().map(r=>r.user_id))=>{
  const del=db.prepare('DELETE FROM notes WHERE user_id=? AND program_id=?');
  for(const userId of userIds){const {purchases,expiredPurchases}=courses.list(userId,now);const kept=new Set(purchases.map(o=>o.programId));
   for(const o of expiredPurchases)if(o.expiresAt+noteRetention>now)kept.add(o.programId);
   for(const {program_id} of db.prepare('SELECT DISTINCT program_id FROM notes WHERE user_id=?').all(userId))if(!kept.has(program_id))del.run(userId,program_id);}
 };
 purgeNotes();const purgeTimer=setInterval(()=>purgeNotes(),6*3600000);purgeTimer.unref();
 const ttl=7*24*3600000, rates=new Map();
 // API sluša samo na loopbacku, pa svaki zahtjev dolazi preko lokalnog proxyja (Vite, nginx).
 // Stvarni klijent je zadnja adresa koju je proxy dopisao u X-Forwarded-For.
 const clientIp=req=>String(req.headers['x-forwarded-for']||'').split(',').map(v=>v.trim()).filter(Boolean).at(-1)||req.socket.remoteAddress;
 // Ograničenja: neuspjele prijave po IP-u i po e-mailu, registracije po IP-u. Uspješna prijava se ne broji.
 const limits={ip:{max:15,window:60000},email:{max:10,window:15*60000},register:{max:10,window:3600000}};
 const limited=(kind,key)=>{const now=Date.now();for(const [k,v]of rates)if(v.until<=now)rates.delete(k);return (rates.get(kind+':'+key)?.count||0)>=limits[kind].max;};
 const hit=(kind,key)=>{const id=kind+':'+key,now=Date.now(),rate=rates.get(id)||{count:0,until:now+limits[kind].window};rate.count++;rates.set(id,rate);};
 const tooMany=()=>fail(429,'Previše pokušaja. Pokušaj ponovno malo kasnije.');
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
    const now=Date.now(),ip=clientIp(req);
    const email=typeof body.email==='string'?body.email.trim().toLowerCase():'';const password=body.password;
    if(limited('ip',ip)||limited('email',email))throw tooMany();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||typeof password!=='string'||password.length>128)throw fail(400,'Provjeri e-mail i lozinku.');
    if(path==='/api/register'){
     if(limited('register',ip))throw tooMany();
     hit('register',ip);
     if(password.length<12||typeof body.name!=='string'||!body.name.trim()||body.name.length>100)throw fail(400,'Unesi ime i lozinku od najmanje 12 znakova.');
     const salt=randomBytes(16).toString('hex'),hash=(await scrypt(password,salt,64)).toString('hex');
     try{db.prepare('INSERT INTO users VALUES(?,?,?,?,?,?)').run(randomUUID(),email,body.name.trim(),hash,salt,now)}catch(e){if(!String(e).includes('UNIQUE'))throw e;}
     // Postojeći e-mail: ista provjera lozinke kao prijava (uz iste limite), bez poruke da račun postoji.
    }
    const user=db.prepare('SELECT * FROM users WHERE email=?').get(email);
    const actual=await scrypt(password,user?.salt||'00000000000000000000000000000000',64);
    if(!user||!timingSafeEqual(actual,Buffer.from(user.password_hash,'hex'))){hit('ip',ip);hit('email',email);throw path==='/api/register'?fail(400,'Registracija nije uspjela. Provjeri podatke ili se prijavi ako već imaš račun.'):fail(401,'Neispravan e-mail ili lozinka.');}
    rates.delete('email:'+email);
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
   const notes=path.match(/^\/api\/programs\/([a-z0-9-]+)\/notes(?:\/([0-9a-f-]{36}))?$/);
   if(notes){const [,id,noteId]=notes;if(!programCurriculum(id))throw fail(404,'Nije pronađeno.');
    // Čitanje i brisanje ostaju dostupni i nakon isteka pristupa; pisanje traži aktivan program.
    const active=()=>{if(!courses.list(user.id).purchases.some(order=>order.programId===id))throw fail(403,'Nemaš pristup ovom programu.');};
    const own=()=>{const n=db.prepare('SELECT * FROM notes WHERE id=? AND user_id=? AND program_id=?').get(noteId,user.id,id);if(!n)throw fail(404,'Bilješka nije pronađena.');return n;};
    if(!noteId&&req.method==='GET'){purgeNotes(Date.now(),[user.id]);return send({notes:db.prepare('SELECT * FROM notes WHERE user_id=? AND program_id=? ORDER BY created_at,id').all(user.id,id).map(noteRow)});}
    if(!noteId&&req.method==='POST'){active();if(!isLesson(id,body.lessonId))throw fail(400,'Neispravna lekcija.');const text=noteBody(body.body);
     if(db.prepare('SELECT count(*) AS n FROM notes WHERE user_id=? AND program_id=?').get(user.id,id).n>=noteLimit.perProgram)throw fail(400,'Dosegnut je najveći broj bilješki za ovaj program.');
     const now=Date.now(),n={id:randomUUID(),user_id:user.id,program_id:id,lesson_id:body.lessonId,body:text,created_at:now,updated_at:now};
     db.prepare('INSERT INTO notes VALUES(?,?,?,?,?,?,?)').run(n.id,n.user_id,n.program_id,n.lesson_id,n.body,n.created_at,n.updated_at);return send(noteRow(n),201);}
    if(noteId&&req.method==='PUT'){active();const n=own(),text=noteBody(body.body),now=Date.now();db.prepare('UPDATE notes SET body=?,updated_at=? WHERE id=?').run(text,now,n.id);return send(noteRow({...n,body:text,updated_at:now}));}
    if(noteId&&req.method==='DELETE'){own();db.prepare('DELETE FROM notes WHERE id=?').run(noteId);return send({ok:true});}
    throw fail(404,'Nije pronađeno.');
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
 server.on('close',()=>{clearInterval(purgeTimer);db.close();});return server;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 if(process.env.NODE_ENV==='production')throw new Error('Local account server: production deployment requires HTTPS, email verification/recovery and operational review.');
 // PSIHOGYM_ORIGIN: adresa s koje se stranica otvara (npr. http://192.168.1.82:4182 za pregled u lokalnoj mreži).
 const dbPath=process.env.PSIHOGYM_DB||fileURLToPath(new URL('./data/accounts.sqlite',import.meta.url));
 createApi({dbPath,origin:process.env.PSIHOGYM_ORIGIN||undefined,testPurchases:process.env.ALLOW_TEST_PURCHASES==='true'}).listen(Number(process.env.API_PORT)||4183,'127.0.0.1',()=>console.log('Account API listening on loopback.'));
}
