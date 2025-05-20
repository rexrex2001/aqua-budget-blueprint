
import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const currencies = [
  { code: "PHP", symbol: "₱", name: "Philippine Peso" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
];

const UserProfile = () => {
  const { userData, updateUserProfile } = useUser();
  const { user } = useAuth();
  
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: userData.name,
    email: user?.email || userData.email,
    currency: userData.preferences.currency,
    defaultView: userData.preferences.defaultView,
  });

  useEffect(() => {
    setFormData({
      name: userData.name,
      email: user?.email || userData.email,
      currency: userData.preferences.currency,
      defaultView: userData.preferences.defaultView,
    });
    
    // Fetch username from profiles if we have an authenticated user
    if (user) {
      fetchUserProfile();
    }
  }, [userData, user]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user?.id)
        .single();
        
      if (error) {
        throw error;
      }
      
      if (data) {
        setUsername(data.username);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast.error("Name and email are required");
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    // Update local storage user data
    updateUserProfile(
      formData.name,
      formData.email, 
      {
        currency: formData.currency,
        defaultView: formData.defaultView as "daily" | "weekly" | "monthly",
      }
    );
    
    // If authenticated, update profile in database
    if (user) {
      try {
        setLoading(true);
        const { error } = await supabase
          .from('profiles')
          .update({ username: username })
          .eq('id', user.id);
          
        if (error) throw error;
      } catch (error: any) {
        toast.error(error.message || "Error updating profile");
        return;
      } finally {
        setLoading(false);
      }
    }

    toast.success("Profile updated successfully");
  };

  // Calculate some user stats
  const totalExpenses = userData.expenses.length;
  const totalBudgets = userData.budgets.length;
  const totalSpent = userData.expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-finance-text">User Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {user && (
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={user !== null || loading}
                  />
                  {user && (
                    <p className="text-sm text-muted-foreground">
                      Email cannot be changed when authenticated with Supabase
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Preferred Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.symbol} - {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defaultView">Default Time Period</Label>
                  <Select
                    value={formData.defaultView}
                    onValueChange={(value) => setFormData({ ...formData, defaultView: value as "daily" | "weekly" | "monthly" })}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select default view" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Your financial data is stored locally on your device. You can export or reset your data if needed.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="outline" onClick={() => {
                    const dataStr = JSON.stringify(userData);
                    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                    
                    const exportFileDefaultName = 'fintrack-data.json';
                    
                    const linkElement = document.createElement('a');
                    linkElement.setAttribute('href', dataUri);
                    linkElement.setAttribute('download', exportFileDefaultName);
                    linkElement.click();
                    
                    toast.success("Data exported successfully");
                  }}>
                    Export Data
                  </Button>
                  
                  <Button variant="destructive" onClick={() => {
                    if (confirm("Are you sure you want to reset all your data? This cannot be undone.")) {
                      localStorage.removeItem("financeUserData");
                      window.location.reload();
                    }
                  }}>
                    Reset All Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
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
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
