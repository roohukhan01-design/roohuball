import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, get, set, update, onValue, runTransaction, serverTimestamp } from 'firebase/database';

const config = {
  apiKey: "AIzaSyDL4Y2mDe3VC0yJzSWM4T1LkFEOJ8wCQJI",
  authDomain: "roohuball.firebaseapp.com",
  databaseURL: "https://roohuball-default-rtdb.firebaseio.com",
  projectId: "roohuball",
  storageBucket: "roohuball.firebasestorage.app",
  messagingSenderId: "315180440923",
  appId: "1:315180440923:web:5e829358cd0d2dc2a20e7e"
};
const app = initializeApp(config);
const auth = getAuth(app);
const db = getDatabase(app);
const A = document.querySelector('#app');
let currentCode = '', stopRoom = null, busy = false;
const playerName = () => { let n=''; try { n=localStorage.getItem('rfa_name')||''; } catch {} return (n.trim().slice(0,18)||'Player'); };
const code = () => Math.random().toString(36).slice(2,8).toUpperCase();
async function ensureAuth(){ if(auth.currentUser) return auth.currentUser; const c=await signInAnonymously(auth); return c.user; }
function onlineHome(){
 if(stopRoom){stopRoom();stopRoom=null;} currentCode='';
 A.innerHTML=`<div class=logo>ROOHU<b>ONLINE ARENA</b></div><p class=mu>Play with a friend over the internet.</p>
 <div class=card><h3>Create a private room</h3><input id=playerName maxlength=18 placeholder="Your player name" value="${playerName()}" style="width:100%;padding:13px;border-radius:10px;border:1px solid var(--ln);background:var(--bg);color:var(--tx);margin-bottom:10px"><button class=p style="width:100%" onclick="createOnlineRoom()">Create room</button></div>
 <div class=card><h3>Join a room</h3><input id=roomCode maxlength=6 placeholder="Enter 6-character code" autocapitalize=characters style="width:100%;padding:13px;border-radius:10px;border:1px solid var(--ln);background:var(--bg);color:var(--tx);margin-bottom:10px"><button style="width:100%" onclick="joinOnlineRoom()">Join room</button></div>
 <p id=onlineError class=mu></p><button onclick="home()">Back to offline game</button>`;
}
function error(e){const el=document.querySelector('#onlineError');if(el)el.textContent=e?.message||'Something went wrong. Check your connection and database rules.';}
async function createOnlineRoom(){
 if(busy)return;busy=true;
 try{const u=await ensureAuth(),name=document.querySelector('#playerName').value.trim().slice(0,18)||'Player';try{localStorage.setItem('rfa_name',name)}catch{}
 let c=code(),room={hostUid:u.uid,guestUid:'',status:'waiting',createdAt:Date.now(),players:{[u.uid]:{name,ready:false}}};
 await set(ref(db,'rooms/'+c),room);watchRoom(c);
 }catch(e){error(e)}finally{busy=false}
}
async function joinOnlineRoom(){
 if(busy)return;busy=true;
 try{const u=await ensureAuth(),c=document.querySelector('#roomCode').value.trim().toUpperCase();if(!/^[A-Z0-9]{6}$/.test(c))throw Error('Enter a valid 6-character room code.');
 const r=ref(db,'rooms/'+c);let joined=false;
 const tx=await runTransaction(r,v=>{if(!v||v.guestUid||v.hostUid===u.uid)return;v.guestUid=u.uid;v.players=v.players||{};v.players[u.uid]={name:playerName(),ready:false};return v;});
 if(!tx.committed)throw Error('Room not found or already full.');joined=true;watchRoom(c);
 }catch(e){error(e)}finally{busy=false}
}
function watchRoom(c){
 currentCode=c;if(stopRoom)stopRoom();
 stopRoom=onValue(ref(db,'rooms/'+c),snap=>{const r=snap.val();if(!r){error(new Error('Room no longer exists.'));return;}
 const players=Object.entries(r.players||{});A.innerHTML=`<div class=logo>ONLINE<b>ROOM ${c}</b></div><div class=card><h3>Waiting room</h3><p class=mu>Share this code with your friend:</p><div style="font-size:34px;font-weight:800;letter-spacing:8px;color:var(--g);text-align:center;padding:12px">${c}</div><button style="width:100%" onclick="navigator.clipboard?.writeText('${c}')">Copy room code</button></div>
 <div class=card><h3>Players (${players.length}/2)</h3>${players.map(([id,p])=>`<p>${p.name||'Player'} ${id===r.hostUid?'· Host':'· Guest'} — ${p.ready?'Ready':'Not ready'}</p>`).join('')}
 <button class=p style="width:100%" onclick="toggleOnlineReady()">I'm ready</button><p class=mu>${players.length<2?'Waiting for your friend to join…':players.every(([,p])=>p.ready)?'Both players ready. Match start integration is next.':'Waiting for both players to be ready.'}</p></div>
 <button onclick="leaveOnlineRoom()">Leave room</button>`;
 });
}
async function toggleOnlineReady(){const u=auth.currentUser;if(!u||!currentCode)return;const p=ref(db,'rooms/'+currentCode+'/players/'+u.uid+'/ready');const s=await get(p);await set(p,!(s.val()===true));}
async function leaveOnlineRoom(){const u=auth.currentUser,c=currentCode;if(stopRoom){stopRoom();stopRoom=null;}currentCode='';if(u&&c){const r=ref(db,'rooms/'+c);const s=await get(r);const v=s.val();if(v){if(v.hostUid===u.uid)await set(r,null);else await update(r,{guestUid:'',status:'waiting', ['players/'+u.uid]:null});}}onlineHome();}
export {onlineHome,createOnlineRoom,joinOnlineRoom,toggleOnlineReady,leaveOnlineRoom};
