
import { Lancamento, Categoria, Conta, Cartao } from '@/types';
import { AcoesLancamento } from './AcoesLancamento';

interface TabelaLancamentosProps {
  lancamentos: Lancamento[];
  categorias: Categoria[];
  contas: Conta[];
  cartoes: Cartao[];
  formatarMoeda: (valor: number) => string;
}

export const TabelaLancamentos = ({ 
  lancamentos, 
  categorias, 
  contas,
  cartoes,
  formatarMoeda 
}: TabelaLancamentosProps) => {
  return (
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {lancamentos.slice(0, 10).map((lancamento) => {
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <AcoesLancamento 
                      lancamento={lancamento}
                      categorias={categorias}
                      contas={contas}
                      cartoes={cartoes}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
