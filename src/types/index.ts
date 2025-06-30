
export interface Lancamento {
  id: string;
  data: string;
  descricao: string;
  categoria: string;
  tipo: 'receita' | 'despesa';
  valor: number;
  contaVinculada: string;
  recorrente: boolean;
  recorrenteId?: string;
  parcelado: boolean;
  numeroParcelas?: number;
  parcelaAtual?: number;
  grupoParcelamento?: string;
  criadoEm: string;
  user_id: string;
}

export interface Recorrente {
  id: string;
  dataInicial: string;
  descricao: string;
  categoria: string;
  tipo: 'receita' | 'despesa';
  valor: number;
  contaVinculada: string;
  frequencia: 'mensal' | 'bimestral' | 'trimestral' | 'semestral' | 'anual';
  parcelas?: number | null;
  parcelasGeradas: number;
  criadoEm: string;
  user_id: string;
}

export interface Conta {
  id: string;
  nome: string;
  banco?: string;
  categoria?: string;
  saldoInicial?: number;
  saldo?: number;
  tipo?: string;
  criadoEm: string;
  user_id: string;
}

export interface Cartao {
  id: string;
  nome: string;
  bandeira?: string;
  limite: number;
  diaVencimento?: number;
  vencimento?: number;
  tipo?: string;
  criadoEm: string;
  user_id: string;
}

export interface Categoria {
  id: string;
  nome: string;
  descricao: string;
  icone: string;
  cor: string;
  criadoEm: string;
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
