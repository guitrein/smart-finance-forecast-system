
import { useState } from 'react';
import { useFirestore } from '@/hooks/useFirestore';
import { Lancamento, Categoria, Conta, Cartao } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const CriarLancamento = () => {
  const { add } = useFirestore<Lancamento>('lancamentos');
  const { data: categorias } = useFirestore<Categoria>('categorias');
  const { data: contas } = useFirestore<Conta>('contas');
  const { data: cartoes } = useFirestore<Cartao>('cartoes');

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    descricao: '',
    categoria: '',
    tipo: 'despesa' as 'receita' | 'despesa',
    valor: '',
    contaVinculada: '',
    recorrente: false,
    parcelado: false,
    numeroParcelas: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.descricao || !formData.categoria || !formData.valor || !formData.contaVinculada) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      const novoLancamento: Omit<Lancamento, 'id' | 'criadoEm'> = {
        data: formData.data,
        descricao: formData.descricao,
        categoria: formData.categoria,
        tipo: formData.tipo,
        valor: parseFloat(formData.valor),
        contaVinculada: formData.contaVinculada,
        recorrente: formData.recorrente,
        parcelado: formData.parcelado,
        numeroParcelas: formData.parcelado ? parseInt(formData.numeroParcelas) : undefined,
        parcelaAtual: formData.parcelado ? 1 : undefined,
        grupoParcelamento: formData.parcelado ? `${Date.now()}` : undefined
      };

      await add(novoLancamento);
      
      setFormData({
        data: new Date().toISOString().split('T')[0],
        descricao: '',
        categoria: '',
        tipo: 'despesa',
        valor: '',
        contaVinculada: '',
        recorrente: false,
        parcelado: false,
        numeroParcelas: ''
      });
      
      setOpen(false);
    } catch (error) {
      console.error('Erro ao criar lançamento:', error);
    }
  };

  const contasECartoes = [...contas, ...cartoes];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Novo Lançamento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Lançamento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="data">Data *</Label>
            <Input
              id="data"
              type="date"
              value={formData.data}
              onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="descricao">Descrição *</Label>
            <Input
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Ex: Almoço no restaurante"
              required
            />
          </div>

          <div>
            <Label htmlFor="tipo">Tipo *</Label>
            <Select value={formData.tipo} onValueChange={(value: 'receita' | 'despesa') => setFormData(prev => ({ ...prev, tipo: value }))}>
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
            <Label htmlFor="valor">Valor *</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              value={formData.valor}
              onChange={(e) => setFormData(prev => ({ ...prev, valor: e.target.value }))}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <Label htmlFor="categoria">Categoria *</Label>
            <Select value={formData.categoria} onValueChange={(value) => setFormData(prev => ({ ...prev, categoria: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.icone} {cat.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="conta">Conta/Cartão *</Label>
            <Select value={formData.contaVinculada} onValueChange={(value) => setFormData(prev => ({ ...prev, contaVinculada: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma conta" />
              </SelectTrigger>
              <SelectContent>
                {contasECartoes.map(item => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.parcelado}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  parcelado: e.target.checked,
                  numeroParcelas: e.target.checked ? prev.numeroParcelas : ''
                }))}
              />
              <span>Parcelado</span>
            </label>

            {formData.parcelado && (
              <Input
                type="number"
                value={formData.numeroParcelas}
                onChange={(e) => setFormData(prev => ({ ...prev, numeroParcelas: e.target.value }))}
                placeholder="Nº parcelas"
                className="w-24"
                min="2"
                max="60"
              />
            )}
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Criar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
