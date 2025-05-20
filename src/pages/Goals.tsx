
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Target, Edit, Trash2, Plus, Calendar } from "lucide-react";

// Interface for the goal object
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
}

const Goals = () => {
  // State variables
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_amount: 0,
    current_amount: 0,
    deadline: '',
    category: ''
  });

  const { user } = useAuth();

  // Calculate progress percentage
  const calculateProgress = (current: number, target: number) => {
    if (target === 0) return 0;
    const percentage = (current / target) * 100;
    return Math.min(Math.max(percentage, 0), 100);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  // Load goals from the database
  const fetchGoals = async () => {
    setIsLoading(true);
    
    try {
      if (!user) {
        setGoals([]);
        return;
      }
      
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        toast.error("Failed to load goals: " + error.message);
        throw error;
      }
      
      setGoals(data || []);
    } catch (error) {
      console.error("Error fetching goals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'target_amount' || name === 'current_amount' 
        ? parseFloat(value) || 0
        : value
    });
  };

  // Add a new goal
  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to add goals");
      return;
    }

    if (!formData.title || formData.target_amount <= 0) {
      toast.error("Please provide a title and a valid target amount");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('goals')
        .insert([
          {
            user_id: user.id,
            title: formData.title,
            description: formData.description || null,
            target_amount: formData.target_amount,
            current_amount: formData.current_amount || 0,
            deadline: formData.deadline || null,
            category: formData.category || null
          }
        ])
        .select();

      if (error) {
        toast.error("Failed to add goal: " + error.message);
        throw error;
      }

      toast.success("Goal added successfully!");
      setIsAddDialogOpen(false);
      setFormData({
        title: '',
        description: '',
        target_amount: 0,
        current_amount: 0,
        deadline: '',
        category: ''
      });
      fetchGoals();
    } catch (error) {
      console.error("Error adding goal:", error);
    }
  };

  // Update an existing goal
  const handleUpdateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !selectedGoal) {
      toast.error("You must be logged in to update goals");
      return;
    }

    if (!formData.title || formData.target_amount <= 0) {
      toast.error("Please provide a title and a valid target amount");
      return;
    }

    try {
      const { error } = await supabase
        .from('goals')
        .update({
          title: formData.title,
          description: formData.description || null,
          target_amount: formData.target_amount,
          current_amount: formData.current_amount || 0,
          deadline: formData.deadline || null,
          category: formData.category || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedGoal.id);

      if (error) {
        toast.error("Failed to update goal: " + error.message);
        throw error;
      }

      toast.success("Goal updated successfully!");
      setIsEditDialogOpen(false);
      setSelectedGoal(null);
      fetchGoals();
    } catch (error) {
      console.error("Error updating goal:", error);
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

        if (error) {
          toast.error("Failed to delete goal: " + error.message);
          throw error;
        }

        toast.success("Goal deleted successfully!");
        fetchGoals();
      } catch (error) {
        console.error("Error deleting goal:", error);
      }
    }
  };

  // Open the edit dialog with selected goal data
  const openEditDialog = (goal: Goal) => {
    setSelectedGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description || '',
      target_amount: goal.target_amount,
      current_amount: goal.current_amount,
      deadline: goal.deadline ? goal.deadline.split('T')[0] : '',
      category: goal.category || ''
    });
    setIsEditDialogOpen(true);
  };

  // Fetch goals on component mount and when user changes
  useEffect(() => {
    fetchGoals();
  }, [user]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Target className="mr-2" /> Financial Goals
          </h1>
          <p className="text-gray-500 mt-1">
            Track your financial goals and monitor your progress
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center">
              <Plus className="mr-2 h-4 w-4" /> Add New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
              <DialogDescription>
                Set a new financial goal and track your progress towards achieving it.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleAddGoal} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">Goal Name</label>
                <Input 
                  id="title" 
                  name="title" 
                  placeholder="e.g., New Car, Emergency Fund" 
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">Description (Optional)</label>
                <Textarea 
                  id="description" 
                  name="description" 
                  placeholder="Describe your goal..." 
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="target_amount" className="text-sm font-medium">Target Amount (₱)</label>
                  <Input 
                    id="target_amount" 
                    name="target_amount" 
                    type="number" 
                    min="0"
                    step="0.01"
                    placeholder="50000" 
                    value={formData.target_amount || ''}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="current_amount" className="text-sm font-medium">Current Progress (₱)</label>
                  <Input 
                    id="current_amount" 
                    name="current_amount" 
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="5000" 
                    value={formData.current_amount || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="deadline" className="text-sm font-medium">Target Date (Optional)</label>
                  <div className="flex">
                    <Calendar className="h-4 w-4 mr-2 mt-3" />
                    <Input 
                      id="deadline" 
                      name="deadline" 
                      type="date" 
                      value={formData.deadline}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium">Category (Optional)</label>
                  <Input 
                    id="category" 
                    name="category" 
                    placeholder="e.g., Savings, Investment" 
                    value={formData.category}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Goal</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Goal Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
            <DialogDescription>
              Update your goal details and progress.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleUpdateGoal} className="space-y-4 pt-4">
            {/* Same form fields as Add Dialog but for editing */}
            <div className="space-y-2">
              <label htmlFor="edit-title" className="text-sm font-medium">Goal Name</label>
              <Input 
                id="edit-title" 
                name="title" 
                placeholder="e.g., New Car, Emergency Fund" 
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="edit-description" className="text-sm font-medium">Description (Optional)</label>
              <Textarea 
                id="edit-description" 
                name="description" 
                placeholder="Describe your goal..." 
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="edit-target_amount" className="text-sm font-medium">Target Amount (₱)</label>
                <Input 
                  id="edit-target_amount" 
                  name="target_amount" 
                  type="number" 
                  min="0"
                  step="0.01"
                  placeholder="50000" 
                  value={formData.target_amount || ''}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="edit-current_amount" className="text-sm font-medium">Current Progress (₱)</label>
                <Input 
                  id="edit-current_amount" 
                  name="current_amount" 
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="5000" 
                  value={formData.current_amount || ''}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="edit-deadline" className="text-sm font-medium">Target Date (Optional)</label>
                <div className="flex">
                  <Calendar className="h-4 w-4 mr-2 mt-3" />
                  <Input 
                    id="edit-deadline" 
                    name="deadline" 
                    type="date" 
                    value={formData.deadline}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="edit-category" className="text-sm font-medium">Category (Optional)</label>
                <Input 
                  id="edit-category" 
                  name="category" 
                  placeholder="e.g., Savings, Investment" 
                  value={formData.category}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Update Goal</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Display when not logged in */}
      {!user && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              You need to sign in to create and track your financial goals.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link to="/auth">Sign In or Register</Link>
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Loading state */}
      {isLoading && user && (
        <div className="text-center py-10">
          <p>Loading your goals...</p>
        </div>
      )}

      {/* No goals state */}
      {!isLoading && goals.length === 0 && user && (
        <Card className="text-center py-10">
          <CardContent>
            <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Goals Yet</h3>
            <p className="text-gray-500 mb-4">
              Start tracking your financial progress by creating your first goal.
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Your First Goal
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Goals list */}
      {!isLoading && goals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map(goal => (
            <Card key={goal.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{goal.title}</CardTitle>
                    {goal.category && (
                      <div className="inline-block px-2 py-1 mt-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        {goal.category}
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => openEditDialog(goal)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDeleteGoal(goal.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {goal.description && (
                  <p className="text-sm text-gray-500 mb-4">{goal.description}</p>
                )}
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>
                      {Math.round(calculateProgress(goal.current_amount, goal.target_amount))}%
                    </span>
                  </div>
                  <Progress 
                    value={calculateProgress(goal.current_amount, goal.target_amount)} 
                    className="h-2"
                  />
                </div>
                
                <div className="flex justify-between text-sm mb-2">
                  <span>Current</span>
                  <span className="font-medium">{formatCurrency(goal.current_amount)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Target</span>
                  <span className="font-medium">{formatCurrency(goal.target_amount)}</span>
                </div>
                
                {goal.deadline && (
                  <div className="mt-4 flex items-center text-sm text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>
                      Target date: {new Date(goal.deadline).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Goals;
