
import { useFirestore } from './useFirestore';
import { Recorrente, Lancamento, Cartao } from '@/types';
import { addMonths, format } from 'date-fns';
import { calcularDataVencimentoCartao, isCartao, getCartaoById } from '@/utils/cartaoUtils';

export const useRecorrentes = () => {
  const recorrentesHook = useFirestore<Recorrente>('recorrentes');
  const lancamentosHook = useFirestore<Lancamento>('lancamentos');
  const { data: cartoes } = useFirestore<Cartao>('cartoes');

  const calcularProximaData = (dataInicial: string, frequencia: Recorrente['frequencia'], parcela: number): string => {
    const data = new Date(dataInicial);
    
    switch (frequencia) {
      case 'mensal':
        return format(addMonths(data, parcela), 'yyyy-MM-dd');
      case 'bimestral':
        return format(addMonths(data, parcela * 2), 'yyyy-MM-dd');
      case 'trimestral':
        return format(addMonths(data, parcela * 3), 'yyyy-MM-dd');
      case 'semestral':
        return format(addMonths(data, parcela * 6), 'yyyy-MM-dd');
      case 'anual':
        return format(addMonths(data, parcela * 12), 'yyyy-MM-dd');
      default:
        return dataInicial;
    }
  };

  const gerarLancamentosRecorrentes = async (recorrente: Omit<Recorrente, 'id' | 'criadoEm'>) => {
    try {
      // Primeiro, criar o recorrente
      const recorrenteId = await recorrentesHook.add(recorrente);
      
      // Verificar se a conta é um cartão
      const ehCartao = isCartao(recorrente.contaVinculada, cartoes);
      const cartao = ehCartao ? getCartaoById(recorrente.contaVinculada, cartoes) : null;
      
      // Depois, gerar os lançamentos
      const numParcelas = recorrente.parcelas || 12; // Se não especificado, gera 12 meses
      const lancamentosParaGerar = Math.min(numParcelas, 6); // Gera no máximo 6 lançamentos iniciais
      
      for (let i = 0; i < lancamentosParaGerar; i++) {
        let dataLancamento = calcularProximaData(recorrente.dataInicial, recorrente.frequencia, i);
        
        // Se for cartão, ajustar a data para o vencimento
        if (ehCartao && cartao) {
          dataLancamento = calcularDataVencimentoCartao(dataLancamento, cartao.diaVencimento);
        }
        
        const novoLancamento: Omit<Lancamento, 'id' | 'criadoEm'> = {
          data: dataLancamento,
          descricao: `${recorrente.descricao} (${i + 1}/${numParcelas})`,
          categoria: recorrente.categoria,
          tipo: recorrente.tipo,
          valor: recorrente.valor,
          contaVinculada: recorrente.contaVinculada,
          recorrente: true,
          recorrenteId: recorrenteId,
          parcelado: recorrente.parcelas ? true : false,
          numeroParcelas: recorrente.parcelas || undefined,
          parcelaAtual: recorrente.parcelas ? i + 1 : undefined,
          grupoParcelamento: recorrenteId
        };
        
        await lancamentosHook.add(novoLancamento);
      }
      
      // Atualizar o número de parcelas geradas no recorrente
      await recorrentesHook.update(recorrenteId, {
        parcelasGeradas: lancamentosParaGerar
      });
      
      return recorrenteId;
    } catch (error) {
      console.error('Erro ao gerar lançamentos recorrentes:', error);
      throw error;
    }
  };

  return {
    ...recorrentesHook,
    gerarLancamentosRecorrentes
  };
};
