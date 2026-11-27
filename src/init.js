/* ---------- bloqueia zoom (toque duplo e pinça) ---------- */
['gesturestart','gesturechange','gestureend'].forEach(ev=>document.addEventListener(ev,e=>e.preventDefault(),{passive:false}));
document.addEventListener('touchmove',e=>{if(e.touches&&e.touches.length>1||(typeof e.scale==='number'&&e.scale!==1))e.preventDefault()},{passive:false});
document.addEventListener('dblclick',e=>e.preventDefault(),{passive:false});
let USER='';
(async()=>{try{const dk=window.claude&&window.claude.use?await window.claude.use('desktop'):null;if(dk&&dk.install&&await dk.install.state()==='available'){const b=$('#instBtn');b.hidden=false;b.onclick=async()=>{try{await dk.install.request()}catch(e){}}}}catch(e){}})();
/* ---------- partida ---------- */
for(const k in ROWS)renderRows(k);
if(!S.v.unitM){const cv=r=>{const c=CT[r.t];if(c)c.cm.forEach(k=>{if(r[k]!==undefined&&r[k]!=='')r[k]=String(Math.round(num(r[k])/100*10000)/10000)});return r};S.rows.conc.forEach(cv);if(Array.isArray(S.v.tape))S.v.tape.forEach(cv);if(S.v.dr)for(const id in S.v.dr){if(id.startsWith('conc:')){const t=id.slice(5);if(CT[t])S.v.dr[id]={desc:S.v.dr[id].desc||'',...CT[t].d}}}S.v.unitM=1;save()}
S.rows.conc=S.rows.conc.filter(r=>volConc(r)>0);S.rows.est=S.rows.est.filter(r=>estCalc(r).NT>0);
initScalars();renderSeg();renderConc();renderPF('est');$$('.res').forEach(r=>io.observe(r));cRender();adsUI([]);tfLoad(null);renderTr();renderPList();fillConcSel();renderHist();show();calc();
}
