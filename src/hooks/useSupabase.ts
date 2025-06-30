
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

type TableName = 'cartoes' | 'categorias' | 'contas' | 'lancamentos' | 'recorrentes';

export function useSupabase<T extends Record<string, any>>(tableName: TableName) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(true);
  const { user } = useAuth();

  const fetchData = async () => {
    if (!user) {
      setData([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Buscar todos os dados sem filtrar por user_id
      const { data: result, error } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar dados:', error);
        setConnected(false);
        return;
      }

      setData((result || []) as unknown as T[]);
      setConnected(true);
    } catch (error) {
      console.error('Erro na conexão:', error);
      setConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tableName, user]);

  const add = async (item: Omit<T, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) return;

    const { data: result, error } = await supabase
      .from(tableName)
      .insert([{ ...item, user_id: user.id } as any])
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar:', error);
      throw error;
    }

    await fetchData();
    return result.id;
  };

  const update = async (id: string, updates: Partial<T>) => {
    if (!user) return;

    // Remover filtro por user_id na atualização para permitir editar qualquer registro
    const { error } = await supabase
      .from(tableName)
      .update(updates as any)
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar:', error);
      throw error;
    }

    await fetchData();
  };

  const remove = async (id: string) => {
    if (!user) return;

    // Remover filtro por user_id na exclusão para permitir deletar qualquer registro
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao remover:', error);
      throw error;
    }

    await fetchData();
  };

  return {
    data,
    loading,
    connected,
    add,
    update,
    remove,
    refetch: fetchData,
  };
}
