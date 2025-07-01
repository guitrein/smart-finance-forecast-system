import { useState, useMemo } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { Lancamento, Cartao, Conta, FaturaCartao, Vencimento, FluxoCaixaMensal } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { FiltrosProjecoes } from './projecoes/FiltrosProjecoes';
import { CreditCard, Calendar, TrendingUp } from 'lucide-react';

export const ProjecoesSupabase = () => {
  const { data: lancamentos } = useSupabase<Lancamento>('lancamentos');
  const { data: cartoes } = useSupabase<Cartao>('cartoes');
  const { data: contas } = useSupabase<Conta>('contas');

  const [contasSelecionadas, setContasSelecionadas] = useState<string[]>([]);
  const [cartoesSelecionados, setCartoesSelecionados] = useState<string[]>([]);

  // Inicializar filtros com todas as contas e cartões selecionados
  useState(() => {
    if (contas.length > 0 && contasSelecionadas.length === 0) {
      setContasSelecionadas(contas.map(c => c.id));
    }
    if (cartoes.length > 0 && cartoesSelecionados.length === 0) {
      setCartoesSelecionados(cartoes.map(c => c.id));
    }
  });

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const limparFiltros = () => {
    setContasSelecionadas(contas.map(c => c.id));
    setCartoesSelecionados(cartoes.map(c => c.id));
  };

  // Filtrar dados baseado na seleção
  const dadosFiltrados = useMemo(() => {
    const contasECartoesSelecionados = [...contasSelecionadas, ...cartoesSelecionados];
    return lancamentos.filter(l => {
      // Verificar se o lançamento está vinculado a uma conta ou cartão selecionado
      return contasECartoesSelecionados.includes(l.conta_id || '') || 
             contasECartoesSelecionados.includes(l.cartao_id || '');
    });
  }, [lancamentos, contasSelecionadas, cartoesSelecionados]);

  const cartoesFiltrados = useMemo(() => {
    return cartoes.filter(c => cartoesSelecionados.includes(c.id));
  }, [cartoes, cartoesSelecionados]);

  // Calcular faturas dos cartões filtrados
  const faturasCartoes = useMemo((): FaturaCartao[] => {
    return cartoesFiltrados.map(cartao => {
      const lancamentosCartao = dadosFiltrados.filter(l => l.cartao_id === cartao.id && l.tipo === 'despesa');
      const usado = lancamentosCartao.reduce((total, l) => total + l.valor, 0);
      const disponivel = cartao.limite - usado;
      const percentualUsado = (usado / cartao.limite) * 100;

      const proximasParcelas = lancamentosCartao
        .filter(l => new Date(l.data) >= new Date())
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
        bandeira: cartao.nome, // Usando nome como bandeira por enquanto
        diaVencimento: cartao.vencimento || 10,
        limite: cartao.limite,
        usado,
        disponivel,
        percentualUsado,
        valorFatura: usado,
        proximasParcelas
      };
    });
  }, [cartoesFiltrados, dadosFiltrados]);

  // Calcular próximos vencimentos
  const proximosVencimentos = useMemo((): Vencimento[] => {
    const hoje = new Date();
    const em60Dias = new Date();
    em60Dias.setDate(hoje.getDate() + 60);

    const vencimentos: Vencimento[] = [];

    // Vencimentos de faturas de cartões filtrados
    cartoesFiltrados.forEach(cartao => {
      const proximoVencimento = new Date(hoje.getFullYear(), hoje.getMonth(), cartao.vencimento || 10);
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

    // Vencimentos de lançamentos futuros filtrados
    dadosFiltrados
      .filter(l => new Date(l.data) >= hoje && new Date(l.data) <= em60Dias)
      .forEach(lancamento => {
        const dataVencimento = new Date(lancamento.data);
        const diasParaVencimento = Math.ceil((dataVencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
        let status: Vencimento['status'] = 'ok';
        
        if (diasParaVencimento < 0) status = 'vencido';
        else if (diasParaVencimento <= 3) status = 'urgente';
        else if (diasParaVencimento <= 7) status = 'atencao';

        vencimentos.push({
          data: lancamento.data,
          titulo: lancamento.descricao,
          valor: lancamento.valor,
          status,
          tipo: 'parcela'
        });
      });

    return vencimentos.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
  }, [cartoesFiltrados, faturasCartoes, dadosFiltrados]);

  // Calcular fluxo de caixa com dados filtrados
  const fluxoCaixa = useMemo((): FluxoCaixaMensal[] => {
    const meses: FluxoCaixaMensal[] = [];
    const hoje = new Date();

    for (let i = 0; i < 24; i++) {
      const mesAtual = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
      const proximoMes = new Date(hoje.getFullYear(), hoje.getMonth() + i + 1, 1);
      
      const periodo = mesAtual.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });

      const lancamentosMes = dadosFiltrados.filter(l => {
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
  }, [dadosFiltrados]);

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
    <div className="space-y-8 max-w-[1920px] mx-auto">
      <div className="flex items-center gap-3">
        <CreditCard className="w-8 h-8 text-blue-600" />
        <h1 className="text-4xl font-bold">Projeções & Cartões</h1>
      </div>

      {/* Filtros */}
      <FiltrosProjecoes
        contas={contas}
        cartoes={cartoes}
        contasSelecionadas={contasSelecionadas}
        cartoesSelecionados={cartoesSelecionados}
        onContasChange={setContasSelecionadas}
        onCartoesChange={setCartoesSelecionados}
        onLimparFiltros={limparFiltros}
      />

      <Tabs defaultValue="faturas" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-14 text-base">
          <TabsTrigger value="faturas" className="text-base">Faturas dos Cartões</TabsTrigger>
          <TabsTrigger value="vencimentos" className="text-base">Próximos Vencimentos</TabsTrigger>
          <TabsTrigger value="fluxo" className="text-base">Fluxo de Caixa</TabsTrigger>
        </TabsList>

        <TabsContent value="faturas" className="space-y-8">
          <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-8">
            {faturasCartoes.map(fatura => (
              <div key={fatura.cartaoId} className="bg-white rounded-xl shadow-lg border overflow-hidden hover:shadow-xl transition-shadow">
                {/* Header do cartão */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="font-bold text-xl">{fatura.nome}</h3>
                      <p className="text-blue-100 text-lg">{fatura.bandeira}</p>
                    </div>
                    <CreditCard className="w-10 h-10 text-blue-100" />
                  </div>
                  <p className="text-base text-blue-100">Vencimento dia {fatura.diaVencimento}</p>
                </div>

                {/* Informações do limite */}
                <div className="p-8 space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-base font-medium text-gray-600">Limite utilizado</span>
                      <span className="text-base font-bold">{fatura.percentualUsado.toFixed(1)}%</span>
                    </div>
                    <Progress 
                      value={fatura.percentualUsado} 
                      className={`h-4 ${getProgressColor(fatura.percentualUsado)}`}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-base">
                      <span className="text-gray-600">Limite total:</span>
                      <span className="font-semibold">{formatarMoeda(fatura.limite)}</span>
                    </div>
                    <div className="flex justify-between text-base">
                      <span className="text-gray-600">Usado:</span>
                      <span className="font-semibold text-red-600">{formatarMoeda(fatura.usado)}</span>
                    </div>
                    <div className="flex justify-between text-base">
                      <span className="text-gray-600">Disponível:</span>
                      <span className="font-semibold text-green-600">{formatarMoeda(fatura.disponivel)}</span>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-semibold text-base">Fatura atual:</span>
                      <span className="text-xl font-bold text-red-600">{formatarMoeda(fatura.valorFatura)}</span>
                    </div>

                    {fatura.proximasParcelas.length > 0 && (
                      <div>
                        <p className="text-base font-medium text-gray-600 mb-3">Próximas parcelas:</p>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {fatura.proximasParcelas.map((parcela, index) => (
                            <div key={index} className="flex justify-between text-sm bg-gray-50 p-3 rounded">
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

        <TabsContent value="vencimentos" className="space-y-8">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-8 border-b">
              <div className="flex items-center gap-3">
                <Calendar className="w-7 h-7 text-blue-600" />
                <h2 className="text-xl font-semibold">Vencimentos dos próximos 60 dias</h2>
              </div>
            </div>
            
            <div className="divide-y">
              {proximosVencimentos.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <Calendar className="w-16 h-16 mx-auto mb-6 text-gray-300" />
                  <p className="text-lg">Nenhum vencimento encontrado para os próximos 60 dias</p>
                </div>
              ) : (
                proximosVencimentos.map((vencimento, index) => (
                  <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-gray-900">
                            {new Date(vencimento.data).getDate()}
                          </div>
                          <div className="text-sm text-gray-500 uppercase">
                            {new Date(vencimento.data).toLocaleDateString('pt-BR', { month: 'short' })}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">{vencimento.titulo}</h3>
                          <div className="flex items-center gap-3 mt-2">
                            <Badge variant="outline" className={getStatusColor(vencimento.status)}>
                              {vencimento.status === 'vencido' && 'Vencido'}
                              {vencimento.status === 'urgente' && 'Urgente'}
                              {vencimento.status === 'atencao' && 'Atenção'}
                              {vencimento.status === 'ok' && 'OK'}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {vencimento.tipo === 'fatura' ? '💳 Fatura' : '💰 Parcela'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-red-600">
                          {formatarMoeda(vencimento.valor)}
                        </div>
                        <div className="text-sm text-gray-500">
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

        <TabsContent value="fluxo" className="space-y-8">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-8 border-b">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-7 h-7 text-blue-600" />
                <h2 className="text-xl font-semibold">Projeção de Fluxo de Caixa - 24 meses</h2>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-8 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Período
                    </th>
                    <th className="px-8 py-4 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Saldo Inicial
                    </th>
                    <th className="px-8 py-4 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Receitas
                    </th>
                    <th className="px-8 py-4 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Despesas
                    </th>
                    <th className="px-8 py-4 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Saldo Final
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {fluxoCaixa.map((mes, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-8 py-5 whitespace-nowrap text-base font-medium text-gray-900">
                        {mes.periodo}
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-base text-right">
                        {formatarMoeda(mes.saldoInicial)}
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-base text-right text-green-600 font-medium">
                        +{formatarMoeda(mes.receitasPrevistas)}
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-base text-right text-red-600 font-medium">
                        -{formatarMoeda(mes.despesasPrevistas)}
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-base text-right font-bold">
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
