
import { useState } from 'react';
import { useFirestore } from '@/hooks/useFirestore';
import { Cartao } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { CreditCard } from 'lucide-react';

export const CriarCartao = () => {
  const { add } = useFirestore<Cartao>('cartoes');
  
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    bandeira: '',
    limite: '',
    diaVencimento: '',
    tipo: 'cartao'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const novoCartao: Omit<Cartao, 'id' | 'criadoEm'> = {
        nome: formData.nome,
        bandeira: formData.bandeira,
        limite: parseFloat(formData.limite) || 0,
        diaVencimento: parseInt(formData.diaVencimento),
        tipo: formData.tipo
      };

      await add(novoCartao);
      
      setFormData({
        nome: '',
        bandeira: '',
        limite: '',
        diaVencimento: '',
        tipo: 'cartao'
      });
      
      setOpen(false);
    } catch (error) {
      console.error('Erro ao criar cartão:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <CreditCard className="w-4 h-4 mr-2" />
          Novo Cartão
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Cartão</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome do Cartão</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              placeholder="Ex: Cartão Nubank"
              required
            />
          </div>

          <div>
            <Label htmlFor="bandeira">Bandeira</Label>
            <Select value={formData.bandeira} onValueChange={(value) => setFormData(prev => ({ ...prev, bandeira: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a bandeira" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="visa">Visa</SelectItem>
                <SelectItem value="mastercard">Mastercard</SelectItem>
                <SelectItem value="elo">Elo</SelectItem>
                <SelectItem value="american-express">American Express</SelectItem>
                <SelectItem value="hipercard">Hipercard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="limite">Limite</Label>
            <Input
              id="limite"
              type="number"
              step="0.01"
              value={formData.limite}
              onChange={(e) => setFormData(prev => ({ ...prev, limite: e.target.value }))}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <Label htmlFor="diaVencimento">Dia do Vencimento</Label>
            <Input
              id="diaVencimento"
              type="number"
              min="1"
              max="31"
              value={formData.diaVencimento}
              onChange={(e) => setFormData(prev => ({ ...prev, diaVencimento: e.target.value }))}
              placeholder="Ex: 15"
              required
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
