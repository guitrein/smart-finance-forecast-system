
import { useState } from 'react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useFirestore } from '@/hooks/useFirestore';
import { Categoria } from '@/types';
import { FormularioCategoria } from './FormularioCategoria';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';

export const GerenciarCategorias = () => {
  const { data: categorias, remove } = useFirestore<Categoria>('categorias');
  const [dialogAberto, setDialogAberto] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | undefined>();

  const abrirDialog = (categoria?: Categoria) => {
    setCategoriaEditando(categoria);
    setDialogAberto(true);
  };

  const fecharDialog = () => {
    setDialogAberto(false);
    setCategoriaEditando(undefined);
  };

  const excluirCategoria = async (id: string) => {
    try {
      await remove(id);
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
    }
  };

  return (
    <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Gerenciar Categorias</h2>
          <DialogTrigger asChild>
            <Button onClick={() => abrirDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Categoria
            </Button>
          </DialogTrigger>
        </div>

        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ícone</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Cor</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categorias.map((categoria) => (
                <TableRow key={categoria.id}>
                  <TableCell>
                    <span className="text-2xl">{categoria.icone}</span>
                  </TableCell>
                  <TableCell className="font-medium">{categoria.nome}</TableCell>
                  <TableCell>{categoria.descricao}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded-full border" 
                        style={{ backgroundColor: categoria.cor }}
                      />
                      <span className="text-sm text-gray-600">{categoria.cor}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => abrirDialog(categoria)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir a categoria "{categoria.nome}"? 
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => excluirCategoria(categoria.id)}>
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <FormularioCategoria
        categoria={categoriaEditando}
        onSuccess={fecharDialog}
      />
    </Dialog>
  );
};
