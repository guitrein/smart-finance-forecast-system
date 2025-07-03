
import { useState } from 'react';
import { useRecorrentes } from '@/hooks/useRecorrentes';
import { useSupabase } from '@/hooks/useSupabase';
import { Categoria, Conta, Cartao } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Repeat } from 'lucide-react';

export const CriarRecorrente = () => {
  const { gerarLancamentosRecorrentes } = useRecorrentes();
  const { data: categorias } = useSupabase<Categoria>('categorias');
  const { data: contas } = useSupabase<Conta>('contas');
  const { data: cartoes } = useSupabase<Cartao>('cartoes');

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    dataInicial: new Date().toISOString().split('T')[0],
    descricao: '',
    categoria: '',
    tipo: 'despesa' as 'receita' | 'despesa',
    valor: '',
    contaVinculada: '',
    tipoContaVinculada: 'conta' as 'conta' | 'cartao',
    frequencia: 'mensal' as 'mensal' | 'bimestral' | 'trimestral' | 'semestral' | 'anual',
    parcelas: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Determinar se é conta ou cartão baseado na seleção
      const isCartao = formData.tipoContaVinculada === 'cartao';
      
      const novoRecorrente = {
        datainicial: formData.dataInicial,
        descricao: formData.descricao,
        categoria_id: formData.categoria,
        tipo: formData.tipo,
        valor: parseFloat(formData.valor),
        // Apenas definir conta_id se for uma conta real, não cartão
        conta_id: isCartao ? null : formData.contaVinculada,
        frequencia: formData.frequencia,
        parcelas: formData.parcelas ? parseInt(formData.parcelas) : null,
        parcelasgeradas: 0,
        dia_vencimento: null,
        ativo: true
      };

      // Passar o ID do cartão separadamente se for cartão
      await gerarLancamentosRecorrentes(novoRecorrente, isCartao ? formData.contaVinculada : null);
      
      setFormData({
        dataInicial: new Date().toISOString().split('T')[0],
        descricao: '',
        categoria: '',
        tipo: 'despesa',
        valor: '',
        contaVinculada: '',
        tipoContaVinculada: 'conta',
        frequencia: 'mensal',
        parcelas: ''
      });
      
      setOpen(false);
    } catch (error) {
      console.error('Erro ao criar recorrente:', error);
    }
  };

  const handleContaChange = (value: string) => {
    // Determinar se é conta ou cartão baseado no valor selecionado
    const isConta = contas.some(conta => conta.id === value);
    const isCartao = cartoes.some(cartao => cartao.id === value);
    
    setFormData(prev => ({
      ...prev,
      contaVinculada: value,
      tipoContaVinculada: isConta ? 'conta' : 'cartao'
    }));
  };

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
          <DialogDescription>
            Configure um lançamento que se repete automaticamente
          </DialogDescription>
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
            <Select value={formData.contaVinculada} onValueChange={handleContaChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma conta" />
              </SelectTrigger>
              <SelectContent>
                {contas.map(conta => (
                  <SelectItem key={conta.id} value={conta.id}>
                    {conta.nome} (Conta)
                  </SelectItem>
                ))}
                {cartoes.map(cartao => (
                  <SelectItem key={cartao.id} value={cartao.id}>
                    {cartao.nome} (Cartão)
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
