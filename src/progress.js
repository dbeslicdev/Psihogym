import {getAccount,saveProgress} from './account.js';
export const getProgress=id=>getAccount().progress[id]||{done:[],current:null};
export const setProgress=saveProgress;
export const progressPct=(id,total)=>total?Math.min(100,Math.round(new Set(getProgress(id).done).size/total*100)):0;
