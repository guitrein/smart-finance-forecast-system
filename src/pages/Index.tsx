
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dashboard } from '@/components/Dashboard';
import { ProjecoesCartoes } from '@/components/ProjecoesCartoes';
import { SetupInicial } from '@/components/SetupInicial';
import { useFirestore } from '@/hooks/useFirestore';
import { Categoria } from '@/types';
import { 
  LayoutDashboard, 
  CreditCard
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
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="projecoes" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span>Projeções</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>

          <TabsContent value="projecoes">
            <ProjecoesCartoes />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
