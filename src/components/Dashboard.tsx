
import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { 
  BarChart, 
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer 
} from "recharts";
import { 
  ChartLine,
  Calendar,
  DollarSign,
  Calculator,
  Users,
  Target,
  ArrowRight
} from "lucide-react";

type TimeFrame = "daily" | "weekly" | "monthly";

const Dashboard = () => {
  const { userData } = useUser();
  const { user } = useAuth();
  const [timeFrame, setTimeFrame] = useState<TimeFrame>(userData.preferences.defaultView);
  
  // Quick calculator state for guests
  const [amount1, setAmount1] = useState<number>(0);
  const [amount2, setAmount2] = useState<number>(0);
  const [operation, setOperation] = useState<string>("add");
  const [result, setResult] = useState<number | null>(null);

  // Calculate result for quick calculator
  const calculateResult = () => {
    switch(operation) {
      case "add":
        setResult(amount1 + amount2);
        break;
      case "subtract":
        setResult(amount1 - amount2);
        break;
      case "multiply":
        setResult(amount1 * amount2);
        break;
      case "divide":
        setResult(amount2 !== 0 ? amount1 / amount2 : 0);
        break;
      default:
        setResult(0);
    }
  };

  // Calculate totals
  const totalExpenses = userData.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalBudgets = userData.budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const remainingBudget = totalBudgets - totalExpenses;

  // Get expenses for current timeframe
  const getTimeFrameExpenses = () => {
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

    return userData.expenses.filter(expense => new Date(expense.date) >= startDate);
  };

  const timeFrameExpenses = getTimeFrameExpenses();
  const timeFrameTotal = timeFrameExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Category breakdown
  const categoryTotals = timeFrameExpenses.reduce<Record<string, number>>((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});
  
  const categories = Object.keys(categoryTotals);
  const categoryAmounts = categories.map(category => categoryTotals[category]);

  // Chart data - reformatted for Recharts
  const chartData = categories.map(category => ({
    name: category,
    amount: categoryTotals[category]
  }));

  return (
    <div className="space-y-6">
      {/* Welcome Section for All Users */}
      <Card className="border-finance-blue">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome to FinTrack - Your Financial Companion</CardTitle>
          <CardDescription>
            Take control of your finances with our comprehensive budgeting and expense tracking tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col items-center p-4 border rounded-lg">
              <Calculator className="h-8 w-8 text-finance-blue mb-2" />
              <h3 className="text-lg font-medium">Budget Planning</h3>
              <p className="text-sm text-muted-foreground text-center">Create and manage your budget categories</p>
            </div>
            <div className="flex flex-col items-center p-4 border rounded-lg">
              <ChartLine className="h-8 w-8 text-finance-blue mb-2" />
              <h3 className="text-lg font-medium">Expense Tracking</h3>
              <p className="text-sm text-muted-foreground text-center">Record and visualize your spending patterns</p>
            </div>
            <div className="flex flex-col items-center p-4 border rounded-lg">
              <Target className="h-8 w-8 text-finance-blue mb-2" />
              <h3 className="text-lg font-medium">Financial Goals</h3>
              <p className="text-sm text-muted-foreground text-center">Set and achieve your financial objectives</p>
            </div>
          </div>
          
          {!user && (
            <div className="mt-6 flex justify-center">
              <Link to="/auth">
                <Button className="bg-finance-blue hover:bg-blue-700">
                  Create Account to Save Your Data <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Quick Calculator for Guests */}
      {!user && (
        <Card>
          <CardHeader>
            <CardTitle>Try Our Calculator</CardTitle>
            <CardDescription>
              This is a simple calculator to try our features. Create an account to access full features and save your data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount1">First Amount (₱)</Label>
                  <Input 
                    id="amount1" 
                    type="number" 
                    value={amount1}
                    onChange={(e) => setAmount1(Number(e.target.value))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="operation">Operation</Label>
                  <select 
                    id="operation"
                    className="w-full p-2 border rounded"
                    value={operation}
                    onChange={(e) => setOperation(e.target.value)}
                  >
                    <option value="add">Add</option>
                    <option value="subtract">Subtract</option>
                    <option value="multiply">Multiply</option>
                    <option value="divide">Divide</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="amount2">Second Amount (₱)</Label>
                  <Input 
                    id="amount2" 
                    type="number" 
                    value={amount2}
                    onChange={(e) => setAmount2(Number(e.target.value))}
                  />
                </div>
                
                <Button onClick={calculateResult}>Calculate</Button>
              </div>
              
              <div className="flex flex-col items-center justify-center p-6 border rounded-lg">
                <h3 className="text-lg font-medium mb-2">Result:</h3>
                <p className="text-3xl font-bold text-finance-blue">
                  {result !== null ? `₱ ${result.toFixed(2)}` : '—'}
                </p>
                <p className="mt-4 text-sm text-muted-foreground text-center">
                  Create an account to access full budget planning and expense tracking features!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Financial Overview - Show only for logged in users or simplified for guests */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="text-2xl font-bold text-finance-text">Financial Dashboard</h1>
        
        <Tabs value={timeFrame} onValueChange={(value) => setTimeFrame(value as TimeFrame)} className="w-full sm:w-auto mt-4 sm:mt-0">
          <TabsList>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)} Expenses
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-finance-blue">
              ₱ {timeFrameTotal.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {timeFrameExpenses.length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Budget
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-finance-blue">
              ₱ {totalBudgets.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {userData.budgets.length} budget categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Remaining Budget
            </CardTitle>
            <ChartLine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₱ {remainingBudget.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {remainingBudget >= 0 ? 'Under budget' : 'Over budget'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {categories.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={chartData} 
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="amount" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No expense data available for the selected time frame</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Feature Showcase */}
      <Card>
        <CardHeader>
          <CardTitle>Explore Our Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/expenses" className="block">
              <div className="border rounded-lg p-4 h-full hover:bg-slate-50 transition-colors">
                <ChartLine className="h-6 w-6 text-finance-blue mb-2" />
                <h3 className="font-medium">Expense Tracker</h3>
                <p className="text-sm text-muted-foreground">Record and categorize all your expenses</p>
              </div>
            </Link>
            
            <Link to="/budgets" className="block">
              <div className="border rounded-lg p-4 h-full hover:bg-slate-50 transition-colors">
                <DollarSign className="h-6 w-6 text-finance-blue mb-2" />
                <h3 className="font-medium">Budget Planner</h3>
                <p className="text-sm text-muted-foreground">Create and manage your budget categories</p>
              </div>
            </Link>
            
            <div className="border rounded-lg p-4 h-full opacity-70">
              <Target className="h-6 w-6 text-finance-blue mb-2" />
              <h3 className="font-medium">Goal Planning</h3>
              <p className="text-sm text-muted-foreground">Set and track your financial goals</p>
              <p className="text-xs text-muted-foreground mt-2">Coming soon</p>
            </div>
            
            <div className="border rounded-lg p-4 h-full opacity-70">
              <Users className="h-6 w-6 text-finance-blue mb-2" />
              <h3 className="font-medium">Community</h3>
              <p className="text-sm text-muted-foreground">Connect with others on your financial journey</p>
              <p className="text-xs text-muted-foreground mt-2">Coming soon</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
