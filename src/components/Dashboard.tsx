
import { useState, useMemo } from 'react';
import { useFirestore } from '@/hooks/useFirestore';
import { Lancamento, Conta, Cartao, Categoria } from '@/types';
import { StatCard } from './StatCard';
import { ConnectionStatus } from './ConnectionStatus';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar, CalendarDays } from 'lucide-react';

export const Dashboard = () => {
  const { data: lancamentos, loading: loadingLancamentos, connected } = useFirestore<Lancamento>('lancamentos');
  const { data: contas } = useFirestore<Conta>('contas');
  const { data: cartoes } = useFirestore<Cartao>('cartoes');
  const { data: categorias } = useFirestore<Categoria>('categorias');

  const [filtros, setFiltros] = useState({
    dataInicial: '',
    dataFinal: '',
    categoria: 'todas',
    conta: 'todas'
  });

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

  const contasECartoes = [...contas, ...cartoes];

  if (loadingLancamentos) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com status de conexão */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <ConnectionStatus connected={connected} />
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Data Inicial</label>
            <Input
              type="date"
              value={filtros.dataInicial}
              onChange={(e) => setFiltros(prev => ({ ...prev, dataInicial: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Data Final</label>
            <Input
              type="date"
              value={filtros.dataFinal}
              onChange={(e) => setFiltros(prev => ({ ...prev, dataFinal: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Categoria</label>
            <Select
              value={filtros.categoria}
              onValueChange={(value) => setFiltros(prev => ({ ...prev, categoria: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                {categorias.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.icone} {cat.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Conta/Cartão</label>
            <Select
              value={filtros.conta}
              onValueChange={(value) => setFiltros(prev => ({ ...prev, conta: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                {contasECartoes.map(item => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={limparFiltros} variant="outline" className="w-full">
              Limpar Filtros
            </Button>
          </div>
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Receitas"
          value={formatarMoeda(estatisticas.receitas)}
          icon="💰"
          color="green"
        />
        <StatCard
          title="Despesas"
          value={formatarMoeda(estatisticas.despesas)}
          icon="💸"
          color="red"
        />
        <StatCard
          title="Saldo"
          value={formatarMoeda(estatisticas.saldo)}
          icon={estatisticas.saldo >= 0 ? "📈" : "📉"}
          color={estatisticas.saldo >= 0 ? "green" : "red"}
        />
      </div>

      {/* Tabela de lançamentos */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Lançamentos Recentes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descrição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dadosFiltrados.slice(0, 10).map((lancamento) => {
                const categoria = categorias.find(c => c.id === lancamento.categoria);
                return (
                  <tr key={lancamento.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(lancamento.data).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lancamento.descricao}
                      {lancamento.parcelado && (
                        <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          {lancamento.parcelaAtual}/{lancamento.numeroParcelas}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {categoria && (
                        <span className="flex items-center gap-2">
                          <span>{categoria.icone}</span>
                          {categoria.nome}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        lancamento.tipo === 'receita' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {lancamento.tipo === 'receita' ? 'Receita' : 'Despesa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={lancamento.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}>
                        {lancamento.tipo === 'receita' ? '+' : '-'}{formatarMoeda(lancamento.valor)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
