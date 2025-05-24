
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useExpenses } from "@/hooks/useExpenses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { toast } from "sonner";

type TimeFrame = "daily" | "weekly" | "monthly";

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

const ExpenseTracker = () => {
  const { user } = useAuth();
  const { expenses, loading, addExpense, deleteExpense } = useExpenses();
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("monthly");
  
  const [newExpense, setNewExpense] = useState({
    amount: "",
    category: "",
    description: "",
    date: format(new Date(), "yyyy-MM-dd"),
  });

  // Filter expenses based on the selected timeframe
  const filterExpensesByTimeFrame = () => {
    const now = new Date();
    let startDate: Date;

    if (timeFrame === "daily") {
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
    } else if (timeFrame === "weekly") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - now.getDay());
      startDate.setHours(0, 0, 0, 0);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return expenses.filter(expense => new Date(expense.date) >= startDate)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const filteredExpenses = filterExpensesByTimeFrame();

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please sign in to add expenses");
      return;
    }
    
    if (!newExpense.amount || !newExpense.category || !newExpense.date) {
      toast.error("Please fill in all required fields");
      return;
    }

    const amount = parseFloat(newExpense.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const result = await addExpense({
      amount,
      category: newExpense.category,
      description: newExpense.description,
      date: newExpense.date,
    });

    if (result) {
      setNewExpense({
        amount: "",
        category: "",
        description: "",
        date: format(new Date(), "yyyy-MM-dd"),
      });
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!user) {
      toast.error("Please sign in to delete expenses");
      return;
    }
    await deleteExpense(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="text-2xl font-bold text-blue-800">Expense Tracker</h1>
        
        <Tabs value={timeFrame} onValueChange={(value) => setTimeFrame(value as TimeFrame)} className="w-full sm:w-auto mt-4 sm:mt-0">
          <TabsList>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Add New Expense</CardTitle>
          </CardHeader>
          <CardContent>
            {!user && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  Please <Button variant="link" className="p-0 h-auto text-blue-700 underline" onClick={() => window.location.href = '/auth'}>sign in</Button> to add expenses
                </p>
              </div>
            )}
            <form onSubmit={handleExpenseSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    ₱
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    className="pl-10"
                    disabled={loading || !user}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newExpense.category}
                  onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
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
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Description"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  disabled={loading || !user}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  disabled={loading || !user}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading || !user}>
                {loading ? "Adding..." : "Add Expense"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">Loading expenses...</p>
                </div>
              ) : filteredExpenses.length > 0 ? (
                filteredExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex justify-between items-center p-3 rounded-md bg-red-50 hover:bg-red-100"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-red-100 text-red-800 flex items-center justify-center font-bold">
                        {expense.category.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">{expense.category}</div>
                        <div className="text-sm text-muted-foreground">{expense.description || "No description"}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(expense.date), "MMM d, yyyy")}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-lg font-medium text-red-600">
                        ₱ {Number(expense.amount).toFixed(2)}
                      </div>
                      {user && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="text-red-500 hover:text-red-700"
                          disabled={loading}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : !user ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">Sign in to view and track your expenses</p>
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => window.location.href = '/auth'}
                  >
                    Sign In
                  </Button>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No expenses found for the selected time period</p>
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => setTimeFrame("monthly")}
                  >
                    View All Expenses
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

export default ExpenseTracker;
