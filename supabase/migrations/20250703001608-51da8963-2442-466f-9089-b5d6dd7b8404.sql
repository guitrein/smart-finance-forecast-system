
-- Adicionar colunas faltantes na tabela lancamentos para suportar parcelamento e recorrência
ALTER TABLE public.lancamentos 
ADD COLUMN recorrente BOOLEAN DEFAULT false,
ADD COLUMN recorrenteId TEXT,
ADD COLUMN parcelado BOOLEAN DEFAULT false,
ADD COLUMN numeroParcelas INTEGER,
ADD COLUMN parcelaAtual INTEGER,
ADD COLUMN grupoParcelamento TEXT;
