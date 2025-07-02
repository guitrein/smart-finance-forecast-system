
-- Adicionar colunas faltantes na tabela cartoes
ALTER TABLE public.cartoes 
ADD COLUMN bandeira TEXT,
ADD COLUMN tipo TEXT DEFAULT 'cartao',
ADD COLUMN diaVencimento INTEGER;

-- Renomear a coluna vencimento para diaVencimento (caso necessário)
-- Como já temos diaVencimento, vamos remover a coluna vencimento antiga
ALTER TABLE public.cartoes DROP COLUMN IF EXISTS vencimento;

-- Adicionar colunas faltantes na tabela contas
ALTER TABLE public.contas 
ADD COLUMN banco TEXT,
ADD COLUMN categoria TEXT,
ADD COLUMN tipo TEXT DEFAULT 'conta',
ADD COLUMN saldoInicial DECIMAL(10,2) DEFAULT 0;

-- Renomear saldo para saldoInicial se necessário, ou manter ambos
-- Vou manter saldo e adicionar saldoInicial
