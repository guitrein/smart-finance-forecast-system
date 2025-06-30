
-- Criar tabela de categorias
CREATE TABLE public.categorias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  icone TEXT,
  cor TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de contas
CREATE TABLE public.contas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  nome TEXT NOT NULL,
  saldo DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de cartões
CREATE TABLE public.cartoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  nome TEXT NOT NULL,
  limite DECIMAL(10,2) NOT NULL,
  vencimento INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de lançamentos
CREATE TABLE public.lancamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  descricao TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  categoria_id UUID REFERENCES public.categorias,
  conta_id UUID REFERENCES public.contas,
  cartao_id UUID REFERENCES public.cartoes,
  data DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de recorrentes
CREATE TABLE public.recorrentes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  descricao TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  categoria_id UUID REFERENCES public.categorias,
  conta_id UUID REFERENCES public.contas,
  frequencia TEXT NOT NULL CHECK (frequencia IN ('mensal', 'semanal', 'anual')),
  dia_vencimento INTEGER,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cartoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lancamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recorrentes ENABLE ROW LEVEL SECURITY;

-- Políticas para categorias
CREATE POLICY "Users can view their own categorias" ON public.categorias FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own categorias" ON public.categorias FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own categorias" ON public.categorias FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own categorias" ON public.categorias FOR DELETE USING (auth.uid() = user_id);

-- Políticas para contas
CREATE POLICY "Users can view their own contas" ON public.contas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own contas" ON public.contas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own contas" ON public.contas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own contas" ON public.contas FOR DELETE USING (auth.uid() = user_id);

-- Políticas para cartões
CREATE POLICY "Users can view their own cartoes" ON public.cartoes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own cartoes" ON public.cartoes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own cartoes" ON public.cartoes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own cartoes" ON public.cartoes FOR DELETE USING (auth.uid() = user_id);

-- Políticas para lançamentos
CREATE POLICY "Users can view their own lancamentos" ON public.lancamentos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own lancamentos" ON public.lancamentos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own lancamentos" ON public.lancamentos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own lancamentos" ON public.lancamentos FOR DELETE USING (auth.uid() = user_id);

-- Políticas para recorrentes
CREATE POLICY "Users can view their own recorrentes" ON public.recorrentes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own recorrentes" ON public.recorrentes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own recorrentes" ON public.recorrentes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own recorrentes" ON public.recorrentes FOR DELETE USING (auth.uid() = user_id);
