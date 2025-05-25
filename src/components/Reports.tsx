
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  type: 'expense';
};

type BudgetData = {
  id: string;
  category: string;
  amount: number;
  period: string;
  created_at: string;
  type: 'income';
};

type FinancialRecord = ExpenseData | BudgetData;

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
      setExpenses((data || []).map(item => ({ ...item, type: 'expense' as const })));
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
      setBudgets((data || []).map(item => ({ ...item, type: 'income' as const })));
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
  const demoExpenses: ExpenseData[] = [
    { id: '1', amount: 500, category: 'Food & Dining', description: 'Lunch at restaurant', date: '2024-01-15', created_at: '2024-01-15T12:00:00Z', type: 'expense' },
    { id: '2', amount: 1200, category: 'Transportation', description: 'Taxi fare', date: '2024-01-14', created_at: '2024-01-14T10:00:00Z', type: 'expense' },
    { id: '3', amount: 800, category: 'Shopping', description: 'Grocery shopping', date: '2024-01-13', created_at: '2024-01-13T16:00:00Z', type: 'expense' },
  ];

  const demoBudgets: BudgetData[] = [
    { id: '1', category: 'Food & Dining', amount: 5000, period: 'monthly', created_at: '2024-01-01T00:00:00Z', type: 'income' },
    { id: '2', category: 'Transportation', amount: 3000, period: 'monthly', created_at: '2024-01-01T00:00:00Z', type: 'income' },
    { id: '3', category: 'Shopping', amount: 4000, period: 'monthly', created_at: '2024-01-01T00:00:00Z', type: 'income' },
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

  // Merge and sort financial history by date
  const getFinancialHistory = (): FinancialRecord[] => {
    const allRecords: FinancialRecord[] = [...displayExpenses, ...displayBudgets];
    return allRecords.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };

  const financialHistory = getFinancialHistory();

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
              <SelectItem value="budgets">Income</SelectItem>
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
              Total Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₱ {displayBudgets.reduce((sum, budget) => sum + Number(budget.amount), 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {displayBudgets.length} income sources
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
              Income - Expenses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Card>
        <CardHeader>
          <CardTitle>
            {dataType === "expenses" ? "Expenses" : "Income"} by Category
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
                  <Tooltip formatter={(value) => [`₱${Number(value).toFixed(2)}`, dataType === "expenses" ? "Amount" : "Income"]} />
                </PieChart>
              ) : (
                <BarChart data={displayChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₱${Number(value).toFixed(2)}`, dataType === "expenses" ? "Amount" : "Income"]} />
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

      {/* Financial History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-blue-800">Financial History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {financialHistory.slice(0, 10).map((record) => (
              <div 
                key={record.id} 
                className={`flex justify-between items-center p-3 rounded-lg ${
                  record.type === 'expense' ? 'bg-red-50' : 'bg-green-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${
                    record.type === 'expense' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {record.category.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium">{record.category}</div>
                    <div className="text-sm text-muted-foreground">
                      {record.type === 'expense' 
                        ? (record as ExpenseData).description || "No description"
                        : `Income source - ${(record as BudgetData).period || "No period"}`
                      }
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Added: {format(new Date(record.created_at), "MMM d, yyyy")}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    record.type === 'expense'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {record.type === 'expense' ? 'Expense' : 'Income'}
                  </span>
                  <div className={`font-semibold ${
                    record.type === 'expense' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {record.type === 'expense' ? '-' : '+'}₱{Number(record.amount).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
            {financialHistory.length === 0 && (
              <p className="text-muted-foreground text-center py-4">No financial records found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
