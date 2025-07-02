
export interface Lancamento {
  id: string;
  data: string;
  descricao: string;
  categoria_id: string | null;
  tipo: 'receita' | 'despesa';
  valor: number;
  conta_id: string | null;
  cartao_id: string | null;
  recorrente: boolean;
  recorrenteId?: string;
  parcelado: boolean;
  numeroParcelas?: number;
  parcelaAtual?: number;
  grupoParcelamento?: string;
  created_at: string;
  user_id: string;
}

export interface Recorrente {
  id: string;
  dataInicial: string;
  descricao: string;
  categoria_id: string | null;
  tipo: 'receita' | 'despesa';
  valor: number;
  conta_id: string | null;
  frequencia: 'mensal' | 'bimestral' | 'trimestral' | 'semestral' | 'anual';
  parcelas?: number | null;
  parcelasGeradas: number;
  created_at: string;
  user_id: string;
}

export interface Conta {
  id: string;
  nome: string;
  banco?: string;
  categoria?: string;
  saldoinicial?: number;
  saldo?: number;
  tipo?: string;
  created_at: string;
  user_id: string;
}

export interface Cartao {
  id: string;
  nome: string;
  bandeira?: string;
  limite: number;
  diavencimento?: number;
  tipo?: string;
  created_at: string;
  user_id: string;
}

export interface Categoria {
  id: string;
  nome: string;
  descricao: string;
  icone: string;
  cor: string;
  created_at: string;
  user_id: string;
}

export interface FaturaCartao {
  cartaoId: string;
  nome: string;
  bandeira: string;
  diaVencimento: number;
  limite: number;
  usado: number;
  disponivel: number;
  percentualUsado: number;
  valorFatura: number;
  proximasParcelas: {
    descricao: string;
    valor: number;
    dataVencimento: string;
  }[];
}

export interface Vencimento {
  data: string;
  titulo: string;
  valor: number;
  status: 'vencido' | 'urgente' | 'atencao' | 'ok';
  tipo: 'fatura' | 'parcela';
}

export interface FluxoCaixaMensal {
  periodo: string;
  saldoInicial: number;
  receitasPrevistas: number;
  despesasPrevistas: number;
  saldoFinal: number;
}
