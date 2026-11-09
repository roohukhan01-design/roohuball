// @ts-nocheck
// Game logic carried over from the published ROOHU Football Arena artifact.
const RAW=`Yashin|URS|GK|92
Neuer|GER|GK|91
Buffon|ITA|GK|91
Casillas|ESP|GK|90
Kahn|GER|GK|89
Schmeichel|DEN|GK|88
Beckenbauer|GER|DF|93
Maldini|ITA|DF|92
Baresi|ITA|DF|91
Cafu|BRA|DF|90
Roberto Carlos|BRA|DF|90
Sergio Ramos|ESP|DF|90
Van Dijk|NED|DF|90
Bobby Moore|ENG|DF|89
Lahm|GER|DF|89
Cannavaro|ITA|DF|89
Puyol|ESP|DF|88
Thuram|FRA|DF|87
Maradona|ARG|MF|97
Cruyff|NED|MF|96
Zidane|FRA|MF|95
Iniesta|ESP|MF|93
Xavi|ESP|MF|92
Platini|FRA|MF|92
Pirlo|ITA|MF|91
Modrić|CRO|MF|91
Matthäus|GER|MF|91
De Bruyne|BEL|MF|91
Gullit|NED|MF|90
Kroos|GER|MF|90
Busquets|ESP|MF|88
Kanté|FRA|MF|87
Pelé|BRA|FW|98
Messi|ARG|FW|98
Ronaldo Nazário|BRA|FW|96
Cristiano Ronaldo|POR|FW|95
Mbappé|FRA|FW|94
Puskás|HUN|FW|93
Van Basten|NED|FW|93
Ronaldinho|BRA|FW|93
Henry|FRA|FW|92
Eusébio|POR|FW|92
Garrincha|BRA|FW|92
Lewandowski|POL|FW|92
Gerd Müller|GER|FW|91
Romário|BRA|FW|90`;
const P=RAW.split('\n').map((l,i)=>{const[n,c,p,o]=l.split('|');return{id:i,n,c,p,o:+o}});
const F={'4-3-3':{DF:4,MF:3,FW:3},'4-4-2':{DF:4,MF:4,FW:2},'3-5-2':{DF:3,MF:5,FW:2},'3-4-3':{DF:3,MF:4,FW:3}};
const T={'Balanced':[1,1,1],'Possession':[.97,1.08,1],'Counterattack':[1.06,.95,1.02],'High pressing':[1.04,1.05,.93],'Low block':[.92,.97,1.1],'Direct':[1.05,.94,1],'Wide attacking':[1.03,1,.98]};
const POS=['GK','DF','MF','FW'],DIFF=['Beginner','Normal','Professional','Legendary'];
const A=document.querySelector('#app'),$=s=>document.querySelector(s);let S={};let inGame=false;
const rnd=seed=>{let a=seed>>>0;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}};
const cl=(v,a,b)=>Math.max(a,Math.min(b,v));
function rec(){try{return JSON.parse(localStorage.getItem('rfa')||'')||{w:0,d:0,l:0}}catch(e){return{w:0,d:0,l:0}}}
function saveRec(r){try{localStorage.setItem('rfa',JSON.stringify(r))}catch(e){}}
function home(){clearInterval(S.tm);clearTimeout(S.ct);inGame=false;const r=rec();A.innerHTML=`<div class=logo>ROOHU<b>FOOTBALL ARENA</b></div><p class=mu>Draft legends, build your XI, win the final.</p>
<div class=card><h3>Play vs CPU</h3><div class=row>${DIFF.map((d,i)=>`<button onclick="start('cpu',${i})">${d}</button>`).join('')}</div></div>
<div class=card><h3>Online multiplayer</h3><p class=mu>Create a private room or join a friend using a room code.</p><button class=p style="width:100%" onclick="onlineHome()">Play online</button></div>
<div class=card><h3>Two players, one device</h3><button class=p onclick="start('local',0)">Pass and play</button></div>
<div class=card><h3>Your record vs CPU</h3><p style="margin:0">${r.w} W · ${r.d} D · ${r.l} L</p></div>
<p class=mu>Ratings are game ratings, not official statistics. This version is single-device: online rooms are not included.</p>`}
function start(mode,d){inGame=true;S={mode,d,names:mode=='cpu'?['You','CPU']:['Player 1','Player 2'],form:[],picks:[[],[]],tac:[],tab:'ALL',t:0,order:Array.from({length:22},(_,k)=>[0,1,1,0][k%4])};formation(0)}
const isCpu=s=>S.mode=='cpu'&&s==1;
function formation(s){A.innerHTML=`<div class=logo><b>${S.names[s]}</b></div><h3>Choose your formation</h3><div class=row>${Object.keys(F).map(f=>`<button onclick="setF(${s},'${f}')">${f}</button>`).join('')}</div>`}
function setF(s,f){S.form[s]=f;if(s==0){if(S.mode=='cpu'){const k=Object.keys(F);S.form[1]=k[Math.random()*k.length|0];draft()}else formation(1)}else draft()}
function need(s,pos){return(pos=='GK'?1:F[S.form[s]][pos])-S.picks[s].filter(i=>P[i].p==pos).length}
function pitch(s){const f=F[S.form[s]],ps=S.picks[s].map(i=>P[i]),ys={GK:90,DF:72,MF:48,FW:22};let h='<div class=pitch>';
POS.forEach(pos=>{const n=pos=='GK'?1:f[pos],a=ps.filter(p=>p.p==pos);for(let j=0;j<n;j++){const p=a[j],x=(j+1)/(n+1)*100;h+=`<div class="dot ${p?'':'e'}" style="left:${x}%;top:${ys[pos]}%"><i>${p?p.o:'+'}</i>${p?`<u>${p.n.split(' ').pop()}</u>`:''}</div>`}});return h+'</div>'}
function draft(){if(S.t>=22){tactics(0);return}const s=S.order[S.t],taken=S.picks.flat();
const list=P.filter(p=>!taken.includes(p.id)&&(S.tab=='ALL'||p.p==S.tab)).sort((a,b)=>b.o-a.o);
A.innerHTML=`<h3>${S.names[s]}${S.mode=='local'?'’s pick':isCpu(s)?' is picking…':' – your pick'} <span class=mu>(${S.t+1}/22 · ${S.form[s]})</span></h3>${pitch(s)}
<div class=row style="margin-bottom:8px">${['ALL',...POS].map(t=>`<button class="${S.tab==t?'on':''}" style="flex:1 1 15%;padding:8px" onclick="setTab('${t}')">${t}</button>`).join('')}</div>
${list.map(p=>`<button class=r2 ${need(s,p.p)>0&&!isCpu(s)?'':'disabled'} onclick="pick(${p.id})"><span>${p.n}</span><span class=mu>${p.c} · ${p.p}</span><b>${p.o}</b></button>`).join('')}`;
clearTimeout(S.ct);if(isCpu(s))S.ct=setTimeout(cpuPick,600)}
function pick(id){const s=S.order[S.t];if(S.picks.flat().includes(id)||need(s,P[id].p)<1)return;S.picks[s].push(id);S.t++;draft()}
function cpuPick(){if(!inGame||S.t>=22)return;const s=S.order[S.t],tk=S.picks.flat(),nz=[25,12,5,0][S.d];
const c=P.filter(p=>!tk.includes(p.id)&&need(s,p.p)>0).map(p=>({p,v:p.o+Math.random()*nz})).sort((a,b)=>b.v-a.v);pick(c[0].p.id)}
function str(s){const ps=S.picks[s].map(i=>P[i]),av=pos=>{const a=ps.filter(p=>p.p==pos);return a.reduce((x,p)=>x+p.o,0)/a.length},nat={};
ps.forEach(p=>nat[p.c]=(nat[p.c]||0)+1);const chem=Object.values(nat).filter(n=>n>1).reduce((x,n)=>x+n,0)/11*2,t=T[S.tac[s]||'Balanced'],b=(isCpu(s)?[-4,0,2,4][S.d]:0)+chem;
return{ps,chem,att:(av('FW')*.6+av('MF')*.4)*t[0]+b,mid:av('MF')*t[1]+b,def:(av('DF')*.7+av('GK')*.3)*t[2]+b,gk:ps.find(p=>p.p=='GK')}}
function tactics(s){S.tac[s]=S.tac[s]||'Balanced';const q=str(s);
A.innerHTML=`<h3>${S.names[s]}: tactics <span class=mu>(${S.form[s]})</span></h3>${pitch(s)}
<p class=mu>Attack ${q.att.toFixed(0)} · Midfield ${q.mid.toFixed(0)} · Defence ${q.def.toFixed(0)} · Chemistry +${q.chem.toFixed(1)}</p>
<div class=row>${Object.keys(T).map(t=>`<button class="${S.tac[s]==t?'on':''}" onclick="setTac(${s},'${t}')">${t}</button>`).join('')}</div>
<p><button class=p style="width:100%" onclick="tacDone(${s})">Confirm lineup</button></p>`}
function tacDone(s){if(s==0){if(S.mode=='cpu'){const k=Object.keys(T);S.tac[1]=k[Math.random()*k.length|0];match()}else tactics(1)}else match()}
function sim(seed){const R=rnd(seed),Tm=[str(0),str(1)],ev=[],sc=[0,0],st=[0,1].map(()=>({sh:0,sot:0,co:0,fo:0,yc:0,rc:0,pos:0})),pm=[1,1],pl={};
const ps=i=>pl[i]||(pl[i]={g:0,a:0,s:0}),add=(m,side,type,text)=>ev.push({m,side,type,text,sc:[...sc]});
const pw=(arr,w)=>{let t=arr.reduce((x,p)=>x+w(p),0),r=R()*t;for(const p of arr){r-=w(p);if(r<=0)return p}return arr[arr.length-1]};
function run(from,to,k){for(let m=from;m<=to;m++){const p=1/(1+Math.exp(-(Tm[0].mid*pm[0]-Tm[1].mid*pm[1])/6));st[R()<p?0:1].pos++;if(R()>.3*k)continue;
const a=R()<p?0:1,d=1-a,TA=Tm[a],TD=Tm[d],q=TA.att*pm[a]-TD.def*pm[d],N=S.names;
if(R()<cl(.5+q/80,.25,.8)){const sh=pw(TA.ps.filter(x=>x.p!='GK'),x=>({FW:3,MF:1.2,DF:.2}[x.p])*x.o*x.o);st[a].sh++;
if(R()<cl(.42+q/120,.25,.65)){st[a].sot++;if(R()<cl(.3+(sh.o-TD.gk.o)/120+q/220,.1,.55)){sc[a]++;const as=R()<.7?pw(TA.ps.filter(x=>x!==sh&&x.p!='GK'),x=>x.p=='MF'?2:1):null;ps(sh.id).g++;if(as)ps(as.id).a++;add(m,a,'goal','GOAL! '+sh.n+' scores for '+N[a]+(as?' (assist: '+as.n+')':'')+'.')}
else{ps(TD.gk.id).s++;add(m,a,'save',TD.gk.n+' saves a shot from '+sh.n+'.')}}else add(m,a,'miss',sh.n+' fires wide.')}
else{const x=R();if(x<.4){st[a].co++;add(m,a,'corner','Corner for '+N[a]+'.')}else if(x<.75){const df=TD.ps.filter(y=>y.p!='GK')[R()*10|0];st[d].fo++;
if(R()<.07){const tk=TA.ps.filter(y=>y.p=='FW').sort((u,v)=>v.o-u.o)[0],ok=R()<.78;st[a].sh++;if(ok){st[a].sot++;sc[a]++;ps(tk.id).g++}add(m,a,ok?'goal':'save','Penalty to '+N[a]+'! '+tk.n+(ok?' scores!':' misses!'))}
else if(R()<.015){st[d].rc++;pm[d]*=.93;add(m,d,'red','RED CARD! '+df.n+' is sent off.')}else if(R()<.2){st[d].yc++;add(m,d,'yellow','Yellow card: '+df.n+'.')}}}}}
add(0,-1,'ko','Kick-off! '+S.names[0]+' vs '+S.names[1]+'.');run(1,45,1);add(45,-1,'ht','Half-time.');run(46,90,1);add(90,-1,'ft','Full-time.');
if(sc[0]==sc[1]){add(90,-1,'ht','Level after 90. Extra time.');run(91,105,.8);run(106,120,.8);add(120,-1,'ft','End of extra time.')}
let pens=null;if(sc[0]==sc[1]){pens=[0,0];add(120,-1,'ko','Penalty shootout!');const tk=[0,1].map(s=>Tm[s].ps.filter(p=>p.p!='GK').sort((x,y)=>y.o-x.o));
for(let rd=0;rd<5||(pens[0]==pens[1]&&rd<20);rd++)for(const s of[0,1]){const k=tk[s][rd%10],ok=R()<cl(.76+(k.o-Tm[1-s].gk.o)/250,.55,.92);if(ok)pens[s]++;add(120,s,'pen',k.n+(ok?' scores':' misses')+' ('+pens[0]+'-'+pens[1]+').')}
if(pens[0]==pens[1])pens[0]++}
const win=sc[0]!=sc[1]?(sc[0]>sc[1]?0:1):(pens[0]>pens[1]?0:1);let potm=null;
[0,1].forEach(s=>Tm[s].ps.forEach(p=>{const z=pl[p.id]||{g:0,a:0,s:0};const r=6+z.g*1.2+z.a*.7+z.s*.25+(R()-.5)+(win==s?.3:0)+((p.p=='GK'||p.p=='DF')&&sc[1-s]==0?.4:0);if(!potm||r>potm.r)potm={n:p.n,r,s}}));
const tp=st[0].pos+st[1].pos;st.forEach(x=>x.pp=Math.round(x.pos/tp*100));return{ev,sc,st,pens,win,seed,potm}}
function match(){S.seed=Math.floor(Math.random()*1e9);S.res=sim(S.seed);
A.innerHTML=`<div class=card><div class=sb><div>${S.names[0]}</div><strong><span id=s0>0</span>-<span id=s1>0</span></strong><div>${S.names[1]}</div></div><p class=mu style="text-align:center;margin:6px 0" id=tm>0′</p>
<div class=row id=ctl><button onclick="play(350)">Normal</button><button onclick="play(70)">Fast</button><button class=p onclick="play(0)">Instant result</button></div><div id=feed></div></div><div id=fin></div>`}
function play(sp){const R=S.res;let i=0;$('#ctl').style.display='none';const f=$('#feed'),step=()=>{const e=R.ev[i++];$('#s0').textContent=e.sc[0];$('#s1').textContent=e.sc[1];$('#tm').textContent=e.m+'′';
f.insertAdjacentHTML('afterbegin','<div class="ev '+e.type+'"><b>'+e.m+'′</b> '+e.text+'</div>')};
if(!sp){while(i<R.ev.length)step();fin();return}S.tm=setInterval(()=>{if(i>=R.ev.length){clearInterval(S.tm);fin()}else step()},sp)}
function fin(){const R=S.res,st=R.st,w=S.names[R.win];if(S.mode=='cpu'){const r=rec();R.win==0?(R.sc[0]==R.sc[1]&&!R.pens?r.d++:r.w++):r.l++;saveRec(r)}
const row=(l,a,b)=>`<tr><td>${a}</td><td>${l}</td><td>${b}</td></tr>`;
$('#fin').innerHTML=`<div class=card><h3>${w} win${S.mode=='cpu'&&R.win==0?' the final!':'s the final!'}</h3><p>Full-time score ${R.sc[0]}-${R.sc[1]}${R.pens?`, penalties ${R.pens[0]}-${R.pens[1]}`:''}.</p>
<table>${row('Possession',st[0].pp+'%',st[1].pp+'%')}${row('Shots',st[0].sh,st[1].sh)}${row('On target',st[0].sot,st[1].sot)}${row('Corners',st[0].co,st[1].co)}${row('Fouls',st[0].fo,st[1].fo)}${row('Yellow cards',st[0].yc,st[1].yc)}${row('Red cards',st[0].rc,st[1].rc)}</table>
<p>Player of the Match: <b>${R.potm.n}</b> (${R.potm.r.toFixed(1)})</p><p class=mu>Match seed ${R.seed}: the same squads and seed always give the same match.</p>
<div class=row><button class=p onclick="match()">Rematch</button><button onclick="home()">New game</button></div></div>`}
function setTab(t){S.tab=t;draft()}
function setTac(s,t){S.tac[s]=t;tactics(s)}
function isInGame(){return inGame}
home();
export {home,start,setF,pick,draft,tactics,tacDone,match,play,setTab,setTac,isInGame};
