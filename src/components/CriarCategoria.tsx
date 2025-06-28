
import { useState } from 'react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FormularioCategoria } from './FormularioCategoria';
import { Tag } from 'lucide-react';

export const CriarCategoria = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Tag className="w-4 h-4 mr-2" />
          Gerenciar Categorias
        </Button>
      </DialogTrigger>
      <FormularioCategoria onSuccess={() => setOpen(false)} />
    </Dialog>
  );
};
