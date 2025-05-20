
import { useUser } from "@/context/UserContext";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateUserStats } from "@/utils/profileUtils";

const AccountSummary = () => {
  const { userData } = useUser();
  const { user } = useAuth();
  
  const { totalExpenses, totalBudgets, totalSpent } = calculateUserStats(userData);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="text-sm text-muted-foreground">Total Expenses</div>
            <div className="text-2xl font-bold">{totalExpenses}</div>
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground">Total Budgets</div>
            <div className="text-2xl font-bold">{totalBudgets}</div>
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground">Total Spent</div>
            <div className="text-2xl font-bold text-finance-blue">
              ₱ {totalSpent.toFixed(2)}
            </div>
          </div>

          {user && (
            <div className="mt-4 pt-4 border-t">
              <div className="text-sm text-muted-foreground">Authenticated as</div>
              <div className="text-md font-medium">{user.email}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountSummary;
