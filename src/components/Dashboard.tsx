
import { useState, useMemo, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSupabase } from '@/hooks/useSupabase';
import { useAuth } from '@/hooks/useAuth';
import { SetupInicial } from './SetupInicial';
import { EstatisticasDashboard } from './dashboard/EstatisticasDashboard';
import { TabelaLancamentos } from './dashboard/TabelaLancamentos';
import { FiltrosDashboard } from './dashboard/FiltrosDashboard';
import { ProjecoesSupabase } from './ProjecoesSupabase';
import { ConnectionStatus } from './ConnectionStatus';
import { CriarLancamento } from './CriarLancamento';
import { CriarRecorrente } from './CriarRecorrente';
import { CriarConta } from './CriarConta';
import { CriarCartao } from './CriarCartao';
import { CriarCategoria } from './CriarCategoria';
import { Lancamento, Categoria, Conta, Cartao } from '@/types';
import { 
  PlusCircle, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  LogOut,
  CreditCard,
  BarChart3,
  Calendar,
  Filter
} from 'lucide-react';

export const Dashboard = () => {
  const { signOut } = useAuth();
  const { data: lancamentos, loading: loadingLancamentos, connected } = useSupabase<Lancamento>('lancamentos');
  const { data: categorias, loading: loadingCategorias } = useSupabase<Categoria>('categorias');
  const { data: contas, loading: loadingContas } = useSupabase<Conta>('contas');
  const { data: cartoes, loading: loadingCartoes } = useSupabase<Cartao>('cartoes');

  const [setupCompleto, setSetupCompleto] = useState(false);
  
  // Definir filtro padrão: data atual até 30 dias no passado
  const hoje = new Date();
  const trintaDiasAtras = new Date();
  trintaDiasAtras.setDate(hoje.getDate() - 30);
  
  const [filtros, setFiltros] = useState({
    categoria: '',
    conta: '',
    dataInicial: trintaDiasAtras.toISOString().split('T')[0],
    dataFinal: hoje.toISOString().split('T')[0]
  });

  const loading = loadingLancamentos || loadingCategorias || loadingContas || loadingCartoes;

  // Verificar se é necessário fazer setup inicial
  const precisaSetup = !loading && !setupCompleto && categorias.length === 0;

  const formatarMoeda = useCallback((valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }, []);

  // Filtrar lançamentos baseado nos filtros aplicados
  const lancamentosFiltrados = useMemo(() => {
    return lancamentos.filter(lancamento => {
      // Filtro de data
      const dataLancamento = new Date(lancamento.data);
      const dataInicial = filtros.dataInicial ? new Date(filtros.dataInicial) : null;
      const dataFinal = filtros.dataFinal ? new Date(filtros.dataFinal) : null;
      
      if (dataInicial && dataLancamento < dataInicial) return false;
      if (dataFinal && dataLancamento > dataFinal) return false;
      
      // Filtro de categoria
      if (filtros.categoria && filtros.categoria !== 'todas' && lancamento.categoria_id !== filtros.categoria) {
        return false;
      }
      
      // Filtro de conta/cartão
      if (filtros.conta && filtros.conta !== 'todas') {
        const contaId = lancamento.conta_id || lancamento.cartao_id;
        if (contaId !== filtros.conta) return false;
      }
      
      return true;
    });
  }, [lancamentos, filtros]);

  // Calcular estatísticas com dados filtrados
  const { receitas, despesas, saldo } = useMemo(() => {
    const receitasTotal = lancamentosFiltrados
      .filter(l => l.tipo === 'receita')
      .reduce((total, l) => total + l.valor, 0);
    
    const despesasTotal = lancamentosFiltrados
      .filter(l => l.tipo === 'despesa')
      .reduce((total, l) => total + l.valor, 0);
    
    return {
      receitas: receitasTotal,
      despesas: despesasTotal,
      saldo: receitasTotal - despesasTotal
    };
  }, [lancamentosFiltrados]);

  const handleSetupComplete = useCallback(() => {
    console.log('Setup completado!');
    setSetupCompleto(true);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }, [signOut]);

  const limparFiltros = useCallback(() => {
    const hoje = new Date();
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(hoje.getDate() - 30);
    
    setFiltros({
      categoria: '',
      conta: '',
      dataInicial: trintaDiasAtras.toISOString().split('T')[0],
      dataFinal: hoje.toISOString().split('T')[0]
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-300">Carregando...</p>
        </div>
      </div>
    );
  }

  if (precisaSetup) {
    return <SetupInicial onComplete={handleSetupComplete} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <ConnectionStatus connected={connected} />
      
      {/* Header */}
      <div className="bg-slate-800 shadow-lg border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-green-400" />
              <h1 className="text-2xl font-bold text-slate-100">Gestão Financeira</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Calendar className="w-4 h-4" />
                {new Date().toLocaleDateString('pt-BR', { 
                  year: 'numeric', 
                  month: 'long' 
                })}
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="flex items-center gap-2 bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-800 border-slate-700">
            <TabsTrigger 
              value="dashboard" 
              className="flex items-center gap-2 data-[state=active]:bg-slate-700 data-[state=active]:text-slate-100"
            >
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="projecoes" 
              className="flex items-center gap-2 data-[state=active]:bg-slate-700 data-[state=active]:text-slate-100"
            >
              <CreditCard className="w-4 h-4" />
              Projeções
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8">
            {/* Ações Rápidas */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-100 flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-green-400" />
                  Ações Rápidas
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Gerencie suas finanças criando lançamentos, contas e categorias
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <CriarLancamento />
                  <CriarRecorrente />
                  <CriarConta />
                  <CriarCartao />
                  <CriarCategoria />
                </div>
              </CardContent>
            </Card>

            {/* Filtros */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-100 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-blue-400" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FiltrosDashboard
                  categorias={categorias}
                  contas={contas}
                  cartoes={cartoes}
                  filtros={filtros}
                  setFiltros={setFiltros}
                  onLimparFiltros={limparFiltros}
                />
              </CardContent>
            </Card>

            {/* Estatísticas */}
            <EstatisticasDashboard 
              receitas={receitas}
              despesas={despesas}
              saldo={saldo}
              formatarMoeda={formatarMoeda}
            />

            {/* Tabela de Lançamentos */}
            <TabelaLancamentos
              lancamentos={lancamentosFiltrados}
              categorias={categorias}
              contas={contas}
              cartoes={cartoes}
              formatarMoeda={formatarMoeda}
            />
          </TabsContent>

          <TabsContent value="projecoes">
            <ProjecoesSupabase />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
