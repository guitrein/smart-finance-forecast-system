
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Categoria, Conta, Cartao } from '@/types';

interface FiltrosDashboardProps {
  filtros: {
    dataInicial: string;
    dataFinal: string;
    categoria: string;
    conta: string;
  };
  setFiltros: React.Dispatch<React.SetStateAction<{
    dataInicial: string;
    dataFinal: string;
    categoria: string;
    conta: string;
  }>>;
  categorias: Categoria[];
  contas: Conta[];
  cartoes: Cartao[];
  onLimparFiltros: () => void;
}

export const FiltrosDashboard = ({ 
  filtros, 
  setFiltros, 
  categorias, 
  contas, 
  cartoes, 
  onLimparFiltros 
}: FiltrosDashboardProps) => {
  const contasECartoes = [...contas, ...cartoes];

  return (
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
          <Button onClick={onLimparFiltros} variant="outline" className="w-full">
            Limpar Filtros
          </Button>
        </div>
      </div>
    </div>
  );
};
