
import { CostData, ResourceData, BudgetData } from '@/types/cloud-providers';

export interface CloudMetrics {
  totalSpend: number;
  totalBudget: number;
  totalBudgetSpent: number;
  budgetUtilization: number;
  totalResources: number;
  totalResourcesCost: number;
}

export const calculateCloudMetrics = (
  costData: Record<string, CostData[]> | null,
  resourcesData: ResourceData[],
  budgetsData: BudgetData[]
): CloudMetrics => {
  // Calculate total spend from cost data - this should be the actual costs from billing
  const totalSpend = costData ? 
    Object.values(costData).flat().reduce((sum, cost) => sum + cost.amount, 0) : 0;

  // Calculate total resources cost - this is from resource correlation
  const totalResourcesCost = resourcesData.reduce((sum, resource) => sum + (resource.cost || 0), 0);

  const totalBudget = budgetsData.reduce((sum, budget) => sum + budget.amount, 0);
  const totalBudgetSpent = budgetsData.reduce((sum, budget) => sum + budget.spent, 0);
  const budgetUtilization = totalBudget > 0 ? (totalBudgetSpent / totalBudget) * 100 : 0;
  const totalResources = resourcesData.length;

  console.log('=== CLOUD METRICS CALCULATION ===');
  console.log('Cost data available:', !!costData);
  console.log('Raw cost data total:', totalSpend);
  console.log('Resources with cost total:', totalResourcesCost);
  console.log('Total resources:', totalResources);
  console.log('Budget data:', { totalBudget, totalBudgetSpent, budgetUtilization });
  console.log('=== END METRICS ===');

  return {
    totalSpend,
    totalBudget,
    totalBudgetSpent,
    budgetUtilization,
    totalResources,
    totalResourcesCost
  };
};
