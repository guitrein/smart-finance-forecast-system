
import { useState } from 'react';
import { useFirestore } from '@/hooks/useFirestore';
import { Recorrente, Categoria, Conta, Cartao } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Repeat } from 'lucide-react';

export const CriarRecorrente = () => {
  const { add } = useFirestore<Recorrente>('recorrentes');
  const { data: categorias } = useFirestore<Categoria>('categorias');
  const { data: contas } = useFirestore<Conta>('contas');
  const { data: cartoes } = useFirestore<Cartao>('cartoes');

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    dataInicial: new Date().toISOString().split('T')[0],
    descricao: '',
    categoria: '',
    tipo: 'despesa' as 'receita' | 'despesa',
    valor: '',
    contaVinculada: '',
    frequencia: 'mensal' as 'mensal' | 'bimestral' | 'trimestral' | 'semestral' | 'anual',
    parcelas: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const novoRecorrente: Omit<Recorrente, 'id' | 'criadoEm'> = {
        dataInicial: formData.dataInicial,
        descricao: formData.descricao,
        categoria: formData.categoria,
        tipo: formData.tipo,
        valor: parseFloat(formData.valor),
        contaVinculada: formData.contaVinculada,
        frequencia: formData.frequencia,
        parcelas: formData.parcelas ? parseInt(formData.parcelas) : null,
        parcelasGeradas: 0
      };

      await add(novoRecorrente);
      
      setFormData({
        dataInicial: new Date().toISOString().split('T')[0],
        descricao: '',
        categoria: '',
        tipo: 'despesa',
        valor: '',
        contaVinculada: '',
        frequencia: 'mensal',
        parcelas: ''
      });
      
      setOpen(false);
    } catch (error) {
      console.error('Erro ao criar recorrente:', error);
    }
  };

  const contasECartoes = [...contas, ...cartoes];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Repeat className="w-4 h-4 mr-2" />
          Novo Recorrente
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Lançamento Recorrente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="dataInicial">Data Inicial</Label>
            <Input
              id="dataInicial"
              type="date"
              value={formData.dataInicial}
              onChange={(e) => setFormData(prev => ({ ...prev, dataInicial: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Input
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Ex: Aluguel"
              required
            />
          </div>

          <div>
            <Label htmlFor="tipo">Tipo</Label>
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
            <Label htmlFor="valor">Valor</Label>
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
            <Label htmlFor="categoria">Categoria</Label>
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
            <Label htmlFor="conta">Conta/Cartão</Label>
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

          <div>
            <Label htmlFor="frequencia">Frequência</Label>
            <Select value={formData.frequencia} onValueChange={(value: any) => setFormData(prev => ({ ...prev, frequencia: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mensal">Mensal</SelectItem>
                <SelectItem value="bimestral">Bimestral</SelectItem>
                <SelectItem value="trimestral">Trimestral</SelectItem>
                <SelectItem value="semestral">Semestral</SelectItem>
                <SelectItem value="anual">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="parcelas">Número de Parcelas (opcional)</Label>
            <Input
              id="parcelas"
              type="number"
              value={formData.parcelas}
              onChange={(e) => setFormData(prev => ({ ...prev, parcelas: e.target.value }))}
              placeholder="Deixe em branco para indefinido"
              min="1"
            />
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
