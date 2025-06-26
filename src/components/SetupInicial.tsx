
import { useState, useEffect } from 'react';
import { useFirestore } from '@/hooks/useFirestore';
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
  const { data: categorias, add: addCategoria } = useFirestore<Categoria>('categorias');
  const [configurandoFirebase, setConfigurandoFirebase] = useState(false);
  const [criandoCategorias, setCriandoCategorias] = useState(false);

  const firebaseConfigurado = () => {
    // Verificar se as configurações do Firebase estão preenchidas
    const config = {
      apiKey: "your-api-key",
      authDomain: "your-project.firebaseapp.com",
      projectId: "your-project-id",
    };
    return !Object.values(config).some(value => value.includes('your-'));
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
              Configure o Firebase e inicialize os dados básicos do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Firebase */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {firebaseConfigurado() ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                )}
                <div>
                  <h3 className="font-semibold">Configuração do Firebase</h3>
                  <p className="text-sm text-gray-600">
                    {firebaseConfigurado() 
                      ? 'Firebase configurado e conectado' 
                      : 'Configure as credenciais do Firebase no arquivo src/lib/firebase.ts'
                    }
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

            {!firebaseConfigurado() && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Configuração necessária:</strong> Edite o arquivo{' '}
                  <code className="bg-gray-100 px-2 py-1 rounded">src/lib/firebase.ts</code>{' '}
                  com suas credenciais do Firebase para conectar ao banco de dados.
                </AlertDescription>
              </Alert>
            )}

            {firebaseConfigurado() && podeIniciar && (
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
          <p>🚀 Sistema desenvolvido com React, TypeScript, Firebase e Tailwind CSS</p>
        </div>
      </div>
    </div>
  );
};
