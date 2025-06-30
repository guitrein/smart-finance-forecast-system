
import { useState } from 'react';
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
import { Lancamento, Categoria, Conta, Cartao } from '@/types';
import { 
  PlusCircle, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  LogOut,
  CreditCard,
  BarChart3
} from 'lucide-react';

export const Dashboard = () => {
  const { signOut } = useAuth();
  const { data: lancamentos, loading: loadingLancamentos } = useSupabase<Lancamento>('lancamentos');
  const { data: categorias, loading: loadingCategorias } = useSupabase<Categoria>('categorias');
  const { data: contas, loading: loadingContas } = useSupabase<Conta>('contas');
  const { data: cartoes, loading: loadingCartoes } = useSupabase<Cartao>('cartoes');

  const [filtros, setFiltros] = useState({
    categoria: '',
    conta: '',
    tipo: '',
    dataInicio: '',
    dataFim: ''
  });

  const loading = loadingLancamentos || loadingCategorias || loadingContas || loadingCartoes;

  // Verificar se é necessário fazer setup inicial
  const precisaSetup = !loading && (
    categorias.length === 0 || 
    contas.length === 0
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (precisaSetup) {
    return <SetupInicial />;
  }

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ConnectionStatus />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-green-600" />
              <h1 className="text-2xl font-bold text-gray-900">Gestão Financeira</h1>
            </div>
            
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="projecoes" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Projeções
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8">
            {/* Estatísticas */}
            <EstatisticasDashboard 
              lancamentos={lancamentos}
              contas={contas}
              cartoes={cartoes}
            />

            {/* Filtros */}
            <FiltrosDashboard
              categorias={categorias}
              contas={contas}
              cartoes={cartoes}
              filtros={filtros}
              onFiltrosChange={setFiltros}
            />

            {/* Tabela de Lançamentos */}
            <TabelaLancamentos
              lancamentos={lancamentos}
              categorias={categorias}
              contas={contas}
              cartoes={cartoes}
              filtros={filtros}
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
