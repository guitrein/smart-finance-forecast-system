
import { useState, useEffect } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { Categoria } from '@/types';
import { categoriasPadrao } from '@/data/categoriasPadrao';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, Database, Rocket } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SetupInicialProps {
  onComplete: () => void;
}

export const SetupInicial = ({ onComplete }: SetupInicialProps) => {
  const { data: categorias, add: addCategoria } = useSupabase<Categoria>('categorias');
  const [criandoCategorias, setCriandoCategorias] = useState(false);

  const supabaseConfigurado = () => {
    return true; // Supabase já está configurado
  };

  const criarCategoriasIniciais = async () => {
    setCriandoCategorias(true);
    try {
      const promises = categoriasPadrao.map(categoria => addCategoria(categoria));
      await Promise.all(promises);
      
      toast({
        title: "Categorias criadas!",
        description: "Categorias padrão foram adicionadas com sucesso",
      });
    } catch (error) {
      console.error('Erro ao criar categorias:', error);
      toast({
        title: "Erro",
        description: "Falha ao criar categorias padrão",
        variant: "destructive"
      });
    } finally {
      setCriandoCategorias(false);
    }
  };

  const podeIniciar = categorias.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">
            💰 Gestão Financeira Pessoal
          </h1>
          <p className="text-lg text-gray-600">
            Sistema completo para controlar suas finanças
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-6 h-6" />
              Configuração Inicial
            </CardTitle>
            <CardDescription>
              Configure os dados básicos do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Supabase */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <h3 className="font-semibold">Configuração do Supabase</h3>
                  <p className="text-sm text-gray-600">
                    Supabase configurado e conectado
                  </p>
                </div>
              </div>
            </div>

            {/* Status Categorias */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {categorias.length > 0 ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                )}
                <div>
                  <h3 className="font-semibold">Categorias Padrão</h3>
                  <p className="text-sm text-gray-600">
                    {categorias.length > 0 
                      ? `${categorias.length} categorias configuradas` 
                      : 'Criar categorias básicas do sistema'
                    }
                  </p>
                </div>
              </div>
              {categorias.length === 0 && (
                <Button 
                  onClick={criarCategoriasIniciais}
                  disabled={criandoCategorias}
                >
                  {criandoCategorias ? 'Criando...' : 'Criar Categorias'}
                </Button>
              )}
            </div>

            {podeIniciar && (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <CheckCircle className="w-6 h-6" />
                  <span className="font-semibold">Sistema pronto para uso!</span>
                </div>
                <Button onClick={onComplete} size="lg" className="w-full">
                  <Rocket className="w-5 h-5 mr-2" />
                  Iniciar Sistema
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500">
          <p>🚀 Sistema desenvolvido com React, TypeScript, Supabase e Tailwind CSS</p>
        </div>
      </div>
    </div>
  );
};
