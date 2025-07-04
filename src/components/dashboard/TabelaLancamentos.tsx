
import { Lancamento, Categoria, Conta, Cartao } from '@/types';
import { AcoesLancamento } from './AcoesLancamento';
import { Calendar, Tag, TrendingUp, TrendingDown, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Lançamentos Recentes
        </CardTitle>
        <CardDescription>
          Últimos {Math.min(10, lancamentos.length)} lançamentos do período selecionado
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Descrição
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {lancamentos.slice(0, 10).map((lancamento) => {
                const categoria = categorias.find(c => c.id === lancamento.categoria_id);
                return (
                  <tr key={lancamento.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {new Date(lancamento.data).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      <div className="flex flex-col">
                        <span className="font-medium">{lancamento.descricao}</span>
                        {lancamento.parcelado && (
                          <Badge variant="secondary" className="mt-1 w-fit text-xs">
                            Parcela {lancamento.parcelaatual}/{lancamento.numeroparcelas}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {categoria && (
                        <div className="flex items-center gap-2">
                          <span>{categoria.icone}</span>
                          <span className="text-muted-foreground">{categoria.nome}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {lancamento.tipo === 'receita' ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                        <Badge 
                          variant={lancamento.tipo === 'receita' ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {lancamento.tipo === 'receita' ? 'Receita' : 'Despesa'}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={`font-bold ${
                        lancamento.tipo === 'receita' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {lancamento.tipo === 'receita' ? '+' : '-'}{formatarMoeda(lancamento.valor)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
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
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum lançamento encontrado no período selecionado</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
