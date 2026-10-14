# Inventário Inteligente

Aplicação web do GP 1 SENAI com frontend e backend em pastas separadas. Foi preparada para demonstração e testes locais.

## Endereços locais

- Site Next.js: http://localhost:3000
- API Node.js: http://localhost:4000/api/health

## Guias disponíveis

- Visão geral: indicadores, alertas e movimentações recentes.
- Produtos: busca, consulta e cadastro com SKU único.
- Movimentações: histórico, registro de entrada e saída; o saldo atualiza e saídas sem saldo são recusadas.
- Relatórios: resumo do estoque e exportação CSV.
- Categorias, Fornecedores, Locais e Usuários: listagem e cadastro de demonstração.
- Configurações: estado da API e informação sobre persistência.
- Ajuda e suporte: instruções de uso para os testes.

## Executar manualmente

Na pasta `inventory-app`, inicie em dois terminais:

1. `node backend/server.mjs`
2. `cd frontend`, `npm install` e `npm run dev`

A API expõe `GET /api/health`, `GET/POST /api/products`, `GET/POST /api/movements` e `GET/POST /api/categories`, `/api/suppliers`, `/api/locations`, `/api/users`.

## Dados e Supabase

O ambiente de teste armazena os cadastros em memória. Ao reiniciar o backend, os dados voltam à demonstração inicial. O modelo PostgreSQL/Supabase está em `supabase/schema.sql`, mas ainda não está conectado à API local. A publicação na Vercel também requer configurar a API como serviço separado ou converter seus endpoints para funções serverless.
