
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Updated Budget type to match Supabase table structure
export type Budget = {
  id: string;
  category: string;
  amount: number;
  period: string; // Changed from union type to string to match database
  created_at: string;
  updated_at: string;
  user_id: string;
};

export const useBudgets = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch all budgets for the current user
  const fetchBudgets = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBudgets(data || []);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      toast.error('Failed to fetch budgets');
    } finally {
      setLoading(false);
    }
  };

  // Add a new budget
  const addBudget = async (budget: {
    category: string;
    amount: number;
    period: 'daily' | 'weekly' | 'monthly'; // Keep union type for input validation
  }) => {
    if (!user) {
      toast.error('You must be logged in to add budgets');
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('budgets')
        .insert([
          {
            ...budget,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      
      setBudgets(prev => [data, ...prev]);
      toast.success('Budget added successfully');
      return data;
    } catch (error) {
      console.error('Error adding budget:', error);
      toast.error('Failed to add budget');
    } finally {
      setLoading(false);
    }
  };

  // Delete a budget
  const deleteBudget = async (id: string) => {
    if (!user) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setBudgets(prev => prev.filter(budget => budget.id !== id));
      toast.success('Budget deleted successfully');
    } catch (error) {
      console.error('Error deleting budget:', error);
      toast.error('Failed to delete budget');
    } finally {
      setLoading(false);
    }
  };

  // Load budgets when user changes
  useEffect(() => {
    if (user) {
      fetchBudgets();
    } else {
      setBudgets([]);
    }
  }, [user]);

  return {
    budgets,
    loading,
    addBudget,
    deleteBudget,
    fetchBudgets,
  };
};
