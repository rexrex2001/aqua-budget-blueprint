
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { UserDataType } from "@/context/UserContext";

// Array of supported currencies
export const currencies = [
  { code: "PHP", symbol: "₱", name: "Philippine Peso" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
];

// Update username in Supabase
export const updateUserProfile = async (userId: string, username: string) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ username })
      .eq('id', userId);
      
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Error updating profile" };
  }
};

// Calculate user statistics
export const calculateUserStats = (userData: UserDataType) => {
  const totalExpenses = userData.expenses.length;
  const totalBudgets = userData.budgets.length;
  const totalSpent = userData.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  return { totalExpenses, totalBudgets, totalSpent };
};

// Export user data to JSON file
export const exportUserData = (userData: UserDataType) => {
  const dataStr = JSON.stringify(userData);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = 'fintrack-data.json';
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
  
  toast.success("Data exported successfully");
};
