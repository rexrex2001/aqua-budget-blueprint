
/**
 * Utility functions for financial projections using greedy algorithms
 * This implements a greedy approach to forecast future expenses and budget utilization
 */

import { ExpenseType, BudgetType } from "@/context/UserContext";
import { addDays, addWeeks, addMonths, format, differenceInDays } from "date-fns";

/**
 * Calculate projection for future expenses using a greedy algorithm
 * @param expenses - Current expenses
 * @param days - Number of days to project
 * @param period - Period type for projection
 * @returns Projected expenses array
 */
export const calculateExpenseProjection = (
  expenses: ExpenseType[],
  days: number = 90, // Default to 3 months
  period: "daily" | "weekly" | "monthly" = "monthly"
) => {
  if (!expenses.length) return [];

  // Group expenses by category
  const expensesByCategory = expenses.reduce<Record<string, ExpenseType[]>>((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = [];
    }
    acc[expense.category].push(expense);
    return acc;
  }, {});

  // Calculate frequency and average amount by category using greedy approach
  const categoryMetrics = Object.entries(expensesByCategory).map(([category, items]) => {
    // Sort expenses by date (newest first)
    const sortedItems = [...items].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Calculate average amount
    const avgAmount = items.reduce((sum, item) => sum + item.amount, 0) / items.length;

    // Calculate average frequency in days (greedy)
    let totalDays = 0;
    let occurrences = 0;

    // If more than one expense in category
    if (sortedItems.length > 1) {
      for (let i = 0; i < sortedItems.length - 1; i++) {
        const daysDiff = differenceInDays(
          new Date(sortedItems[i].date),
          new Date(sortedItems[i + 1].date)
        );
        if (daysDiff > 0) {
          totalDays += daysDiff;
          occurrences++;
        }
      }
    }

    // Default frequency based on period if not enough data
    const defaultFrequency = period === "daily" ? 1 : period === "weekly" ? 7 : 30;
    const frequency = occurrences > 0 ? Math.max(1, Math.round(totalDays / occurrences)) : defaultFrequency;

    return {
      category,
      avgAmount,
      frequency, // in days
      lastDate: sortedItems[0]?.date || new Date().toISOString()
    };
  });

  // Generate projected expenses (greedy algorithm)
  const projectedExpenses = [];
  const today = new Date();

  for (const metric of categoryMetrics) {
    let nextDate = new Date(metric.lastDate);
    
    // Project into the future
    while (differenceInDays(nextDate, today) < days) {
      nextDate = addDays(nextDate, metric.frequency);
      
      // Only add future expenses
      if (nextDate > today) {
        projectedExpenses.push({
          id: `projection-${metric.category}-${nextDate.getTime()}`,
          category: metric.category,
          amount: Math.round(metric.avgAmount * 100) / 100,
          description: `Projected ${metric.category}`,
          date: format(nextDate, "yyyy-MM-dd"),
          isProjected: true
        });
      }
    }
  }

  // Sort projected expenses by date
  return projectedExpenses.sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
};

/**
 * Calculate budget utilization projection using a greedy algorithm
 * @param budgets - Current budgets
 * @param expenses - Current expenses
 * @param projectedExpenses - Projected expenses
 * @returns Projected budget utilization
 */
export const calculateBudgetProjection = (
  budgets: BudgetType[],
  expenses: ExpenseType[],
  projectedExpenses: any[]
) => {
  if (!budgets.length) return [];
  
  const projections = budgets.map(budget => {
    // Filter expenses for this budget category and period
    const relevantExpenses = expenses.filter(expense => {
      return expense.category === budget.category;
    });
    
    // Calculate current budget utilization
    const currentUtilization = relevantExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Calculate projected utilization by adding projected expenses
    const relevantProjections = projectedExpenses.filter(expense => {
      return expense.category === budget.category;
    });
    
    // Group projections by period
    const projectionsByPeriod = [];
    let accumulatedAmount = currentUtilization;
    
    // For each time period, calculate cumulative projection
    if (budget.period === "monthly") {
      // Group by month
      const months: Record<string, number> = {};
      
      for (const projection of relevantProjections) {
        const date = new Date(projection.date);
        const monthKey = format(date, "yyyy-MM");
        
        if (!months[monthKey]) {
          months[monthKey] = 0;
        }
        months[monthKey] += projection.amount;
      }
      
      // Create projection entries for each month
      Object.entries(months).forEach(([month, amount]) => {
        accumulatedAmount += amount;
        const percentage = Math.min(Math.round((accumulatedAmount / budget.amount) * 100), 100);
        
        projectionsByPeriod.push({
          period: month,
          amount: accumulatedAmount,
          percentage,
          label: format(new Date(month + "-01"), "MMMM yyyy")
        });
      });
    } else if (budget.period === "weekly") {
      // Group by week
      const weeks: Record<string, number> = {};
      const now = new Date();
      
      for (const projection of relevantProjections) {
        const date = new Date(projection.date);
        const weekDiff = Math.floor(differenceInDays(date, now) / 7);
        const weekKey = `week-${weekDiff}`;
        
        if (!weeks[weekKey]) {
          weeks[weekKey] = 0;
        }
        weeks[weekKey] += projection.amount;
      }
      
      // Create projection entries for each week
      Object.entries(weeks).forEach(([weekKey, amount], index) => {
        accumulatedAmount += amount;
        const percentage = Math.min(Math.round((accumulatedAmount / budget.amount) * 100), 100);
        const weekNumber = parseInt(weekKey.split('-')[1]);
        
        projectionsByPeriod.push({
          period: weekKey,
          amount: accumulatedAmount,
          percentage,
          label: `Week ${Math.abs(weekNumber) + 1}`
        });
      });
    } else {
      // Daily projections
      const days: Record<string, number> = {};
      
      for (const projection of relevantProjections) {
        const dayKey = projection.date;
        
        if (!days[dayKey]) {
          days[dayKey] = 0;
        }
        days[dayKey] += projection.amount;
      }
      
      // Create projection entries for each day
      Object.entries(days).forEach(([day, amount]) => {
        accumulatedAmount += amount;
        const percentage = Math.min(Math.round((accumulatedAmount / budget.amount) * 100), 100);
        
        projectionsByPeriod.push({
          period: day,
          amount: accumulatedAmount,
          percentage,
          label: format(new Date(day), "MMM dd, yyyy")
        });
      });
    }
    
    return {
      id: budget.id,
      category: budget.category,
      amount: budget.amount,
      period: budget.period,
      currentUtilization,
      projections: projectionsByPeriod
    };
  });
  
  return projections;
};
