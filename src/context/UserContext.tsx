
import React, { createContext, useContext, useState, useEffect } from "react";

export type ExpenseType = {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  isProjected?: boolean;
};

export type BudgetType = {
  id: string;
  category: string;
  amount: number;
  period: "daily" | "weekly" | "monthly";
};

export type UserDataType = {
  name: string;
  email: string;
  expenses: ExpenseType[];
  budgets: BudgetType[];
  preferences: {
    currency: string;
    defaultView: "daily" | "weekly" | "monthly";
  };
};

type UserContextType = {
  userData: UserDataType;
  setUserData: React.Dispatch<React.SetStateAction<UserDataType>>;
  addExpense: (expense: Omit<ExpenseType, "id" | "isProjected">) => void;
  deleteExpense: (id: string) => void;
  addBudget: (budget: Omit<BudgetType, "id">) => void;
  deleteBudget: (id: string) => void;
  updateUserProfile: (name: string, email: string, preferences: UserDataType["preferences"]) => void;
};

const defaultUserData: UserDataType = {
  name: "Guest User",
  email: "guest@example.com",
  expenses: [],
  budgets: [],
  preferences: {
    currency: "₱", // Fixed to Philippine Peso
    defaultView: "monthly",
  },
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userData, setUserData] = useState<UserDataType>(defaultUserData);

  // Remove localStorage usage - all data will come from Supabase
  const addExpense = (expense: Omit<ExpenseType, "id" | "isProjected">) => {
    const newExpense = {
      ...expense,
      id: Date.now().toString(),
      isProjected: false,
    };
    setUserData((prev) => ({
      ...prev,
      expenses: [...prev.expenses, newExpense],
    }));
  };

  const deleteExpense = (id: string) => {
    setUserData((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((expense) => expense.id !== id),
    }));
  };

  const addBudget = (budget: Omit<BudgetType, "id">) => {
    const newBudget = {
      ...budget,
      id: Date.now().toString(),
    };
    setUserData((prev) => ({
      ...prev,
      budgets: [...prev.budgets, newBudget],
    }));
  };

  const deleteBudget = (id: string) => {
    setUserData((prev) => ({
      ...prev,
      budgets: prev.budgets.filter((budget) => budget.id !== id),
    }));
  };

  const updateUserProfile = (name: string, email: string, preferences: UserDataType["preferences"]) => {
    setUserData((prev) => ({
      ...prev,
      name,
      email,
      preferences: {
        ...preferences,
        currency: "₱", // Always force PHP currency
      },
    }));
  };

  return (
    <UserContext.Provider
      value={{
        userData,
        setUserData,
        addExpense,
        deleteExpense,
        addBudget,
        deleteBudget,
        updateUserProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
