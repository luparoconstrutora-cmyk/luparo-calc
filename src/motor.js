/* ---------- motor ---------- */
function calc(){rowVals();cConcreto();cEstribos();cCorte();cBlocos();cBet();cPintura();cPiso();cTelhado()}
function initScalars(){$$('[data-s]').forEach(el=>{const k=el.dataset.s;if(S.v[k]!==undefined){if(el.type==='checkbox')el.checked=!!S.v[k];else el.value=S.v[k]}else S.v[k]=el.type==='checkbox'?el.checked:el.value})}
function setS(k,v){S.v[k]=v;const el=$(`[data-s="${k}"]`);if(el)el.value=v}
function onField(e){const t=e.target;
 if(t.dataset.s){S.v[t.dataset.s]=t.type==='checkbox'?t.checked:t.value;
  if(t.dataset.s==='bTipo'){const b=BT.find(x=>x[0]===t.value);if(b&&b[2]){setS('bL',b[2]);setS('bH',b[3]);setS('bE',b[4]);setS('bFat',b[5])}}
  if(t.dataset.s==='tTipo'){setS('tPm2','');setS('tUtil','')}
  save();calc()}
 else if(t.dataset.k){const r=S.rows[t.dataset.k][+t.dataset.i];if(r){r[t.dataset.f]=t.value;save();calc()}}
 else if(t.dataset.p){const p=PR.find(x=>x.id===t.dataset.p);if(!p)return;const cur=pSel(p);if(t.dataset.pf==='on')cur.on=t.checked;else cur.dem=t.value;S.v.pSel[p.id]=cur;save();cPintura()}
 else if(t.closest&&t.closest('#trForm'))tfAuto();
}
document.addEventListener('input',onField);document.addEventListener('change',e=>{if(e.target.tagName==='SELECT'||e.target.type==='checkbox')onField(e)});

