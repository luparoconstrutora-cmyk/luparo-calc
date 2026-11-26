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
