
-- Adicionar colunas faltantes na tabela recorrentes
ALTER TABLE public.recorrentes 
ADD COLUMN dataInicial DATE,
ADD COLUMN parcelas INTEGER,
ADD COLUMN parcelasGeradas INTEGER DEFAULT 0;

-- Atualizar frequencia para incluir os novos valores
ALTER TABLE public.recorrentes 
DROP CONSTRAINT IF EXISTS recorrentes_frequencia_check;

ALTER TABLE public.recorrentes 
ADD CONSTRAINT recorrentes_frequencia_check 
CHECK (frequencia IN ('mensal', 'bimestral', 'trimestral', 'semestral', 'anual'));
