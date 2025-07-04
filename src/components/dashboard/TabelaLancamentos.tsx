
import { Lancamento, Categoria, Conta, Cartao } from '@/types';
import { AcoesLancamento } from './AcoesLancamento';
import { Calendar, Tag, TrendingUp, TrendingDown } from 'lucide-react';

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
    <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700">
      <div className="p-6 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-400" />
          Lançamentos Recentes
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Últimos {Math.min(10, lancamentos.length)} lançamentos do período selecionado
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-900">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Descrição
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Categoria
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Valor
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-slate-800 divide-y divide-slate-700">
            {lancamentos.slice(0, 10).map((lancamento) => {
              const categoria = categorias.find(c => c.id === lancamento.categoria_id);
              return (
                <tr key={lancamento.id} className="hover:bg-slate-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200">
                    {new Date(lancamento.data).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-200">
                    <div className="flex flex-col">
                      <span className="font-medium">{lancamento.descricao}</span>
                      {lancamento.parcelado && (
                        <span className="mt-1 px-2 py-1 text-xs bg-blue-600/20 text-blue-300 rounded-full w-fit">
                          Parcela {lancamento.parcelaatual}/{lancamento.numeroparcelas}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200">
                    {categoria && (
                      <span className="flex items-center gap-2 px-3 py-1 bg-slate-700 rounded-full w-fit">
                        <span>{categoria.icone}</span>
                        <span className="text-slate-300">{categoria.nome}</span>
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {lancamento.tipo === 'receita' ? (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                      <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                        lancamento.tipo === 'receita' 
                          ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                          : 'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}>
                        {lancamento.tipo === 'receita' ? 'Receita' : 'Despesa'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className={`font-bold ${
                      lancamento.tipo === 'receita' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {lancamento.tipo === 'receita' ? '+' : '-'}{formatarMoeda(lancamento.valor)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
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
        
        {lancamentos.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum lançamento encontrado no período selecionado</p>
          </div>
        )}
      </div>
    </div>
  );
};
