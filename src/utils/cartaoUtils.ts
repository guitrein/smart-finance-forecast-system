
import { format, addMonths, setDate } from 'date-fns';

export const calcularDataVencimentoCartao = (dataLancamento: string, diaVencimento: number): string => {
  const dataLanc = new Date(dataLancamento);
  const diaLancamento = dataLanc.getDate();
  
  // Se o lançamento foi feito após o dia de vencimento, vai para o próximo mês
  if (diaLancamento > diaVencimento) {
    const proximoMes = addMonths(dataLanc, 1);
    return format(setDate(proximoMes, diaVencimento), 'yyyy-MM-dd');
  } else {
    // Se o lançamento foi feito antes ou no dia de vencimento, fica no mesmo mês
    return format(setDate(dataLanc, diaVencimento), 'yyyy-MM-dd');
  }
};

export const isCartao = (contaId: string, cartoes: any[]): boolean => {
  return cartoes.some(cartao => cartao.id === contaId);
};

export const getCartaoById = (contaId: string, cartoes: any[]) => {
  return cartoes.find(cartao => cartao.id === contaId);
};
