
import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Chart,
  ChartConfiguration,
  LineElement,
  BarElement,
  PointElement,
  BarController,
  LineController,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "@/components/ui/chart";
import { 
  ChartLine,
  Calendar,
  DollarSign 
} from "lucide-react";

Chart.register(
  LineElement,
  BarElement,
  PointElement,
  BarController,
  LineController,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

type TimeFrame = "daily" | "weekly" | "monthly";

const Dashboard = () => {
  const { userData } = useUser();
  const [timeFrame, setTimeFrame] = useState<TimeFrame>(userData.preferences.defaultView);

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

  // Chart data
  const chartData: ChartConfiguration = {
    type: 'bar',
    data: {
      labels: categories.length > 0 ? categories : ['No Data'],
      datasets: [
        {
          label: 'Expenses by Category',
          data: categoryAmounts.length > 0 ? categoryAmounts : [0],
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: '#3B82F6',
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  };

  return (
    <div className="space-y-6">
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
              {userData.preferences.currency} {timeFrameTotal.toFixed(2)}
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
              {userData.preferences.currency} {totalBudgets.toFixed(2)}
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
              {userData.preferences.currency} {remainingBudget.toFixed(2)}
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
              <Chart {...chartData} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No expense data available for the selected time frame</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
