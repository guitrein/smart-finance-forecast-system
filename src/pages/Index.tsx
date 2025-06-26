
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dashboard } from '@/components/Dashboard';
import { ProjecoesCartoes } from '@/components/ProjecoesCartoes';
import { SetupInicial } from '@/components/SetupInicial';
import { useFirestore } from '@/hooks/useFirestore';
import { Categoria } from '@/types';
import { 
  LayoutDashboard, 
  CreditCard, 
  PlusCircle, 
  Repeat, 
  Building2, 
  Tag, 
  BarChart3 
} from 'lucide-react';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sistemaConfigurado, setSistemaConfigurado] = useState(false);
  const { data: categorias, loading } = useFirestore<Categoria>('categorias');

  // Verificar se o sistema já foi configurado
  useEffect(() => {
    if (!loading) {
      setSistemaConfigurado(categorias.length > 0);
    }
  }, [categorias, loading]);

  // Componentes placeholder para as outras abas
  const LancamentosTab = () => (
    <div className="text-center py-12">
      <PlusCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
      <h2 className="text-2xl font-bold text-gray-700 mb-2">Lançamentos</h2>
      <p className="text-gray-500">Formulários para receitas e despesas com sistema de parcelamento inteligente</p>
    </div>
  );

  const RecorrentesTab = () => (
    <div className="text-center py-12">
      <Repeat className="w-16 h-16 mx-auto text-gray-400 mb-4" />
      <h2 className="text-2xl font-bold text-gray-700 mb-2">Recorrentes</h2>
      <p className="text-gray-500">Gestão de lançamentos que se repetem automaticamente</p>
    </div>
  );

  const ContasCartoesTab = () => (
    <div className="text-center py-12">
      <Building2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
      <h2 className="text-2xl font-bold text-gray-700 mb-2">Contas & Cartões</h2>
      <p className="text-gray-500">Gestão de contas correntes e cartões de crédito</p>
    </div>
  );

  const CategoriasTab = () => (
    <div className="text-center py-12">
      <Tag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
      <h2 className="text-2xl font-bold text-gray-700 mb-2">Categorias</h2>
      <p className="text-gray-500">Organização de receitas e despesas por categorias</p>
    </div>
  );

  const RelatoriosTab = () => (
    <div className="text-center py-12">
      <BarChart3 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
      <h2 className="text-2xl font-bold text-gray-700 mb-2">Relatórios</h2>
      <p className="text-gray-500">Análises e estatísticas detalhadas</p>
    </div>
  );

  // Mostrar tela de configuração inicial se necessário
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando sistema...</p>
        </div>
      </div>
    );
  }

  if (!sistemaConfigurado) {
    return <SetupInicial onComplete={() => setSistemaConfigurado(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-8">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="projecoes" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Projeções</span>
            </TabsTrigger>
            <TabsTrigger value="lancamentos" className="flex items-center gap-2">
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Lançamentos</span>
            </TabsTrigger>
            <TabsTrigger value="recorrentes" className="flex items-center gap-2">
              <Repeat className="w-4 h-4" />
              <span className="hidden sm:inline">Recorrentes</span>
            </TabsTrigger>
            <TabsTrigger value="contas" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Contas</span>
            </TabsTrigger>
            <TabsTrigger value="categorias" className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              <span className="hidden sm:inline">Categorias</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>

          <TabsContent value="projecoes">
            <ProjecoesCartoes />
          </TabsContent>

          <TabsContent value="lancamentos">
            <LancamentosTab />
          </TabsContent>

          <TabsContent value="recorrentes">
            <RecorrentesTab />
          </TabsContent>

          <TabsContent value="contas">
            <ContasCartoesTab />
          </TabsContent>

          <TabsContent value="categorias">
            <CategoriasTab />
          </TabsContent>

          <TabsContent value="relatorios">
            <RelatoriosTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
