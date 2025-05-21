/**
 * Greedy algorithm for budget allocation
 * This algorithm allocates funds to budget categories based on priority
 * 
 * @param totalBudget - The total budget amount available
 * @param categories - Array of categories with their required amounts and priorities
 * @returns Optimized allocation of funds to categories
 */
interface BudgetCategory {
  name: string;
  requiredAmount: number;
  priority: number; // 1 = highest priority
}

interface BudgetAllocation {
  name: string;
  allocatedAmount: number;
  percentAllocated: number;
  fulfilled: boolean;
}

export const optimizeBudget = (totalBudget: number, categories: BudgetCategory[]): BudgetAllocation[] => {
  // Sort categories by priority (highest priority first)
  const sortedCategories = [...categories].sort((a, b) => a.priority - b.priority);
  
  let remainingBudget = totalBudget;
  const allocations: BudgetAllocation[] = [];
  
  // First pass: Allocate to essential categories (high priority)
  sortedCategories.forEach(category => {
    const allocation: BudgetAllocation = {
      name: category.name,
      allocatedAmount: 0,
      percentAllocated: 0,
      fulfilled: false
    };
    
    // If we can fully fund this category, do so
    if (remainingBudget >= category.requiredAmount) {
      allocation.allocatedAmount = category.requiredAmount;
      allocation.percentAllocated = 100;
      allocation.fulfilled = true;
      remainingBudget -= category.requiredAmount;
    } 
    // Otherwise, allocate whatever is left
    else if (remainingBudget > 0) {
      allocation.allocatedAmount = remainingBudget;
      allocation.percentAllocated = (remainingBudget / category.requiredAmount) * 100;
      remainingBudget = 0;
    }
    
    allocations.push(allocation);
  });
  
  return allocations;
};

/**
 * Makes recommendations for budget adjustments
 * 
 * @param allocations - Current budget allocations
 * @param income - Current income
 * @returns Array of recommendation strings
 */
export const makeRecommendations = (
  allocations: BudgetAllocation[], 
  income: number
): string[] => {
  const recommendations: string[] = [];
  
  // Check if any essential categories are underfunded
  const underfundedEssentials = allocations.filter(
    (alloc, index) => index < 3 && !alloc.fulfilled
  );
  
  if (underfundedEssentials.length > 0) {
    recommendations.push(
      "Consider increasing your income or reducing expenses to fully fund essential categories."
    );
    
    underfundedEssentials.forEach(category => {
      recommendations.push(
        `${category.name} is only ${Math.round(category.percentAllocated)}% funded. Try to allocate more to this essential category.`
      );
    });
  }
  
  // If savings rate is low
  const savingsCategory = allocations.find(alloc => alloc.name.toLowerCase().includes('saving'));
  if (savingsCategory && savingsCategory.percentAllocated < 20) {
    recommendations.push(
      "Your savings allocation is below the recommended 20% of your income. Consider increasing your savings rate."
    );
  }
  
  // General recommendation
  if (income > 0 && recommendations.length === 0) {
    recommendations.push(
      "Your budget looks well balanced. Continue to monitor your expenses and adjust as needed."
    );
  }
  
  return recommendations;
};
