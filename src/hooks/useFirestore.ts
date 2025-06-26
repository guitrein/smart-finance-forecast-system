
import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy,
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from '@/hooks/use-toast';

export function useFirestore<T>(collectionName: string) {
  const [data, setData] = useState<(T & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(true);

  useEffect(() => {
    const q = query(collection(db, collectionName), orderBy('criadoEm', 'desc'));
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as (T & { id: string })[];
        
        setData(items);
        setLoading(false);
        setConnected(true);
      },
      (error) => {
        console.error('Firestore error:', error);
        setConnected(false);
        setLoading(false);
        toast({
          title: "Erro de conexão",
          description: "Falha ao conectar com o Firebase",
          variant: "destructive"
        });
      }
    );

    return () => unsubscribe();
  }, [collectionName]);

  const add = async (item: Omit<T, 'id' | 'criadoEm'>) => {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...item,
        criadoEm: Timestamp.now().toDate().toISOString()
      });
      toast({
        title: "Sucesso",
        description: "Item adicionado com sucesso",
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding document:', error);
      toast({
        title: "Erro",
        description: "Falha ao adicionar item",
        variant: "destructive"
      });
      throw error;
    }
  };

  const update = async (id: string, updates: Partial<T>) => {
    try {
      await updateDoc(doc(db, collectionName, id), updates);
      toast({
        title: "Sucesso",
        description: "Item atualizado com sucesso",
      });
    } catch (error) {
      console.error('Error updating document:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar item",
        variant: "destructive"
      });
      throw error;
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteDoc(doc(db, collectionName, id));
      toast({
        title: "Sucesso",
        description: "Item removido com sucesso",
      });
    } catch (error) {
      console.error('Error removing document:', error);
      toast({
        title: "Erro",
        description: "Falha ao remover item",
        variant: "destructive"
      });
      throw error;
    }
  };

  return { data, loading, connected, add, update, remove };
}
