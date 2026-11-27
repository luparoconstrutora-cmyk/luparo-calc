{
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const num=v=>{const n=parseFloat(String(v??'').replace(/\s/g,'').replace(',','.'));return isFinite(n)?n:0};
const f=(n,d=2)=>(isFinite(n)?n:0).toLocaleString('pt-BR',{maximumFractionDigits:d});
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ceil=x=>Math.ceil(x-1e-9);
const kgm=d=>0.006165*d*d;
const BALDE=18;

/* ---------- linhas editáveis ---------- */
const ROWS={
 conc:{cols:[],def:null,val:r=>volConc(r),u:'m³'},
 est:{cols:[],def:{desc:'',c:'',q:'1',b:'15',h:'30',cob:'3',s:'15',phi:'5.0',g:'5',nl:'4',pl:'10.0',anc:'20'},val:r=>0,u:'est'},
 pamb:{cols:[['desc','Ambiente','t'],['per','Perím. (m)'],['pd','Pé-dir. (m)'],['teto','Teto (m²)'],['vaos','Vãos (m²)'],['q','Qtd']],def:{desc:'',per:'',pd:'2.8',teto:'0',vaos:'0',q:'1'},val:r=>Math.max(0,num(r.per)*num(r.pd)+num(r.teto)-num(r.vaos))*num(r.q),u:'m²'},
 corte:{cols:[['desc','Peça','t'],['phi','φ (mm)'],['comp','Compr. (cm)'],['q','Qtd']],def:{desc:'',phi:'10',comp:'',q:'1'},val:r=>num(r.comp)/100*num(r.q)*kgm(num(r.phi)),u:'kg'},
 parede:{cols:[['desc','Parede','t'],['c','Compr. (m)'],['h','Alt. (m)'],['q','Qtd']],def:{desc:'',c:'',h:'2.8',q:'1'},val:r=>num(r.c)*num(r.h)*num(r.q),u:'m²'},
 vao:{cols:[['desc','Vão','t'],['l','Larg. (m)'],['h','Alt. (m)'],['q','Qtd']],def:{desc:'',l:'0.8',h:'2.1',q:'1'},val:r=>num(r.l)*num(r.h)*num(r.q),u:'m²'},
 amb:{cols:[['desc','Ambiente','t'],['c','Compr. (m)'],['l','Larg. (m)'],['q','Qtd']],def:{desc:'',c:'',l:'',q:'1'},val:r=>num(r.c)*num(r.l)*num(r.q),u:'m²'}
};
const SAMPLE={
 corte:[{desc:'Viga V1',phi:'10',comp:'420',q:'8'},{desc:'Viga V2',phi:'10',comp:'310',q:'8'},{desc:'Arranque',phi:'10',comp:'150',q:'12'}],
 parede:[{desc:'Paredes externas',c:'32',h:'2.8',q:'1'},{desc:'Paredes internas',c:'18',h:'2.8',q:'1'}],
 vao:[{desc:'Portas',l:'0.8',h:'2.1',q:'5'},{desc:'Janelas',l:'1.2',h:'1.0',q:'4'}],
 amb:[{desc:'Sala e cozinha',c:'6',l:'5',q:'1'},{desc:'Quartos',c:'3',l:'3',q:'2'}]
};
let S={v:{},rows:{}};
try{const j=JSON.parse(localStorage.getItem('luparo-calc-v1')||'null');if(j&&j.v&&j.rows)S=j}catch(e){}
for(const k in ROWS) if(!Array.isArray(S.rows[k])) S.rows[k]=JSON.parse(JSON.stringify(SAMPLE[k]||(ROWS[k].def?[ROWS[k].def]:[])));
if(!S.v.pSel||typeof S.v.pSel!=='object') S.v.pSel={};
let saveT;const save=()=>{clearTimeout(saveT);saveT=setTimeout(()=>{try{localStorage.setItem('luparo-calc-v1',JSON.stringify(S))}catch(e){}},300)};
const V=k=>S.v[k], N=k=>num(S.v[k]);

function renderRows(key){
 if(key==='conc')return renderConc();
 if(key==='est')return renderPF('est'),renderList('est');
 const R=ROWS[key],box=$('#rows-'+key);if(!box)return;
 box.innerHTML=`<table class="rt"><thead><tr>${R.cols.map(c=>`<th class="${c[2]?'tx':''}">${c[1]}</th>`).join('')}<th class="vc">${R.u}</th><th></th></tr></thead><tbody>${S.rows[key].map((r,i)=>`<tr>${R.cols.map(c=>`<td class="${c[2]?'tx':''}"><span class="ml">${c[1]}</span><input ${c[2]?'type="text"':'inputmode="decimal"'} data-k="${key}" data-i="${i}" data-f="${c[0]}" value="${esc(r[c[0]])}" aria-label="${c[1]} linha ${i+1}"></td>`).join('')}<td class="rv" id="rv-${key}-${i}"></td><td><button class="x" data-del="${key}" data-i="${i}" aria-label="Remover linha ${i+1}">×</button></td></tr>`).join('')}</tbody></table><button class="add" data-add="${key}">+ Adicionar linha</button>`;
}
const sum=key=>S.rows[key].reduce((a,r)=>a+(ROWS[key].val(r)||0),0);
function rowVals(){for(const k in ROWS)if(k!=='est')S.rows[k].forEach((r,i)=>{const el=$('#rv-'+k+'-'+i);if(el)el.textContent=f(ROWS[k].val(r),k==='corte'?1:3)+' '+ROWS[k].u})}

