
import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { calculateExpenseProjection, calculateBudgetProjection } from "@/utils/projectionUtils";

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
  const { userData, addBudget, deleteBudget } = useUser();
  const [showProjections, setShowProjections] = useState(false);
  
  const [newBudget, setNewBudget] = useState({
    category: "",
    amount: "",
    period: "monthly" as "daily" | "weekly" | "monthly",
  });

  // Calculate expense projections for budget analysis
  const projectedExpenses = calculateExpenseProjection(userData.expenses, 90);
  
  // Calculate budget projections using greedy algorithm
  const budgetProjections = calculateBudgetProjection(
    userData.budgets,
    userData.expenses,
    projectedExpenses
  );

  // Helper function to calculate spending by category
  const getSpendingByCategory = (category: string, period: "daily" | "weekly" | "monthly") => {
    const now = new Date();
    let startDate: Date;

    if (period === "daily") {
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
    } else if (period === "weekly") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - now.getDay());
      startDate.setHours(0, 0, 0, 0);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return userData.expenses
      .filter(expense => 
        expense.category === category && 
        new Date(expense.date) >= startDate
      )
      .reduce((sum, expense) => sum + expense.amount, 0);
  };

  const handleBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newBudget.category || !newBudget.amount || !newBudget.period) {
      toast.error("Please fill in all required fields");
      return;
    }

    const amount = parseFloat(newBudget.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    // Check if budget for this category and period already exists
    const existingBudget = userData.budgets.find(
      b => b.category === newBudget.category && b.period === newBudget.period
    );

    if (existingBudget) {
      toast.error(`A ${newBudget.period} budget for ${newBudget.category} already exists`);
      return;
    }

    addBudget({
      category: newBudget.category,
      amount,
      period: newBudget.period,
    });

    toast.success("Budget added successfully");

    setNewBudget({
      category: "",
      amount: "",
      period: "monthly",
    });
  };

  const handleDeleteBudget = (id: string) => {
    deleteBudget(id);
    toast.success("Budget deleted successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="text-2xl font-bold text-finance-text">Budget Manager</h1>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowProjections(!showProjections)}
          className="text-xs"
        >
          {showProjections ? "Hide Projections" : "Show Projections"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Create New Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBudgetSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newBudget.category}
                  onValueChange={(value) => setNewBudget({ ...newBudget, category: value })}
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
                <Label htmlFor="amount">Budget Amount</Label>
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
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="period">Budget Period</Label>
                <Select
                  value={newBudget.period}
                  onValueChange={(value) => setNewBudget({ ...newBudget, period: value as "daily" | "weekly" | "monthly" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full">Create Budget</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Your Budgets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {userData.budgets.length > 0 ? (
                userData.budgets.map((budget) => {
                  const spent = getSpendingByCategory(budget.category, budget.period);
                  const percentage = Math.min(Math.round((spent / budget.amount) * 100), 100);
                  
                  return (
                    <div key={budget.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">{budget.category}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            ({budget.period})
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteBudget(budget.id)}
                          className="text-red-500 hover:text-red-700 h-8"
                        >
                          Delete
                        </Button>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <span>
                          ₱ {spent.toFixed(2)} / {budget.amount.toFixed(2)}
                        </span>
                        <span className={percentage >= 100 ? "text-red-500" : "text-green-600"}>
                          {percentage}%
                        </span>
                      </div>
                      
                      <Progress 
                        value={percentage} 
                        className={`h-2 ${
                          percentage >= 100 ? "bg-red-200" : percentage > 80 ? "bg-amber-200" : "bg-green-200"
                        }`} 
                      />
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No budgets created yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create a budget to start tracking your spending against your goals
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {showProjections && (
        <Card>
          <CardHeader>
            <CardTitle>Budget Projections</CardTitle>
            <p className="text-sm text-muted-foreground">
              See how your expenses will affect your budget in the future
            </p>
          </CardHeader>
          <CardContent>
            {budgetProjections.length > 0 ? (
              <div className="space-y-6">
                {budgetProjections.map((projection) => (
                  <div key={projection.id} className="space-y-3">
                    <div>
                      <span className="font-medium">{projection.category}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({projection.period})
                      </span>
                    </div>
                    
                    <ScrollArea className="h-40 w-full rounded-md border">
                      <div className="p-4 space-y-4">
                        {projection.projections.length > 0 ? (
                          projection.projections.map((period: any, index: number) => {
                            const isOverBudget = period.amount > projection.amount;
                            
                            return (
                              <div key={`${projection.id}-${period.period}`} className="space-y-1">
                                <div className="flex justify-between items-center text-sm">
                                  <span className="font-medium">{period.label}</span>
                                  <span className={isOverBudget ? "text-red-500" : "text-green-600"}>
                                    ₱ {period.amount.toFixed(2)}
                                  </span>
                                </div>
                                
                                <Progress 
                                  value={period.percentage}
                                  className={`h-1.5 ${
                                    isOverBudget ? "bg-red-200" : period.percentage > 80 ? "bg-amber-200" : "bg-green-200"
                                  }`}
                                />
                                
                                <div className="text-xs text-right text-muted-foreground">
                                  {isOverBudget ? "Over budget" : `${period.percentage}% of budget`}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-center text-muted-foreground py-4">
                            Not enough data for projections
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No budget projections available</p>
                <p className="text-xs text-muted-foreground mt-2">Create budgets to see projections</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BudgetManager;
