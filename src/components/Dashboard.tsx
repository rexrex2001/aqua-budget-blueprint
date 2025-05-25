
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useExpenses } from "@/hooks/useExpenses";
import { useBudgets } from "@/hooks/useBudgets";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { format } from "date-fns";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const Dashboard = () => {
  const { user } = useAuth();
  const { expenses } = useExpenses();
  const { budgets } = useBudgets();

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

  // Use actual data for authenticated users, demo data for guests
  const displayExpenses = user ? expenses : demoExpenses;
  const displayBudgets = user ? budgets : demoBudgets;

  // Calculate totals
  const totalExpenses = displayExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const totalBudget = displayBudgets.reduce((sum, budget) => sum + Number(budget.amount), 0);
  const remainingBudget = totalBudget - totalExpenses;

  // Process data for expense chart
  const expenseData = displayExpenses.reduce((acc: Record<string, number>, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + Number(expense.amount);
    return acc;
  }, {});

  const chartData = Object.entries(expenseData).map(([category, amount]) => ({
    name: category,
    value: amount,
  }));

  // Process budget vs expense comparison
  const budgetComparisonData = displayBudgets.map(budget => {
    const spent = displayExpenses
      .filter(expense => expense.category === budget.category)
      .reduce((sum, expense) => sum + Number(expense.amount), 0);
    
    return {
      category: budget.category,
      budget: Number(budget.amount),
      spent: spent,
      remaining: Number(budget.amount) - spent,
    };
  });

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-blue-800 mb-4">
          Welcome to Your Financial Dashboard
        </h1>
        <p className="text-lg text-blue-600 mb-6">
          Take control of your finances with our comprehensive budgeting tools
        </p>
        {!user && (
          <Card className="max-w-2xl mx-auto border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2 text-blue-800">Get Started Today</h3>
                <p className="text-blue-700 mb-4">
                  Sign up to start tracking your expenses, managing budgets, and achieving your financial goals.
                </p>
                <Button 
                  onClick={() => window.location.href = '/auth'}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Sign Up Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₱{totalBudget.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From {displayBudgets.length} sources
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ₱{totalExpenses.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From {displayExpenses.length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Remaining Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₱{remainingBudget.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {remainingBudget >= 0 ? 'Available to spend' : 'Over budget'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Savings Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totalBudget > 0 ? ((remainingBudget / totalBudget) * 100).toFixed(1) : '0.0'}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Of total income
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`₱${Number(value).toFixed(2)}`, 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No expense data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget vs Spending</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {budgetComparisonData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="category" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₱${Number(value).toFixed(2)}`, '']} />
                  <Bar dataKey="budget" fill="#10b981" name="Budget" />
                  <Bar dataKey="spent" fill="#ef4444" name="Spent" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No budget data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
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
                      {format(new Date(expense.created_at), "MMM d, yyyy")}
                    </div>
                  </div>
                  <div className="text-red-600 font-semibold">
                    -₱{Number(expense.amount).toFixed(2)}
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
            <CardTitle className="text-green-600">Income Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {displayBudgets.slice(0, 5).map((budget) => (
                <div key={budget.id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div>
                    <div className="font-medium">{budget.category}</div>
                    <div className="text-sm text-muted-foreground">{budget.period}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(budget.created_at), "MMM d, yyyy")}
                    </div>
                  </div>
                  <div className="text-green-600 font-semibold">
                    +₱{Number(budget.amount).toFixed(2)}
                  </div>
                </div>
              ))}
              {displayBudgets.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No income sources added</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => window.location.href = '/expenses'}
              className="h-20 text-lg"
              variant="outline"
            >
              Add Expense
            </Button>
            <Button 
              onClick={() => window.location.href = '/budgets'}
              className="h-20 text-lg"
              variant="outline"
            >
              Manage Income
            </Button>
            <Button 
              onClick={() => window.location.href = '/reports'}
              className="h-20 text-lg"
              variant="outline"
            >
              View Reports
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
