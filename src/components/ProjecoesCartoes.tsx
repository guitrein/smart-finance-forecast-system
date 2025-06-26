
import { useState, useMemo } from 'react';
import { useFirestore } from '@/hooks/useFirestore';
import { Lancamento, Cartao, FaturaCartao, Vencimento, FluxoCaixaMensal } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Calendar, TrendingUp } from 'lucide-react';

export const ProjecoesCartoes = () => {
  const { data: lancamentos } = useFirestore<Lancamento>('lancamentos');
  const { data: cartoes } = useFirestore<Cartao>('cartoes');

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  // Calcular faturas dos cartões
  const faturasCartoes = useMemo((): FaturaCartao[] => {
    return cartoes.map(cartao => {
      const lancamentosCartao = lancamentos.filter(l => l.contaVinculada === cartao.id && l.tipo === 'despesa');
      const usado = lancamentosCartao.reduce((total, l) => total + l.valor, 0);
      const disponivel = cartao.limite - usado;
      const percentualUsado = (usado / cartao.limite) * 100;

      // Buscar próximas parcelas (próximos 5 lançamentos)
      const proximasParcelas = lancamentosCartao
        .filter(l => l.parcelado && new Date(l.data) >= new Date())
        .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
        .slice(0, 5)
        .map(l => ({
          descricao: l.descricao,
          valor: l.valor,
          dataVencimento: l.data
        }));

      return {
        cartaoId: cartao.id,
        nome: cartao.nome,
        bandeira: cartao.bandeira,
        diaVencimento: cartao.diaVencimento,
        limite: cartao.limite,
        usado,
        disponivel,
        percentualUsado,
        valorFatura: usado,
        proximasParcelas
      };
    });
  }, [cartoes, lancamentos]);

  // Calcular próximos vencimentos (60 dias)
  const proximosVencimentos = useMemo((): Vencimento[] => {
    const hoje = new Date();
    const em60Dias = new Date();
    em60Dias.setDate(hoje.getDate() + 60);

    const vencimentos: Vencimento[] = [];

    // Vencimentos de faturas de cartões
    cartoes.forEach(cartao => {
      const proximoVencimento = new Date(hoje.getFullYear(), hoje.getMonth(), cartao.diaVencimento);
      if (proximoVencimento < hoje) {
        proximoVencimento.setMonth(proximoVencimento.getMonth() + 1);
      }

      const fatura = faturasCartoes.find(f => f.cartaoId === cartao.id);
      if (fatura && fatura.valorFatura > 0) {
        const diasParaVencimento = Math.ceil((proximoVencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
        let status: Vencimento['status'] = 'ok';
        
        if (diasParaVencimento < 0) status = 'vencido';
        else if (diasParaVencimento <= 3) status = 'urgente';
        else if (diasParaVencimento <= 7) status = 'atencao';

        vencimentos.push({
          data: proximoVencimento.toISOString().split('T')[0],
          titulo: `Fatura ${cartao.nome}`,
          valor: fatura.valorFatura,
          status,
          tipo: 'fatura'
        });
      }
    });

    // Vencimentos de parcelas
    lancamentos
      .filter(l => l.parcelado && new Date(l.data) >= hoje && new Date(l.data) <= em60Dias)
      .forEach(lancamento => {
        const dataVencimento = new Date(lancamento.data);
        const diasParaVencimento = Math.ceil((dataVencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
        let status: Vencimento['status'] = 'ok';
        
        if (diasParaVencimento < 0) status = 'vencido';
        else if (diasParaVencimento <= 3) status = 'urgente';
        else if (diasParaVencimento <= 7) status = 'atencao';

        vencimentos.push({
          data: lancamento.data,
          titulo: `${lancamento.descricao} (${lancamento.parcelaAtual}/${lancamento.numeroParcelas})`,
          valor: lancamento.valor,
          status,
          tipo: 'parcela'
        });
      });

    return vencimentos.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
  }, [cartoes, faturasCartoes, lancamentos]);

  // Calcular fluxo de caixa (24 meses)
  const fluxoCaixa = useMemo((): FluxoCaixaMensal[] => {
    const meses: FluxoCaixaMensal[] = [];
    const hoje = new Date();

    for (let i = 0; i < 24; i++) {
      const mesAtual = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
      const proximoMes = new Date(hoje.getFullYear(), hoje.getMonth() + i + 1, 1);
      
      const periodo = mesAtual.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });

      // Filtrar lançamentos do mês
      const lancamentosMes = lancamentos.filter(l => {
        const dataLancamento = new Date(l.data);
        return dataLancamento >= mesAtual && dataLancamento < proximoMes;
      });

      const receitas = lancamentosMes
        .filter(l => l.tipo === 'receita')
        .reduce((total, l) => total + l.valor, 0);

      const despesas = lancamentosMes
        .filter(l => l.tipo === 'despesa')
        .reduce((total, l) => total + l.valor, 0);

      const saldoInicial = i === 0 ? 0 : meses[i - 1]?.saldoFinal || 0;
      const saldoFinal = saldoInicial + receitas - despesas;

      meses.push({
        periodo,
        saldoInicial,
        receitasPrevistas: receitas,
        despesasPrevistas: despesas,
        saldoFinal
      });
    }

    return meses;
  }, [lancamentos]);

  const getStatusColor = (status: Vencimento['status']) => {
    switch (status) {
      case 'vencido':
      case 'urgente':
        return 'bg-red-100 text-red-800';
      case 'atencao':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const getProgressColor = (percentual: number) => {
    if (percentual >= 90) return 'bg-red-500';
    if (percentual >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <CreditCard className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Projeções & Cartões</h1>
      </div>

      <Tabs defaultValue="faturas" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="faturas">Faturas dos Cartões</TabsTrigger>
          <TabsTrigger value="vencimentos">Próximos Vencimentos</TabsTrigger>
          <TabsTrigger value="fluxo">Fluxo de Caixa</TabsTrigger>
        </TabsList>

        <TabsContent value="faturas" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {faturasCartoes.map(fatura => (
              <div key={fatura.cartaoId} className="bg-white rounded-xl shadow-lg border overflow-hidden hover:shadow-xl transition-shadow">
                {/* Header do cartão */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg">{fatura.nome}</h3>
                      <p className="text-blue-100">{fatura.bandeira}</p>
                    </div>
                    <CreditCard className="w-8 h-8 text-blue-100" />
                  </div>
                  <p className="text-sm text-blue-100">Vencimento dia {fatura.diaVencimento}</p>
                </div>

                {/* Informações do limite */}
                <div className="p-6 space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-600">Limite utilizado</span>
                      <span className="text-sm font-bold">{fatura.percentualUsado.toFixed(1)}%</span>
                    </div>
                    <Progress 
                      value={fatura.percentualUsado} 
                      className={`h-3 ${getProgressColor(fatura.percentualUsado)}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Limite total:</span>
                      <span className="font-semibold">{formatarMoeda(fatura.limite)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Usado:</span>
                      <span className="font-semibold text-red-600">{formatarMoeda(fatura.usado)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Disponível:</span>
                      <span className="font-semibold text-green-600">{formatarMoeda(fatura.disponivel)}</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-semibold">Fatura atual:</span>
                      <span className="text-lg font-bold text-red-600">{formatarMoeda(fatura.valorFatura)}</span>
                    </div>

                    {fatura.proximasParcelas.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Próximas parcelas:</p>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {fatura.proximasParcelas.map((parcela, index) => (
                            <div key={index} className="flex justify-between text-xs bg-gray-50 p-2 rounded">
                              <span className="truncate">{parcela.descricao}</span>
                              <span className="font-medium">{formatarMoeda(parcela.valor)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="vencimentos" className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-blue-600" />
                <h2 className="text-lg font-semibold">Vencimentos dos próximos 60 dias</h2>
              </div>
            </div>
            
            <div className="divide-y">
              {proximosVencimentos.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhum vencimento encontrado para os próximos 60 dias</p>
                </div>
              ) : (
                proximosVencimentos.map((vencimento, index) => (
                  <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">
                            {new Date(vencimento.data).getDate()}
                          </div>
                          <div className="text-xs text-gray-500 uppercase">
                            {new Date(vencimento.data).toLocaleDateString('pt-BR', { month: 'short' })}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{vencimento.titulo}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className={getStatusColor(vencimento.status)}>
                              {vencimento.status === 'vencido' && 'Vencido'}
                              {vencimento.status === 'urgente' && 'Urgente'}
                              {vencimento.status === 'atencao' && 'Atenção'}
                              {vencimento.status === 'ok' && 'OK'}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {vencimento.tipo === 'fatura' ? '💳 Fatura' : '💰 Parcela'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-red-600">
                          {formatarMoeda(vencimento.valor)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(vencimento.data).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="fluxo" className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                <h2 className="text-lg font-semibold">Projeção de Fluxo de Caixa - 24 meses</h2>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Período
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Saldo Inicial
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Receitas
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Despesas
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Saldo Final
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {fluxoCaixa.map((mes, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {mes.periodo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        {formatarMoeda(mes.saldoInicial)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-medium">
                        +{formatarMoeda(mes.receitasPrevistas)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 font-medium">
                        -{formatarMoeda(mes.despesasPrevistas)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold">
                        <span className={mes.saldoFinal >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatarMoeda(mes.saldoFinal)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
