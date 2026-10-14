# Estoque Inteligente

Sistema web para gerenciamento de inventário, conforme GP 1 do SENAI. Feito com Next.js, TypeScript, Supabase (PostgreSQL) e Vercel.

## Executar
1. Instale Node.js 20+.
2. Rode `npm install` e `npm run dev` nesta pasta.
3. Acesse http://localhost:3000.

O dashboard abre com dados demonstrativos. O botão Novo produto permite cadastrar produtos no estado local do navegador.

## Supabase
Crie um projeto Supabase, copie `.env.example` para `.env.local` e configure URL e chave anon. Execute `supabase/schema.sql` no SQL Editor. O esquema cria tabelas relacionais para perfis, categorias, fornecedores, locais, produtos e movimentações, além de políticas RLS e trigger de atualização do saldo. A interface ainda usa dados locais; autenticação e persistência precisam ser conectadas para produção.

## Vercel
Suba a pasta para um repositório GitHub, importe o repositório na Vercel, cadastre `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` nas variáveis de ambiente e faça o deploy.

## Escopo ainda necessário para produção
Login e gestão de convites; CRUD de categorias, fornecedores e locais; registro de entradas/saídas ligado ao Supabase; relatórios e revisão das permissões conforme os papéis da empresa.
