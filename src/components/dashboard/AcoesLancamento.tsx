
import { useState } from 'react';
import { Lancamento, Categoria, Conta, Cartao } from '@/types';
import { useFirestore } from '@/hooks/useFirestore';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { calcularDataVencimentoCartao, isCartao, getCartaoById } from '@/utils/cartaoUtils';

interface AcoesLancamentoProps {
  lancamento: Lancamento;
  categorias: Categoria[];
  contas: Conta[];
  cartoes: Cartao[];
}

export const AcoesLancamento = ({ lancamento, categorias, contas, cartoes }: AcoesLancamentoProps) => {
  const { update, remove } = useFirestore<Lancamento>('lancamentos');
  const [editarAberto, setEditarAberto] = useState(false);
  const [excluirAberto, setExcluirAberto] = useState(false);
  const [formData, setFormData] = useState({
    data: lancamento.data,
    descricao: lancamento.descricao,
    categoria: lancamento.categoria,
    tipo: lancamento.tipo,
    valor: lancamento.valor,
    contaVinculada: lancamento.contaVinculada
  });

  const todasContas = [...contas, ...cartoes];

  const handleSubmitEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Verificar se a conta selecionada é um cartão
      const ehCartao = isCartao(formData.contaVinculada, cartoes);
      let dataFinal = formData.data;

      // Se for cartão, calcular a data de vencimento
      if (ehCartao) {
        const cartao = getCartaoById(formData.contaVinculada, cartoes);
        if (cartao) {
          dataFinal = calcularDataVencimentoCartao(formData.data, cartao.diaVencimento);
        }
      }

      await update(lancamento.id, {
        ...formData,
        data: dataFinal,
        valor: Number(formData.valor)
      });

      setEditarAberto(false);
      
      if (ehCartao) {
        toast({
          title: "Lançamento atualizado!",
          description: `Data ajustada para vencimento do cartão: ${new Date(dataFinal).toLocaleDateString('pt-BR')}`,
        });
      }
    } catch (error) {
      console.error('Erro ao editar lançamento:', error);
    }
  };

  const handleExcluir = async () => {
    try {
      await remove(lancamento.id);
      setExcluirAberto(false);
    } catch (error) {
      console.error('Erro ao excluir lançamento:', error);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-white border shadow-md">
          <DropdownMenuItem onClick={() => setEditarAberto(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setExcluirAberto(true)}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editarAberto} onOpenChange={setEditarAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Lançamento</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitEdicao} className="space-y-4">
            <div>
              <Label htmlFor="data">Data</Label>
              <Input
                id="data"
                type="date"
                value={formData.data}
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="categoria">Categoria</Label>
              <Select 
                value={formData.categoria} 
                onValueChange={(value) => setFormData({ ...formData, categoria: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria.id} value={categoria.id}>
                      <span className="flex items-center gap-2">
                        <span>{categoria.icone}</span>
                        {categoria.nome}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="tipo">Tipo</Label>
              <Select 
                value={formData.tipo} 
                onValueChange={(value: 'receita' | 'despesa') => setFormData({ ...formData, tipo: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="despesa">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="valor">Valor</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: Number(e.target.value) })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="conta">Conta</Label>
              <Select 
                value={formData.contaVinculada} 
                onValueChange={(value) => setFormData({ ...formData, contaVinculada: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {todasContas.map((conta) => (
                    <SelectItem key={conta.id} value={conta.id}>
                      {conta.nome} {conta.tipo && `(${conta.tipo})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditarAberto(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Salvar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={excluirAberto} onOpenChange={setExcluirAberto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o lançamento "{lancamento.descricao}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleExcluir} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
