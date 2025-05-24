
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type Expense = {
  id: string;
  amount: number;
  category: string;
  description: string | null;
  date: string;
  created_at: string;
  updated_at: string;
  user_id: string;
};

export const useExpenses = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch all expenses for the current user
  const fetchExpenses = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast.error('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  // Add a new expense
  const addExpense = async (expense: {
    amount: number;
    category: string;
    description?: string;
    date: string;
  }) => {
    if (!user) {
      toast.error('You must be logged in to add expenses');
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('expenses')
        .insert([
          {
            ...expense,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      
      setExpenses(prev => [data, ...prev]);
      toast.success('Expense added successfully');
      return data;
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  // Delete an expense
  const deleteExpense = async (id: string) => {
    if (!user) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setExpenses(prev => prev.filter(expense => expense.id !== id));
      toast.success('Expense deleted successfully');
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Failed to delete expense');
    } finally {
      setLoading(false);
    }
  };

  // Load expenses when user changes
  useEffect(() => {
    if (user) {
      fetchExpenses();
    } else {
      setExpenses([]);
    }
  }, [user]);

  return {
    expenses,
    loading,
    addExpense,
    deleteExpense,
    fetchExpenses,
  };
};
