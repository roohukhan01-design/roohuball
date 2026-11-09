// Runs the real game logic (src/game.ts) in Node with a fake DOM:
// 300 full drafts + matches, checks nothing gets stuck and results are deterministic.
import fs from 'node:fs';
import vm from 'node:vm';
let src = fs.readFileSync(new URL('../src/game.ts', import.meta.url), 'utf8').replace(/^export .*$/m, '');
const stub = { querySelector: () => ({ innerHTML: '', style: {}, textContent: '', insertAdjacentHTML() {} }) };
const test = `
for(let k=0;k<300;k++){start(k%2?'cpu':'local',k%4);setF(0,Object.keys(F)[k%4]);if(S.mode=='local')setF(1,Object.keys(F)[(k+1)%4]);
 while(S.t<22){const s=S.order[S.t];const c=P.filter(p=>!S.picks.flat().includes(p.id)&&need(s,p.p)>0);if(!c.length)throw new Error('draft stuck');pick(s==1?c[0].id:c[c.length-1].id)}
 S.tac=['Balanced','Direct'];const a=sim(k+1),b=sim(k+1);
 if(JSON.stringify(a)!==JSON.stringify(b))throw new Error('non-deterministic');
 if(a.sc[0]===a.sc[1]&&!a.pens)throw new Error('draw without penalties');
 if(a.pens&&a.pens[0]===a.pens[1])throw new Error('tied shootout');}
'OK: 300 drafts and matches';`;
const ctx = { document: stub, localStorage: { getItem: () => null, setItem() {} }, setTimeout: () => 0, clearTimeout() {}, clearInterval() {}, setInterval: () => 0, console };
console.log(vm.runInNewContext(src.replace('// @ts-nocheck', '') + test, ctx));
