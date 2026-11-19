import {useSyncExternalStore} from 'react';
let state={ready:false,error:null,user:null,purchases:[],progress:{},testPurchases:false};
const listeners=new Set();
const publish=value=>{state={...state,...value};listeners.forEach(fn=>fn());};
export const getAccount=()=>state;
export const useAccount=()=>useSyncExternalStore(fn=>{listeners.add(fn);return()=>listeners.delete(fn)},getAccount);
export async function api(path,body,method='POST'){
 const response=await fetch('/api'+path,{method,credentials:'same-origin',headers:body===undefined?{}:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(15000)});
 let value;try{value=await response.json()}catch{throw new Error('Poslužitelj računa nije dostupan.');}
 if(!response.ok){if(response.status===401)publish({user:null,purchases:[],progress:{}});throw new Error(value.error||'Zahtjev nije uspio.');}return value;
}
export async function refreshAccount(){try{publish({...await api('/session',undefined,'GET'),ready:true,error:null})}catch{publish({ready:true,error:'Poslužitelj računa nije dostupan.',user:null,purchases:[],progress:{}})}}
export async function signIn(email,password){publish({...await api('/login',{email,password}),error:null});return true;}
export async function register(name,email,password){publish({...await api('/register',{name,email,password}),error:null});return true;}
export async function signOut(){await api('/logout',{});publish({user:null,purchases:[],progress:{},error:null});}
export async function testPurchase(programIds){publish({...await api('/checkout/test',{programIds})});}
let progressQueue=Promise.resolve();
export function saveProgress(id,value){
 const owner=state.user?.id;
 const task=progressQueue.catch(()=>{}).then(async()=>{
   if(!owner||state.user?.id!==owner)throw new Error('Račun se promijenio. Prijavi se ponovno.');
   const saved=await api('/programs/'+id+'/progress',value,'PUT');
   if(state.user?.id===owner)publish({progress:{...state.progress,[id]:saved}});
   return saved;
 });progressQueue=task;return task;
}
// Bilješke: server je jedini izvor; klijent ih ne sprema lokalno (mogu sadržavati podatke o zdravlju).
const notesPath=id=>'/programs/'+encodeURIComponent(id)+'/notes';
export const listNotes=id=>api(notesPath(id),undefined,'GET').then(v=>v.notes);
export const addNote=(id,lessonId,body)=>api(notesPath(id),{lessonId,body});
export const editNote=(id,noteId,body)=>api(notesPath(id)+'/'+noteId,{body},'PUT');
export const deleteNote=(id,noteId)=>api(notesPath(id)+'/'+noteId,{},'DELETE');
