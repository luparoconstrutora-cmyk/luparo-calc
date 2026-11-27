# Calculadora de Obra Luparo (versão online)

App estático (um `index.html`) que roda em qualquer hospedagem. Os dados compartilhados
(traços, produtos de pintura e histórico) ficam no projeto Supabase **luparo-calc**,
separado do Luparo Gestão.

## Publicar na Vercel
1. Na Vercel: **Add New → Project** → importe o repositório `luparo-calc`.
2. Framework Preset: **Other**. Sem build command, sem output directory. **Deploy**.
3. (Opcional) Em Settings → Domains, adicione um subdomínio, ex.: `calc.seudominio.com.br`.

Este projeto é independente do Luparo Gestão: deploys de um não afetam o outro.

## Código da equipe
Ler os dados é livre; para **salvar** traços, produtos ou cálculos no histórico o app pede o
código da equipe uma vez por aparelho. Para trocar o código, rode no SQL Editor do projeto
`luparo-calc`:

```sql
update calc_config set valor = extensions.crypt('NOVO-CODIGO', extensions.gen_salt('bf'))
where chave = 'codigo_equipe';
```

## Instalar no celular
Abra o endereço no navegador → "Adicionar à tela inicial". O ícone é o símbolo da Luparo.

## Código-fonte
O app publicado (`index.html` e `sw.js`) é gerado a partir da pasta `src/`. Para mudar o app,
edite os arquivos de `src/` e rode:

```
python3 src/build.py
```

Isso gera `index.html` e `sw.js` na raiz (site na Vercel) e `src/out/claude.html` (versão usada
dentro do Claude, não vai para o repositório).

| Arquivo | O que tem |
|---|---|
| `src/build.py` | monta as telas e junta tudo num único `index.html` |
| `src/style.css` | visual do app |
| `src/base.js` | utilitários, linhas editáveis e dados salvos no aparelho |
| `src/iso.js` | desenhos isométricos e ícones |
| `src/app1.js` | saída de resultados, Concreto (peças, unidades, avisos de medida) |
| `src/mods.js` | Estribos, Corte, Alvenaria, Traços, Betoneira, Pintura, Piso, Telhado |
| `src/pf.js` | formulário "lançar e confirmar" e barra de total |
| `src/calc.js` | Calculadora (comum e por peça) |
| `src/app2.js` | capa, navegação, histórico, botões |
| `src/forms.js` | cadastro de traços e produtos, ligação com o banco |
| `src/sb.js` | banco Supabase com modo sem internet (cópia local e fila de envio) |
| `src/sw.js` | service worker: o app abre sem internet |
| `src/panes.json` | campos das telas de Estribos, Corte, Alvenaria, Betoneira, Pintura, Piso, Telhado e Traços |

## Sem internet
Depois de aberto uma vez com internet, o app abre e calcula sem sinal. Traços e produtos usam a
última cópia salva no aparelho. Cálculos salvos no Histórico sem internet ficam numa fila e são
enviados sozinhos quando o sinal volta (aviso no topo da tela).
