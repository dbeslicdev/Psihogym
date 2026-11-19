import {getAccount,signIn,signOut} from './account.js';
export const login=signIn;
export const logout=signOut;
export const getUser=()=>getAccount().user;
export const isLoggedIn=()=>!!getUser();
export const hasAccess=id=>!!getUser()&&getAccount().purchases.some(p=>p.programId===id);
