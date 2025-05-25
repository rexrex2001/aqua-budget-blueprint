
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useBudgets } from "@/hooks/useBudgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

// Categories for budget selection
const categories = [
  "Food & Dining",
  "Transportation",
  "Housing",
  "Utilities",
  "Entertainment",
  "Healthcare",
  "Shopping",
  "Personal Care",
  "Education",
  "Travel",
  "Other"
];

const BudgetManager = () => {
  const { user } = useAuth();
  const { budgets, loading, addBudget, deleteBudget } = useBudgets();
  
  // Form state for creating new budget (income)
  const [newBudget, setNewBudget] = useState({
    category: "",
    amount: "",
    description: "",
  });

  // Demo data for guests to see the interface
  const demoBudgets = [
    { id: '1', category: 'Food & Dining', amount: 15000, description: 'Monthly grocery and dining budget', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z', user_id: 'demo', period: 'monthly' },
    { id: '2', category: 'Transportation', amount: 8000, description: 'Commute and travel expenses', created_at: '2024-01-02T00:00:00Z', updated_at: '2024-01-02T00:00:00Z', user_id: 'demo', period: 'monthly' },
    { id: '3', category: 'Entertainment', amount: 5000, description: 'Movies, games, and leisure activities', created_at: '2024-01-03T00:00:00Z', updated_at: '2024-01-03T00:00:00Z', user_id: 'demo', period: 'monthly' },
  ];

  // Use actual data for authenticated users, demo data for guests
  const displayBudgets = user ? budgets : demoBudgets;

  // Handle form submission for creating new budget
  const handleBudgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please sign in to manage your budget");
      return;
    }
    
    if (!newBudget.category || !newBudget.amount || !newBudget.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    const amount = parseFloat(newBudget.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    // Check if budget for this category already exists
    const existingBudget = budgets.find(b => b.category === newBudget.category);

    if (existingBudget) {
      toast.error(`A budget for ${newBudget.category} already exists`);
      return;
    }

    const result = await addBudget({
      category: newBudget.category,
      amount,
      period: 'monthly', // Default period for backend compatibility
      description: newBudget.description, // Pass description to the add function
    });

    if (result) {
      setNewBudget({
        category: "",
        amount: "",
        description: "",
      });
      toast.success("Income budget added successfully");
    }
  };

  // Handle budget deletion
  const handleDeleteBudget = async (id: string) => {
    if (!user) {
      toast.error("Please sign in to delete budgets");
      return;
    }
    await deleteBudget(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="text-2xl font-bold text-blue-800">Income Manager</h1>
      </div>

      {!user && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2 text-blue-800">Demo Mode</h3>
              <p className="text-blue-700 mb-4">
                You're viewing demo data. <Button variant="link" className="p-0 h-auto text-blue-700 underline" onClick={() => window.location.href = '/auth'}>Sign in</Button> to manage your actual income and budgets.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Add New Income Source</CardTitle>
          </CardHeader>
          <CardContent>
            {!user && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  Please <Button variant="link" className="p-0 h-auto text-blue-700 underline" onClick={() => window.location.href = '/auth'}>sign in</Button> to add income sources
                </p>
              </div>
            )}
            <form onSubmit={handleBudgetSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newBudget.category}
                  onValueChange={(value) => setNewBudget({ ...newBudget, category: value })}
                  disabled={loading || !user}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Income Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    ₱
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={newBudget.amount}
                    onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
                    className="pl-10"
                    disabled={loading || !user}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Describe this income source"
                  value={newBudget.description}
                  onChange={(e) => setNewBudget({ ...newBudget, description: e.target.value })}
                  disabled={loading || !user}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading || !user}>
                {loading ? "Adding..." : "Add Income Source"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-green-600">Your Income Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {displayBudgets.length > 0 ? (
                displayBudgets.map((budget) => {
                  return (
                    <div key={budget.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">{budget.category}</span>
                          <div className="text-sm text-muted-foreground mt-1">
                            {budget.description || "No description"}
                          </div>
                        </div>
                        {user && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteBudget(budget.id)}
                            className="text-red-500 hover:text-red-700 h-8"
                            disabled={loading}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-green-600 font-medium text-lg">
                          ₱ {Number(budget.amount).toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="h-2 bg-green-100 rounded-full">
                        <div className="h-full bg-green-500 rounded-full w-full"></div>
                      </div>
                    </div>
                  );
                })
              ) : user ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No income sources added yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add income sources to track your available budget
                  </p>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">Sign in to view and manage your income sources</p>
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => window.location.href = '/auth'}
                  >
                    Sign In
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BudgetManager;
