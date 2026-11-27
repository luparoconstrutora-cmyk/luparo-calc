/* ---------- capa ---------- */
const HOME=[['laje','Concreto','Laje, viga, pilar, sapata, baldrame e mais','concreto'],['calc','Calculadora','Contas rápidas do dia a dia','calculadora'],['estribos','Estribos','Quantidade e dimensões','estribos'],['corte','Corte de ferragem','Plano nas barras de 12 m','corte'],['blocos','Alvenaria','Paredes, blocos e argamassa','blocos'],['betoneira','Betoneira','Betonadas pelo traço','betoneira'],['tracos','Traços','Padrão Luparo por balde','tracos'],['pintura','Pintura','Tinta, massa, seladora, grafiato','pintura'],['cer','Pisos cerâmicos','Piso, argamassa, nivelador','piso'],['telhado','Telhado','Telhas, madeiramento, parafusos','telhado']];
$('#bld').innerHTML=art('predio');
$('#home').innerHTML=`<div class="tiles">${HOME.map(([a,n,d,go])=>`<a class="tile" href="#${go}"><span class="pic">${art(a)}</span><span><b>${n}</b><small>${d}</small></span><span class="go">${IC.chev}</span></a>`).join('')}</div>`;

/* ---------- navegação ---------- */
const TABS=['inicio','calculadora','concreto','estribos','corte','blocos','betoneira','tracos','pintura','piso','telhado','historico'];
let navN=0;
function show(){const h=location.hash.slice(1),k=TABS.includes(h)?h:'inicio';$$('.pane').forEach(p=>p.classList.toggle('on',p.id==='p-'+k));
 $$('.nav a').forEach(a=>{const on=a.getAttribute('href')==='#'+k;a.classList.toggle('on',on);on?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current')});window.scrollTo(0,0);navN++;RESVIS=false;updBar()}
const go=k=>{if(location.hash==='#'+k)show();else location.hash=k};
addEventListener('hashchange',show);

/* ---------- histórico ---------- */
let HIST=[],histDb=false;
const MODN={concreto:'Cubicagem',estribos:'Estribos',corte:'Corte de ferragem',blocos:'Alvenaria',betoneira:'Betoneira',pintura:'Pintura',piso:'Pisos cerâmicos',telhado:'Telhado'};
function localHist(){try{return JSON.parse(localStorage.getItem('luparo-hist')||'[]')}catch(e){return []}}
function renderHist(){const L=histDb?HIST:localHist();
 $('#histSt').textContent=histDb?'Cálculos salvos no banco da Luparo, visíveis para a equipe.':'Banco indisponível: cálculos salvos só neste aparelho.';
 $('#histList').innerHTML=L.length?L.map(h=>`<div class="tr"><p class="m">${esc(MODN[h.mod]||h.mod)} · ${esc(new Date(h.criado).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'}))}${h.autor?' · '+esc(h.autor):''}</p><h4>${esc(h.titulo)}</h4><p class="hb">${esc(h.big)} <span class="m">${esc(h.unit)}</span></p><details><summary>Ver resumo</summary><pre>${esc(h.txt)}</pre></details><div class="b"><button class="nv" data-ho="${esc(h.id)}">Abrir</button><button data-hc="${esc(h.id)}">Copiar</button><button data-hd="${esc(h.id)}">Excluir</button></div></div>`).join(''):'<p class="empty">Nenhum cálculo salvo ainda. Use "Salvar cálculo" no resultado de qualquer tela.</p>'}
const findH=id=>(histDb?HIST:localHist()).find(h=>h.id===id);
async function saveHist(mod,titulo,box){
 const L=LAST[mod]||{},h={mod,titulo:titulo||((MODN[mod]||mod)+' '+new Date().toLocaleDateString('pt-BR')),big:L.big||'',unit:L.unit||'',txt:TXT[mod]||'',snap:JSON.stringify({v:S.v,rows:S.rows}),criado:new Date().toISOString(),autor:USER||''};
 const msg=box.querySelector('.toast');
 try{if(DB){await DB.collection('historico').doc().set(h)}else{const A=localHist();A.unshift({...h,id:'l'+Date.now()});localStorage.setItem('luparo-hist',JSON.stringify(A.slice(0,100)));renderHist()}
  msg.textContent='Cálculo salvo no histórico.';box.querySelector('.row').style.display='none'}catch(err){msg.textContent=err&&err.code==='invalid_argument'?'Sem permissão para salvar (peça acesso de Colaborador).':'Não foi possível salvar agora.'}}
function openHist(h){try{const s=JSON.parse(h.snap);if(s&&s.v&&s.rows){S.v={...S.v,...s.v};for(const k in s.rows)if(Array.isArray(s.rows[k]))S.rows[k]=s.rows[k];
 $$('[data-s]').forEach(el=>{const k=el.dataset.s;if(S.v[k]!==undefined){if(el.type==='checkbox')el.checked=!!S.v[k];else el.value=S.v[k]}});for(const k in ROWS)renderRows(k);renderSeg();renderPList();fillBetSel();fillConcSel();save();calc();go(h.mod)}}catch(e){}}
async function copyTxt(t,b,lab){try{await navigator.clipboard.writeText(t);const o=b.innerHTML;b.textContent='Copiado';setTimeout(()=>b.innerHTML=o,1600);return true}catch(e){return false}}

/* ---------- cliques ---------- */
document.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;
 if(d.un){S.v.unidade=d.un;save();renderUnit();renderConc();if(typeof cRender==='function'){pReset();cRender()}}
 else if(d.seg){S.v.concTipo=d.seg;EDIT.conc=null;renderSeg();renderConc();save()}
 else if(d.pfok)pfOk(d.pfok);
 else if(d.pfx)pfCancel(d.pfx);
 else if(d.ed)pfEdit(d.ed,+d.i);
 else if(d.rm){if(b.dataset.arm!=='1'){b.dataset.arm='1';b.textContent='?';b.setAttribute('aria-label','Confirmar exclusão');setTimeout(()=>{b.dataset.arm='';b.textContent='×'},2500);return}S.rows[d.rm].splice(+d.i,1);if(EDIT[d.rm]!=null)pfCancel(d.rm);save();calc();if(d.rm==='conc')renderSeg()}
 else if(b.id==='sbGo'){const r=$('.pane.on .res');if(r)r.scrollIntoView({behavior:'smooth',block:'start'})}
 else if(d.dupk){const r=S.rows[d.dupk][+d.i];if(r){S.rows[d.dupk].splice(+d.i+1,0,{...r,desc:''});renderRows(d.dupk);save();calc()}}
 else if(d.dup!==undefined){const r=S.rows.conc[+d.dup];if(r){S.rows.conc.splice(+d.dup+1,0,{...r,desc:''});renderConc();save();calc()}}
 else if(d.add){S.rows[d.add].push({...ROWS[d.add].def});renderRows(d.add);save();calc();const ins=$$(`#rows-${d.add} tbody tr:last-child input`);if(ins[0])ins[0].focus()}
 else if(d.del){S.rows[d.del].splice(+d.i,1);if(!S.rows[d.del].length&&ROWS[d.del].def)S.rows[d.del].push({...ROWS[d.del].def});renderRows(d.del);save();calc()}
 else if(d.clear){if(b.dataset.arm!=='1'){b.dataset.arm='1';b.textContent='Confirmar';setTimeout(()=>{b.dataset.arm='';b.textContent='Limpar'},3000);return}
  d.clear.split(',').forEach(k=>{S.rows[k]=(k==='conc'||k==='est')?[]:ROWS[k].def?[{...ROWS[k].def}]:[];renderRows(k)});if(d.clear==='conc')renderConc();if(d.clear==='est')renderList('est');b.dataset.arm='';b.textContent='Limpar';save();calc()}
 else if(d.share){const t=TXT[d.share]||'',box=$('#cb-'+d.share);if(await copyTxt(t,b)){box.innerHTML='<p class="toast">Resumo copiado: cole no WhatsApp ou e-mail.</p>'}else{box.innerHTML='<textarea class="copybox" readonly></textarea><p class="note">Selecione e copie o texto acima.</p>';const ta=box.querySelector('textarea');ta.value=t;ta.focus();ta.select()}}
 else if(d.save){const box=$('#sv-'+d.save);if(box.innerHTML&&box.querySelector('.row').style.display!=='none'){box.innerHTML='';return}
  box.innerHTML=`<div class="row"><input type="text" placeholder="Nome (ex.: Obra X · baldrames)" aria-label="Nome do cálculo"><button class="nv" data-sv="${d.save}">Salvar</button></div><p class="toast"></p>`;box.querySelector('input').focus()}
 else if(d.sv){const box=$('#sv-'+d.sv);b.disabled=true;await saveHist(d.sv,box.querySelector('input').value.trim(),box);b.disabled=false}
 else if(d.calc){$('#res-'+d.calc).scrollIntoView({behavior:'smooth',block:'start'})}
 else if(d.back!==undefined){if(navN>1&&history.length>1)history.back();else go('inicio')}
 else if(d.go)go(d.go);
 else if(d.send==='concreto'){setS('betVol',CONC.toFixed(3));const c=TR.find(t=>t.id===V('concTraco'));if(c)setS('betTraco',c.id);save();calc();go('betoneira')}
 else if(d.send==='blocos'){setS('betVol',ARG.toFixed(3));const c=TR.find(t=>t.tipo==='Argamassa');if(c){setS('betTraco',c.id)}save();calc();go('betoneira')}
 else if(d.send==='estribos'&&EST){EST.rows.forEach(e=>{if(e.NT>0)S.rows.corte.push({desc:'Estribo '+e.desc,phi:String(e.phi),comp:e.comp.toFixed(1),q:String(e.NT)});if(e.nl>0&&e.cl>0)S.rows.corte.push({desc:'Long. '+e.desc,phi:String(e.pl),comp:e.cl.toFixed(0),q:String(e.nl)})});
  S.rows.corte=S.rows.corte.filter(r=>r.comp!==''||r.desc!=='');renderRows('corte');save();calc();go('corte')}
 else if(d.ho){const h=findH(d.ho);if(h)openHist(h)}
 else if(d.hc){const h=findH(d.hc);if(h)copyTxt(h.txt,b)}
 else if(d.hd){armDel(b,async()=>{if(histDb)await DB.collection('historico').doc(d.hd).delete();else{localStorage.setItem('luparo-hist',JSON.stringify(localHist().filter(h=>h.id!==d.hd)));renderHist()}})}
 else if(d.te!==undefined)tfLoad(TR.find(t=>t.id===d.te));
 else if(d.td!==undefined)armDel(b,()=>DB.collection('tracos').doc(d.td).delete());
 else if(d.pe!==undefined)pfLoad(PR.find(p=>p.id===d.pe));
 else if(d.pd!==undefined)armDel(b,()=>DB.collection('produtos').doc(d.pd).delete());
 else if(b.id==='seedTr')seed('tracos',REF_TR,b);
 else if(b.id==='seedPr')seed('produtos',REF_PR,b);
});
function armDel(b,fn){if(b.dataset.arm!=='1'){b.dataset.arm='1';b.textContent='Confirmar exclusão';setTimeout(()=>{b.dataset.arm='';b.textContent='Excluir'},3000);return}Promise.resolve().then(fn).catch(err=>alertDb(err))}
function alertDb(err){const m=err&&err.code==='invalid_argument'?'Sem permissão para alterar o banco (peça acesso de Colaborador ao Marcos).':err&&err.code==='quota_exceeded'?'Banco cheio: apague itens antigos.':'Não foi possível salvar agora. Tente de novo.';$('#tf-err').textContent=m;$('#pf-err').textContent=m}
