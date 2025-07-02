
import { useSupabase } from './useSupabase';
import { Recorrente, Lancamento, Cartao } from '@/types';
import { addMonths, format } from 'date-fns';
import { calcularDataVencimentoCartao, isCartao, getCartaoById } from '@/utils/cartaoUtils';

export const useRecorrentes = () => {
  const recorrentesHook = useSupabase<Recorrente>('recorrentes');
  const lancamentosHook = useSupabase<Lancamento>('lancamentos');
  const { data: cartoes } = useSupabase<Cartao>('cartoes');

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

  const gerarLancamentosRecorrentes = async (recorrente: Omit<Recorrente, 'id' | 'created_at' | 'user_id'>) => {
    try {
      const recorrenteId = await recorrentesHook.add(recorrente);
      
      const ehCartao = isCartao(recorrente.conta_id, cartoes);
      const cartao = ehCartao ? getCartaoById(recorrente.conta_id, cartoes) : null;
      
      const numParcelas = recorrente.parcelas || 12;
      const lancamentosParaGerar = Math.min(numParcelas, 6);
      
      for (let i = 0; i < lancamentosParaGerar; i++) {
        let dataLancamento = calcularProximaData(recorrente.datainicial || new Date().toISOString().split('T')[0], recorrente.frequencia, i);
        
        if (ehCartao && cartao) {
          dataLancamento = calcularDataVencimentoCartao(dataLancamento, cartao.diavencimento || 10);
        }
        
        const novoLancamento = {
          data: dataLancamento,
          descricao: `${recorrente.descricao} (${i + 1}/${numParcelas})`,
          categoria_id: recorrente.categoria_id,
          tipo: recorrente.tipo,
          valor: recorrente.valor,
          conta_id: ehCartao ? null : recorrente.conta_id,
          cartao_id: ehCartao ? recorrente.conta_id : null,
          recorrente: true,
          recorrenteId: recorrenteId,
          parcelado: recorrente.parcelas ? true : false,
          numeroParcelas: recorrente.parcelas || undefined,
          parcelaAtual: recorrente.parcelas ? i + 1 : undefined,
          grupoParcelamento: recorrenteId
        };
        
        await lancamentosHook.add(novoLancamento);
      }
      
      await recorrentesHook.update(recorrenteId, {
        parcelasgeradas: lancamentosParaGerar
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
