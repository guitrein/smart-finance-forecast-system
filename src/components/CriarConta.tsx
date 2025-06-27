
import { useState } from 'react';
import { useFirestore } from '@/hooks/useFirestore';
import { Conta } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Wallet } from 'lucide-react';

export const CriarConta = () => {
  const { add } = useFirestore<Conta>('contas');
  
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    banco: '',
    categoria: 'corrente',
    saldoInicial: '',
    tipo: 'conta'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const novaConta: Omit<Conta, 'id' | 'criadoEm'> = {
        nome: formData.nome,
        banco: formData.banco,
        categoria: formData.categoria,
        saldoInicial: parseFloat(formData.saldoInicial) || 0,
        tipo: formData.tipo
      };

      await add(novaConta);
      
      setFormData({
        nome: '',
        banco: '',
        categoria: 'corrente',
        saldoInicial: '',
        tipo: 'conta'
      });
      
      setOpen(false);
    } catch (error) {
      console.error('Erro ao criar conta:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Wallet className="w-4 h-4 mr-2" />
          Nova Conta
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Conta</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome da Conta</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              placeholder="Ex: Conta Corrente Principal"
              required
            />
          </div>

          <div>
            <Label htmlFor="banco">Banco</Label>
            <Input
              id="banco"
              value={formData.banco}
              onChange={(e) => setFormData(prev => ({ ...prev, banco: e.target.value }))}
              placeholder="Ex: Banco do Brasil"
              required
            />
          </div>

          <div>
            <Label htmlFor="categoria">Categoria</Label>
            <Select value={formData.categoria} onValueChange={(value) => setFormData(prev => ({ ...prev, categoria: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="corrente">Conta Corrente</SelectItem>
                <SelectItem value="poupanca">Poupança</SelectItem>
                <SelectItem value="investimento">Investimento</SelectItem>
                <SelectItem value="dinheiro">Dinheiro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="saldoInicial">Saldo Inicial</Label>
            <Input
              id="saldoInicial"
              type="number"
              step="0.01"
              value={formData.saldoInicial}
              onChange={(e) => setFormData(prev => ({ ...prev, saldoInicial: e.target.value }))}
              placeholder="0.00"
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
