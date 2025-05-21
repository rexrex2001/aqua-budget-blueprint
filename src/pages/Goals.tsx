import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/utils/formatCurrency";
import { 
  Target, 
  Plus, 
  Pencil, 
  Trash2, 
  Calendar, 
  Tag, 
  PiggyBank,
  Trophy,
  ChevronRight,
  Check,
  Clock
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Types
interface Goal {
  id: string;
  title: string;
  description: string | null;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  category: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

const Goals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewGoalDialogOpen, setIsNewGoalDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', description: '', target_amount: 0, deadline: '', category: '' });
  const { user } = useAuth();

  // Fetch goals
  const fetchGoals = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast.error('Failed to load goals');
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new goal
  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("You must be logged in to create goals");
      return;
    }

    if (!newGoal.title.trim() || newGoal.target_amount <= 0) {
      toast.error("Please provide a valid title and target amount for your goal");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('goals')
        .insert([{ ...newGoal, user_id: user.id }])
        .select();

      if (error) throw error;

      toast.success("Goal created successfully!");
      setIsNewGoalDialogOpen(false);
      setNewGoal({ title: '', description: '', target_amount: 0, deadline: '', category: '' });
      fetchGoals();
    } catch (error) {
      console.error('Error creating goal:', error);
      toast.error('Failed to create goal');
    }
  };

  // Delete a goal
  const handleDeleteGoal = async (id: string) => {
    if (!user) {
      toast.error("You must be logged in to delete goals");
      return;
    }

    if (confirm("Are you sure you want to delete this goal?")) {
      try {
        const { error } = await supabase
          .from('goals')
          .delete()
          .eq('id', id);

        if (error) throw error;

        toast.success("Goal deleted successfully");
        fetchGoals();
      } catch (error) {
        console.error('Error deleting goal:', error);
        toast.error('Failed to delete goal');
      }
    }
  };

  // Load goals on component mount
  useEffect(() => {
    fetchGoals();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Goals</h1>
        {user && (
          <Dialog open={isNewGoalDialogOpen} onOpenChange={setIsNewGoalDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center">
                <Plus className="mr-2 h-4 w-4" /> New Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Goal</DialogTitle>
                <DialogDescription>
                  Set a new financial goal to track your progress.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleCreateGoal} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">Title</label>
                  <Input 
                    id="title" 
                    placeholder="Goal title" 
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Description</label>
                  <Textarea 
                    id="description" 
                    placeholder="Goal description" 
                    value={newGoal.description || ''}
                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="target_amount" className="text-sm font-medium">Target Amount</label>
                  <Input 
                    id="target_amount" 
                    type="number" 
                    placeholder="₱0.00" 
                    value={newGoal.target_amount}
                    onChange={(e) => setNewGoal({ ...newGoal, target_amount: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="deadline" className="text-sm font-medium">Deadline</label>
                  <Input 
                    id="deadline" 
                    type="date" 
                    value={newGoal.deadline || ''}
                    onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium">Category</label>
                  <Select onValueChange={(value) => setNewGoal({ ...newGoal, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="Savings">Savings</SelectItem>
                        <SelectItem value="Investment">Investment</SelectItem>
                        <SelectItem value="Expense">Expense</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsNewGoalDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create Goal</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center">Loading goals...</p>
          </CardContent>
        </Card>
      ) : goals.length === 0 ? (
        <Card>
          <CardContent className="text-center py-10">
            <PiggyBank className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Goals Yet</h3>
            <p className="text-gray-500 mb-4">
              Start tracking your financial goals by creating one.
            </p>
            {user && (
              <Button onClick={() => setIsNewGoalDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Create A Goal
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {goals.map(goal => (
            <Card key={goal.id} className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{goal.title}</CardTitle>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>{goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'No deadline'}</span>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-gray-600">{goal.description}</p>
                <Progress value={(goal.current_amount / goal.target_amount) * 100} className="mt-2" />
                <div className="flex justify-between mt-2">
                  <span>{formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}</span>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteGoal(goal.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Goals;
