
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useSupabase<T>(tableName: string) {
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
      const { data: result, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar dados:', error);
        setConnected(false);
        return;
      }

      setData(result || []);
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
      .insert([{ ...item, user_id: user.id }])
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar:', error);
      throw error;
    }

    await fetchData();
    return result;
  };

  const update = async (id: string, updates: Partial<T>) => {
    if (!user) return;

    const { error } = await supabase
      .from(tableName)
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Erro ao atualizar:', error);
      throw error;
    }

    await fetchData();
  };

  const remove = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

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
