/* ---------- formulário de traço ---------- */
let tfId=null;
function adsUI(ads){$('#tf-ads').innerHTML=[0,1,2].map(i=>{const a=(ads||[])[i]||{};return `<div class="fields" style="grid-template-columns:minmax(0,2fr) minmax(0,1fr) minmax(0,1fr);margin-bottom:6px"><input type="text" id="tf-an${i}" placeholder="Aditivo ${i+1} (ex.: Vedacit)" value="${esc(a.n)}" aria-label="Nome do aditivo ${i+1}"><input id="tf-aq${i}" inputmode="decimal" placeholder="qtd" value="${esc(a.q??'')}" aria-label="Quantidade"><select id="tf-au${i}" aria-label="Unidade">${['ml','L','g','kg'].map(u=>`<option ${a.u===u?'selected':''}>${u}</option>`).join('')}</select></div>`}).join('')}
function tfRead(){const g=i=>$('#tf-'+i).value;return {nome:g('nome').trim(),tipo:g('tipo'),uso:g('uso').trim(),cim:num(g('cim')),cal:num(g('cal')),are:num(g('are')),bri:num(g('bri')),agu:num(g('agu')),ren:num(g('ren')),ads:[0,1,2].map(i=>({n:$('#tf-an'+i).value.trim(),q:num($('#tf-aq'+i).value),u:$('#tf-au'+i).value})).filter(a=>a.n&&a.q)}}
function tfAuto(){const t=tfRead();$('#tf-auto').textContent='Rendimento estimado: '+f(rendAuto(t),0)+' L por massada ('+f(rendAuto(t)/1000,3)+' m³).'+(t.ren?' Usando o medido: '+f(t.ren,0)+' L.':'')}
function tfLoad(t){tfId=t&&!trRef?t.id:null;t=t||{nome:'',tipo:'Concreto',uso:'',cim:1,cal:0,are:4,bri:6,agu:27,ren:'',ads:[]};
 ['nome','tipo','uso','cim','cal','are','bri','agu'].forEach(k=>$('#tf-'+k).value=t[k]??'');$('#tf-ren').value=num(t.ren)>0?t.ren:'';adsUI(t.ads);$('#tfTitle').textContent=tfId?'Editar traço':'Novo traço';$('#tf-err').textContent='';tfAuto();if(t.nome)$('#trForm').scrollIntoView({block:'start',behavior:'smooth'})}
$('#tf-new').onclick=()=>tfLoad(null);
$('#tf-save').onclick=async()=>{const t=tfRead();if(!t.nome){$('#tf-err').textContent='Dê um nome ao traço.';return}if(!(t.cim>0)){$('#tf-err').textContent='Informe os sacos de cimento.';return}
 if(!DB){$('#tf-err').textContent='Banco indisponível nesta visualização: abra pelo link do app no claude.ai.';return}
 if(trRef){$('#tf-err').textContent='Grave primeiro os traços de referência no banco (botão abaixo da lista).';return}
 const b=$('#tf-save');b.disabled=true;try{t.atualizado=new Date().toISOString();await (tfId?DB.collection('tracos').doc(tfId):DB.collection('tracos').doc()).set(t);tfLoad(null);$('#tf-err').textContent='Traço salvo.'}catch(err){alertDb(err)}b.disabled=false};
function renderTr(){
 $('#trList').innerHTML=TR.map(t=>`<div class="tr"><h4>${esc(t.nome)}<span class="tag">${esc(t.tipo)}</span></h4>${t.uso?`<p class="m">${esc(t.uso)}</p>`:''}<p>${compTxt(t).map(esc).join(' · ')}</p><p class="m">Rende ${f(rendL(t),0)} L por massada (${f(rendL(t)/1000,3)} m³) · ${num(t.ren)>0?'medido na obra':'estimado'} · ${f(1000/rendL(t),1)} sacos de cimento por m³</p>${trRef?'':`<div class="b"><button data-te="${esc(t.id)}">Editar</button><button data-td="${esc(t.id)}">Excluir</button></div>`}</div>`).join('')||'<p>Nenhum traço cadastrado.</p>';
 $('#trSeed').innerHTML=trRef&&DB?'<div class="card" style="margin-top:12px"><p style="margin:0 0 8px">O banco ainda está vazio. Esses são traços de referência; grave no banco para editar e usar como padrão da Luparo.</p><button class="pri" id="seedTr">Gravar traços de referência</button></div>':'';
 fillBetSel();fillConcSel();cBet();cConcreto();
}
async function seed(col,arr,b){b.disabled=true;try{for(const x of arr){const {id,...rest}=x;await DB.collection(col).doc(id.replace('ref-','p-')).set({...rest,atualizado:new Date().toISOString()})}}catch(err){alertDb(err)}b.disabled=false}

/* ---------- formulário de produto ---------- */
let pfId=null;
function pfLoad(p){pfId=p?p.id:null;p=p||{nome:'',un:'L',rend:'',dem:2,e1:18,e1n:'lata 18 L',e2:3.6,e2n:'galão 3,6 L'};['nome','un','rend','dem','e1','e1n','e2','e2n'].forEach(k=>$('#pf-'+k).value=p[k]??'');$('#pf-err').textContent=''}
$('#pf-new').onclick=()=>pfLoad(null);
$('#pf-save').onclick=async()=>{const g=k=>$('#pf-'+k).value;const p={nome:g('nome').trim(),un:g('un'),rend:num(g('rend')),dem:num(g('dem'))||1,e1:num(g('e1')),e1n:g('e1n').trim(),e2:num(g('e2')),e2n:g('e2n').trim(),o:pfId?(PR.find(x=>x.id===pfId)||{}).o||99:99};
 if(!p.nome||!(p.rend>0)||!(p.e1>0)){$('#pf-err').textContent='Preencha nome, rendimento e embalagem grande.';return}
 if(!DB){$('#pf-err').textContent='Banco indisponível nesta visualização.';return}if(prRef){$('#pf-err').textContent='Grave primeiro os produtos de referência no banco.';return}
 try{p.atualizado=new Date().toISOString();await (pfId?DB.collection('produtos').doc(pfId):DB.collection('produtos').doc()).set(p);pfLoad(null);$('#pf-err').textContent='Produto salvo.'}catch(err){alertDb(err)}};
function renderPr(){renderPList();$('#prStatus').innerHTML=prRef&&DB?'Produtos de referência (banco vazio). <button class="pri" id="seedPr">Gravar no banco</button>':'';cPintura()}

/* ---------- banco ---------- */
function status(m,err){const el=$('#dbStatus');el.textContent=m;el.classList.toggle('err',!!err)}
function sub(col,cb){let ok=false;const tm=setTimeout(()=>{if(!ok&&col==='tracos')status('O banco ainda não respondeu: mostrando a última versão disponível.',1)},10000);
 DB.collection(col).onSnapshot(snap=>{if(!snap.metadata.fromCache){ok=true;clearTimeout(tm)}cb(snap.docs.map(d=>({...d.data(),id:d.id})),snap.metadata.fromCache)},err=>{ok=true;clearTimeout(tm);if(col==='tracos')status('Banco indisponível agora ('+(err&&err.code||'erro')+'). Usando traços de referência.',1)})}
(async()=>{
 try{DB=window.claude&&window.claude.use?await window.claude.use('db'):null}catch(e){DB=null}
 if(!DB){status('Banco de traços indisponível nesta visualização: usando os traços de referência (só leitura).',1);renderTr();renderPr();return}
 sub('tracos',(arr,cache)=>{if(arr.length){TR=arr.sort((a,b)=>String(a.tipo).localeCompare(String(b.tipo))||String(a.nome).localeCompare(String(b.nome)));trRef=false;status(arr.length+' traço(s) no banco da Luparo · atualiza ao vivo')}else if(!cache){TR=REF_TR.slice();trRef=true;status('Banco vazio: mostrando traços de referência.')}renderTr();if(!tfId)tfLoad(null)});
 DB.collection('historico').orderBy('criado','desc').limit(200).onSnapshot(snap=>{HIST=snap.docs.map(d=>({...d.data(),id:d.id}));histDb=true;renderHist()},()=>{histDb=false;renderHist()});
 sub('produtos',(arr,cache)=>{if(arr.length){PR=arr.sort((a,b)=>num(a.o)-num(b.o)||String(a.nome).localeCompare(String(b.nome)));prRef=false}else if(!cache){PR=REF_PR.slice();prRef=true}renderPr()});
})();

