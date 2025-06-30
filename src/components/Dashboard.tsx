
import { useState, useMemo } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { Lancamento, Conta, Cartao, Categoria } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { ConnectionStatus } from './ConnectionStatus';
import { CriarLancamento } from './CriarLancamento';
import { CriarRecorrente } from './CriarRecorrente';
import { CriarConta } from './CriarConta';
import { CriarCartao } from './CriarCartao';
import { FiltrosDashboard } from './dashboard/FiltrosDashboard';
import { EstatisticasDashboard } from './dashboard/EstatisticasDashboard';
import { TabelaLancamentos } from './dashboard/TabelaLancamentos';
import { GerenciarCategorias } from './GerenciarCategorias';
import { Button } from '@/components/ui/button';
import { Tag, LogOut } from 'lucide-react';

export const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { data: lancamentos, loading: loadingLancamentos, connected } = useSupabase<Lancamento>('lancamentos');
  const { data: contas } = useSupabase<Conta>('contas');
  const { data: cartoes } = useSupabase<Cartao>('cartoes');
  const { data: categorias } = useSupabase<Categoria>('categorias');

  const [filtros, setFiltros] = useState({
    dataInicial: '',
    dataFinal: '',
    categoria: 'todas',
    conta: 'todas'
  });

  const [mostrarCategorias, setMostrarCategorias] = useState(false);

  const dadosFiltrados = useMemo(() => {
    let dados = lancamentos;

    if (filtros.dataInicial) {
      dados = dados.filter(l => l.data >= filtros.dataInicial);
    }
    if (filtros.dataFinal) {
      dados = dados.filter(l => l.data <= filtros.dataFinal);
    }
    if (filtros.categoria && filtros.categoria !== 'todas') {
      dados = dados.filter(l => l.categoria === filtros.categoria);
    }
    if (filtros.conta && filtros.conta !== 'todas') {
      dados = dados.filter(l => l.contaVinculada === filtros.conta);
    }

    return dados;
  }, [lancamentos, filtros]);

  const estatisticas = useMemo(() => {
    const receitas = dadosFiltrados
      .filter(l => l.tipo === 'receita')
      .reduce((total, l) => total + l.valor, 0);
    
    const despesas = dadosFiltrados
      .filter(l => l.tipo === 'despesa')
      .reduce((total, l) => total + l.valor, 0);

    const saldo = receitas - despesas;

    return { receitas, despesas, saldo };
  }, [dadosFiltrados]);

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const limparFiltros = () => {
    setFiltros({
      dataInicial: '',
      dataFinal: '',
      categoria: 'todas',
      conta: 'todas'
    });
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (loadingLancamentos) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (mostrarCategorias) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setMostrarCategorias(false)}>
            ← Voltar ao Dashboard
          </Button>
        </div>
        <GerenciarCategorias />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com status de conexão */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-sm text-gray-600">Bem-vindo, {user?.email}</p>
        </div>
        <div className="flex items-center gap-4">
          <ConnectionStatus connected={connected} />
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>

      {/* Botões de ação */}
      <div className="flex flex-wrap gap-3">
        <CriarLancamento />
        <CriarRecorrente />
        <CriarConta />
        <CriarCartao />
        <Button variant="outline" onClick={() => setMostrarCategorias(true)}>
          <Tag className="w-4 h-4 mr-2" />
          Gerenciar Categorias
        </Button>
      </div>

      {/* Filtros */}
      <FiltrosDashboard
        filtros={filtros}
        setFiltros={setFiltros}
        categorias={categorias}
        contas={contas}
        cartoes={cartoes}
        onLimparFiltros={limparFiltros}
      />

      {/* Cards de estatísticas */}
      <EstatisticasDashboard
        receitas={estatisticas.receitas}
        despesas={estatisticas.despesas}
        saldo={estatisticas.saldo}
        formatarMoeda={formatarMoeda}
      />

      {/* Tabela de lançamentos */}
      <TabelaLancamentos
        lancamentos={dadosFiltrados}
        categorias={categorias}
        contas={contas}
        cartoes={cartoes}
        formatarMoeda={formatarMoeda}
      />
    </div>
  );
};
