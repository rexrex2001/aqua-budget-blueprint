
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

type ExpenseData = {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  created_at: string;
};

type BudgetData = {
  id: string;
  category: string;
  amount: number;
  period: string;
  created_at: string;
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const Reports = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<ExpenseData[]>([]);
  const [budgets, setBudgets] = useState<BudgetData[]>([]);
  const [loading, setLoading] = useState(false);
  const [chartType, setChartType] = useState<"pie" | "bar">("pie");
  const [dataType, setDataType] = useState<"expenses" | "budgets">("expenses");

  // Fetch expenses from Supabase
  const fetchExpenses = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast.error('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  // Fetch budgets from Supabase
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

  useEffect(() => {
    if (user) {
      fetchExpenses();
      fetchBudgets();
    }
  }, [user]);

  // Process data for charts
  const processChartData = () => {
    const currentData = dataType === "expenses" ? expenses : budgets;
    const categoryTotals: Record<string, number> = {};

    currentData.forEach(item => {
      categoryTotals[item.category] = (categoryTotals[item.category] || 0) + Number(item.amount);
    });

    return Object.entries(categoryTotals).map(([category, amount]) => ({
      name: category,
      value: amount,
      amount: amount
    }));
  };

  const chartData = processChartData();

  // Demo data for guests
  const demoExpenses = [
    { id: '1', amount: 500, category: 'Food & Dining', description: 'Lunch at restaurant', date: '2024-01-15', created_at: '2024-01-15T12:00:00Z' },
    { id: '2', amount: 1200, category: 'Transportation', description: 'Taxi fare', date: '2024-01-14', created_at: '2024-01-14T10:00:00Z' },
    { id: '3', amount: 800, category: 'Shopping', description: 'Grocery shopping', date: '2024-01-13', created_at: '2024-01-13T16:00:00Z' },
  ];

  const demoBudgets = [
    { id: '1', category: 'Food & Dining', amount: 5000, period: 'monthly', created_at: '2024-01-01T00:00:00Z' },
    { id: '2', category: 'Transportation', amount: 3000, period: 'monthly', created_at: '2024-01-01T00:00:00Z' },
    { id: '3', category: 'Shopping', amount: 4000, period: 'monthly', created_at: '2024-01-01T00:00:00Z' },
  ];

  const displayExpenses = user ? expenses : demoExpenses;
  const displayBudgets = user ? budgets : demoBudgets;
  const displayData = dataType === "expenses" ? displayExpenses : displayBudgets;

  const processDemoChartData = () => {
    const categoryTotals: Record<string, number> = {};

    displayData.forEach(item => {
      categoryTotals[item.category] = (categoryTotals[item.category] || 0) + Number(item.amount);
    });

    return Object.entries(categoryTotals).map(([category, amount]) => ({
      name: category,
      value: amount,
      amount: amount
    }));
  };

  const displayChartData = user ? chartData : processDemoChartData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="text-2xl font-bold text-blue-800">Financial Reports</h1>
        
        <div className="flex gap-2 items-center mt-4 sm:mt-0">
          <Select value={dataType} onValueChange={(value: "expenses" | "budgets") => setDataType(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="expenses">Expenses</SelectItem>
              <SelectItem value="budgets">Budgets</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={chartType} onValueChange={(value: "pie" | "bar") => setChartType(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pie">Pie Chart</SelectItem>
              <SelectItem value="bar">Bar Chart</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {!user && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2 text-blue-800">Demo Mode</h3>
              <p className="text-blue-700 mb-4">
                You're viewing demo data. <Button variant="link" className="p-0 h-auto text-blue-700 underline" onClick={() => window.location.href = '/auth'}>Sign in</Button> to view your actual financial reports.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ₱ {displayExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {displayExpenses.length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Budgets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₱ {displayBudgets.reduce((sum, budget) => sum + Number(budget.amount), 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {displayBudgets.length} budget categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              displayBudgets.reduce((sum, budget) => sum + Number(budget.amount), 0) - 
              displayExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0) >= 0 
                ? 'text-green-600' : 'text-red-600'
            }`}>
              ₱ {(
                displayBudgets.reduce((sum, budget) => sum + Number(budget.amount), 0) - 
                displayExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0)
              ).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Budget - Expenses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Card>
        <CardHeader>
          <CardTitle>
            {dataType === "expenses" ? "Expenses" : "Budgets"} by Category
          </CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          {displayChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "pie" ? (
                <PieChart>
                  <Pie
                    data={displayChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {displayChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`₱${Number(value).toFixed(2)}`, dataType === "expenses" ? "Amount" : "Budget"]} />
                </PieChart>
              ) : (
                <BarChart data={displayChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₱${Number(value).toFixed(2)}`, dataType === "expenses" ? "Amount" : "Budget"]} />
                  <Legend />
                  <Bar dataKey="amount" fill={dataType === "expenses" ? "#ef4444" : "#10b981"} />
                </BarChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">
                No {dataType} data available
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Recent Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {displayExpenses.slice(0, 5).map((expense) => (
                <div key={expense.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <div>
                    <div className="font-medium">{expense.category}</div>
                    <div className="text-sm text-muted-foreground">{expense.description}</div>
                    <div className="text-xs text-muted-foreground">
                      Added: {format(new Date(expense.created_at), "MMM d, yyyy")}
                    </div>
                  </div>
                  <div className="text-red-600 font-semibold">
                    ₱{Number(expense.amount).toFixed(2)}
                  </div>
                </div>
              ))}
              {displayExpenses.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No expenses recorded</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Recent Budgets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {displayBudgets.slice(0, 5).map((budget) => (
                <div key={budget.id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div>
                    <div className="font-medium">{budget.category}</div>
                    <div className="text-sm text-muted-foreground">{budget.period}</div>
                    <div className="text-xs text-muted-foreground">
                      Added: {format(new Date(budget.created_at), "MMM d, yyyy")}
                    </div>
                  </div>
                  <div className="text-green-600 font-semibold">
                    ₱{Number(budget.amount).toFixed(2)}
                  </div>
                </div>
              ))}
              {displayBudgets.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No budgets created</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
