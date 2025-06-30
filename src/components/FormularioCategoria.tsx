
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSupabase } from '@/hooks/useSupabase';
import { Categoria } from '@/types';

const categoriaSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().optional(),
  icone: z.string().min(1, 'Ícone é obrigatório'),
  cor: z.string().min(1, 'Cor é obrigatória'),
});

type CategoriaFormData = z.infer<typeof categoriaSchema>;

interface FormularioCategoriaProps {
  categoria?: Categoria;
  onSuccess: () => void;
}

export const FormularioCategoria = ({ categoria, onSuccess }: FormularioCategoriaProps) => {
  const { add, update } = useSupabase<Categoria>('categorias');
  const [loading, setLoading] = useState(false);

  const form = useForm<CategoriaFormData>({
    resolver: zodResolver(categoriaSchema),
    defaultValues: {
      nome: categoria?.nome || '',
      descricao: categoria?.descricao || '',
      icone: categoria?.icone || '💰',
      cor: categoria?.cor || '#3B82F6',
    },
  });

  const onSubmit = async (data: CategoriaFormData) => {
    try {
      setLoading(true);
      
      const categoriaData = {
        nome: data.nome,
        descricao: data.descricao || '',
        icone: data.icone,
        cor: data.cor,
      };
      
      if (categoria) {
        await update(categoria.id, categoriaData);
      } else {
        await add(categoriaData);
      }
      
      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>
          {categoria ? 'Editar Categoria' : 'Nova Categoria'}
        </DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Nome da categoria" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="descricao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Textarea placeholder="Descrição da categoria" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="icone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ícone (Emoji)</FormLabel>
                <FormControl>
                  <Input placeholder="💰" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cor</FormLabel>
                <FormControl>
                  <Input type="color" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="min-w-24"
            >
              {loading ? 'Salvando...' : categoria ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
};
