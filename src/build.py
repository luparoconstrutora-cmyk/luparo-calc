# Monta o app a partir dos arquivos de src/.
# Uso: python3 src/build.py  ->  gera index.html (site na Vercel) e src/out/claude.html (versão do Claude)
import json,base64,os,hashlib
D=os.path.dirname(os.path.abspath(__file__))
def rd(f):return open(os.path.join(D,f),encoding='utf-8').read()
P=json.loads(rd('panes.json'))
A=rd('base.js');F=rd('motor.js');I=rd('forms.js');init=rd('init.js')
iso=rd('iso.js');a1=rd('app1.js');a2=rd('app2.js');Dm=rd('mods.js')
js=A+iso+a1+Dm+rd('pf.js')+F+a2+rd('calc.js')+I+init
logo=base64.b64encode(open(os.path.join(D,'logo.png'),'rb').read()).decode()
def res(k,extra=''):
    return f'''<aside class="res" id="res-{k}"><div class="rh"><span data-ic="ok"></span>Resultado</div><div class="rb"><div id="r-{k}"></div>
<div class="acts">{extra}<button class="ol" data-save="{k}"><span data-ic="save"></span>Salvar cálculo</button><button class="nv" data-share="{k}"><span data-ic="share"></span>Compartilhar</button></div><div class="savebox" id="sv-{k}"></div><div id="cb-{k}"></div></div></aside>'''
def head(t,p):
    return f'''<header class="mh"><div class="in"><button class="ib" data-back aria-label="Voltar"><span data-ic="back"></span></button><div><h2>{t}</h2><p>{p}</p></div><button class="ib" data-go="inicio" aria-label="Início"><span data-ic="home"></span></button></div>__CURVE__</header>'''
CURVE='<svg class="curve" viewBox="0 0 400 46" preserveAspectRatio="none" aria-hidden="true"><path d="M0 30Q200 -6 400 22V46H0Z" fill="var(--bg)"/><path d="M0 30Q120 8 230 10" stroke="#f58a1f" stroke-width="4" fill="none"/></svg>'
TIT={'estribos':('Estribos','Quantidade, corte e peso da armadura'),'corte':('Corte de ferragem','Plano de corte nas barras de 12 m'),'blocos':('Alvenaria','Blocos por m², canaletas e argamassa'),'betoneira':('Betoneira','Betonadas pelo traço, em baldes de 18 L'),'tracos':('Traços','Padrão Luparo por saco e balde'),'pintura':('Pintura','Tinta, seladora, massa corrida e grafiato'),'piso':('Pisos cerâmicos','Caixas, argamassa, rejunte e nivelador'),'telhado':('Telhado','Telhas por m² e tamanhos padrão')}
EXTRA={'estribos':'<button class="pri full" data-send="estribos">Mandar para o corte</button>','blocos':'<button class="pri full" data-send="blocos">Argamassa na betoneira</button>','betoneira':'<button class="full" data-go="tracos">Ver traços</button>','corte':'<button class="full" data-clear="corte">Limpar</button>'}
AM={'estribos':'estribos','corte':'corte','blocos':'blocos','betoneira':'betoneira','pintura':'pintura','piso':'cer','telhado':'telhado'}
panes=[]
panes.append(f'''<section class="pane" id="p-inicio"><header class="hero"><div class="in"><div><img src="data:image/png;base64,{logo}" alt="Luparo Engenharia e Construção"><h1>Calculadora de <em>Obra</em></h1><p>Do traço ao telhado: a conta certa da obra, na palma da mão.</p><button class="inst" id="instBtn" hidden>Instalar no computador</button></div><div id="bld"></div></div>{CURVE}</header>
<div class="wrap"><h3 class="sec">O que você vai calcular?</h3><div id="home"></div></div></section>''')
panes.append(f'''<section class="pane" id="p-concreto">{head('Concreto','Calcule o volume e os materiais necessários')}<div class="body">
<nav class="seg" id="seg" aria-label="Tipo de peça"></nav><div class="unit"></div>
<div class="grid"><div>
 <div class="artbox" id="concArt"></div>
 <div id="pf-conc"></div>
 <div class="card"><h3 class="hh">Peças lançadas<button class="sm" data-clear="conc">Limpar</button></h3><div id="pl-conc"></div></div>
 <div class="card"><div class="fields"><label>Perda de concreto (%)<input data-s="perdaC" value="10" inputmode="decimal"></label><label style="grid-column:span 2">Traço para os materiais<select data-s="concTraco" id="concTraco"></select></label></div></div>
 <button class="pri big-btn" data-calc="concreto"><span data-ic="calc"></span>Calcular</button>
</div>{res('concreto','<button class="pri full" data-send="concreto">Calcular betoneiras</button>')}</div></div></section>''')
for k in ['estribos','corte','blocos','betoneira','pintura','piso','telhado']:
    t,p=TIT[k]
    panes.append(f'''<section class="pane" id="p-{k}">{head(t,p)}<div class="body"><div class="grid"><div><div class="artbox mini" data-art="{AM[k]}"></div>{P[k]['left']}</div>{res(k,EXTRA.get(k,''))}</div></div></section>''')
t,p=TIT['tracos']
panes.append(f'''<section class="pane" id="p-tracos">{head(t,p)}<div class="body"><div class="artbox mini" data-art="tracos"></div><div class="grid">{P['tracos']['left']}</div></div></section>''')
panes.append(f'''<section class="pane" id="p-calculadora"><div class="body cxbody"><div class="cxwrap"><div class="cxtop"><div class="cxm" id="cxModes"></div><div class="unit cxu"></div><div class="cxd"><svg class="cxwm" viewBox="0 0 120 80" aria-hidden="true"><path d="M8 56L52 18l44 38" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><path d="M74 36V14h10v30" fill="#fff"/><rect x="38" y="52" width="9" height="9" rx="2" fill="#fff"/><rect x="50" y="52" width="9" height="9" rx="2" fill="#fff"/><rect x="38" y="64" width="9" height="9" rx="2" fill="#fff"/><rect x="50" y="64" width="9" height="9" rx="2" fill="#fff"/></svg><div class="cxe" id="cxE"></div><div class="cxv" id="cxV" aria-live="polite">0</div><button class="cxc" id="cxCopy"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h2"/></svg><span>Copiar</span></button><button class="cxc cxl" id="cxClr"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/></svg><span>Limpar tudo</span></button><div class="cxt" id="cxT"></div></div><div class="keys" id="keys"></div></div><div class="card cxtp" id="cxTapeCard"><h3 class="hh">Peças calculadas<button class="sm" data-tclr2>Limpar</button></h3><div id="cxTape"></div></div><div class="cxrec"><h3 class="sec">Contas recentes</h3><div class="cxh" id="cxH"></div></div></div></div></section>''')
panes.append(f'''<section class="pane" id="p-historico">{head('Histórico','Cálculos salvos da equipe')}<div class="body"><p class="status" id="histSt"></p><div class="tr-list" id="histList"></div></div></section>''')
html=f'''<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,minimum-scale=1,user-scalable=no,viewport-fit=cover">
<title>Calculadora de Obra Luparo</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Barlow:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
{rd('style.css')}
</style></head><body>
{''.join(panes).replace('__CURVE__',CURVE)}
<div class="sumbar" id="sumbar" hidden><span id="sbT"></span><button id="sbGo">Ver resultado</button></div>
<nav class="nav" aria-label="Navegação"><a href="#inicio"><span data-ic="home"></span>Início</a><a href="#calculadora"><span data-ic="calc"></span>Calculadora</a><a href="#historico"><span data-ic="hist"></span>Histórico</a><a href="#tracos"><span data-ic="traco"></span>Traços</a></nav>
<script>
{js.replace("const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];","const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];")}
</script>
</body></html>'''
# icon fill
html=html.replace("/* ---------- capa ---------- */","/* ---------- capa ---------- */\n$$('[data-art]').forEach(el=>el.innerHTML=art(el.dataset.art));$$('[data-ic]').forEach(el=>{el.outerHTML=IC[el.dataset.ic]||''});")
os.makedirs(os.path.join(D,'out'),exist_ok=True)
open(os.path.join(D,'out','claude.html'),'w',encoding='utf-8').write(html)

# ---------- versão online (Vercel + Supabase) ----------
s=html
def R(a,b):
    global s
    assert a in s,a[:60];s=s.replace(a,b,1)
R('<title>','<link rel="manifest" href="/manifest.webmanifest">\n<link rel="apple-touch-icon" href="/apple-touch-icon.png">\n<link rel="icon" href="/icon-192.png">\n<meta name="theme-color" content="#0e2147">\n<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-title" content="Luparo Calc">\n<title>')
R('/* ---------- banco ---------- */',rd('sb.js')+'\n/* ---------- banco ---------- */')
R("try{DB=window.claude&&window.claude.use?await window.claude.use('db'):null}catch(e){DB=null}","DB=SB;")
R("'Sem permissão para salvar (peça acesso de Colaborador).'","'Código da equipe incorreto: nada foi salvo.'")
R("'Sem permissão para alterar o banco (peça acesso de Colaborador ao Marcos).'","'Código da equipe incorreto: nada foi salvo.'")
R("status(arr.length+' traço(s) no banco da Luparo · atualiza ao vivo')","status(arr.length+' traço(s) no banco da Luparo')")
R("status('O banco ainda não respondeu: mostrando a última versão disponível.',1)","status(SB.offline()?'Sem internet: usando a cópia de traços salva no aparelho.':'O banco ainda não respondeu: mostrando a cópia salva no aparelho.',1)")
R("status(arr.length+' traço(s) no banco da Luparo')","status(arr.length+' traço(s) no banco da Luparo'+(cache?' · cópia salva no aparelho':''))")
R("msg.textContent='Cálculo salvo no histórico.'","msg.textContent=SB.pendentes()?'Salvo no aparelho: vai para o histórico quando a internet voltar.':'Cálculo salvo no histórico.'")
R("</body></html>","<script>if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}))</script>\n</body></html>")
R2=os.path.join(D,'..')
open(os.path.join(R2,'index.html'),'w',encoding='utf-8').write(s)
open(os.path.join(R2,'sw.js'),'w',encoding='utf-8').write(rd('sw.js').replace('__V__',hashlib.sha1(s.encode()).hexdigest()[:10]))
print('ok',len(html),len(s))
