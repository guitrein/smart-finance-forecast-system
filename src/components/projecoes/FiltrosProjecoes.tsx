
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Conta, Cartao } from '@/types';
import { Filter, RotateCcw } from 'lucide-react';

interface FiltrosProjecoesProps {
  contas: Conta[];
  cartoes: Cartao[];
  contasSelecionadas: string[];
  cartoesSelecionados: string[];
  onContasChange: (contas: string[]) => void;
  onCartoesChange: (cartoes: string[]) => void;
  onLimparFiltros: () => void;
}

export const FiltrosProjecoes = ({
  contas,
  cartoes,
  contasSelecionadas,
  cartoesSelecionados,
  onContasChange,
  onCartoesChange,
  onLimparFiltros
}: FiltrosProjecoesProps) => {
  const [expandido, setExpandido] = useState(false);

  const handleContaChange = (contaId: string, checked: boolean) => {
    if (checked) {
      onContasChange([...contasSelecionadas, contaId]);
    } else {
      onContasChange(contasSelecionadas.filter(id => id !== contaId));
    }
  };

  const handleCartaoChange = (cartaoId: string, checked: boolean) => {
    if (checked) {
      onCartoesChange([...cartoesSelecionados, cartaoId]);
    } else {
      onCartoesChange(cartoesSelecionados.filter(id => id !== cartaoId));
    }
  };

  const selecionarTodasContas = () => {
    onContasChange(contas.map(c => c.id));
  };

  const selecionarTodosCartoes = () => {
    onCartoesChange(cartoes.map(c => c.id));
  };

  const limparContas = () => {
    onContasChange([]);
  };

  const limparCartoes = () => {
    onCartoesChange([]);
  };

  const totalSelecionados = contasSelecionadas.length + cartoesSelecionados.length;

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg">Filtros</CardTitle>
            {totalSelecionados > 0 && (
              <Badge variant="secondary" className="ml-2">
                {totalSelecionados} selecionado{totalSelecionados > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onLimparFiltros}
              className="text-red-600 hover:text-red-700"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Limpar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpandido(!expandido)}
            >
              {expandido ? 'Recolher' : 'Expandir'}
            </Button>
          </div>
        </div>
      </CardHeader>

      {expandido && (
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Filtros de Contas */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Contas</h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selecionarTodasContas}
                    className="text-xs"
                  >
                    Todas
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={limparContas}
                    className="text-xs"
                  >
                    Nenhuma
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                {contas.map(conta => (
                  <div key={conta.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                    <Checkbox
                      id={`conta-${conta.id}`}
                      checked={contasSelecionadas.includes(conta.id)}
                      onCheckedChange={(checked) => handleContaChange(conta.id, checked as boolean)}
                    />
                    <label
                      htmlFor={`conta-${conta.id}`}
                      className="flex-1 text-sm font-medium cursor-pointer"
                    >
                      <div className="flex flex-col">
                        <span>{conta.nome}</span>
                        <span className="text-xs text-gray-500">{conta.banco}</span>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Filtros de Cartões */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Cartões</h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selecionarTodosCartoes}
                    className="text-xs"
                  >
                    Todos
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={limparCartoes}
                    className="text-xs"
                  >
                    Nenhum
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                {cartoes.map(cartao => (
                  <div key={cartao.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                    <Checkbox
                      id={`cartao-${cartao.id}`}
                      checked={cartoesSelecionados.includes(cartao.id)}
                      onCheckedChange={(checked) => handleCartaoChange(cartao.id, checked as boolean)}
                    />
                    <label
                      htmlFor={`cartao-${cartao.id}`}
                      className="flex-1 text-sm font-medium cursor-pointer"
                    >
                      <div className="flex flex-col">
                        <span>{cartao.nome}</span>
                        <span className="text-xs text-gray-500">{cartao.bandeira}</span>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
