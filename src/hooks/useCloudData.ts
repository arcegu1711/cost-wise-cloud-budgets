
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cloudService } from '@/services/cloud-integration';
import { CostData, ResourceData, BudgetData } from '@/types/cloud-providers';
import { useCloudConnections } from './useCloudConnections';

export const useCloudData = () => {
  const { getConnectedProviders } = useCloudConnections();
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Query for cost data
  const { data: costData, isLoading: costLoading, error: costError } = useQuery({
    queryKey: ['cloudCosts', dateRange.startDate, dateRange.endDate, getConnectedProviders()],
    queryFn: () => cloudService.getAllCostData(dateRange.startDate, dateRange.endDate),
    enabled: getConnectedProviders().length > 0,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  // Query for resources
  const { data: resourcesData, isLoading: resourcesLoading, error: resourcesError } = useQuery({
    queryKey: ['cloudResources', getConnectedProviders()],
    queryFn: () => cloudService.getAllResources(),
    enabled: getConnectedProviders().length > 0,
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });

  // Query for budgets
  const { data: budgetsData, isLoading: budgetsLoading, error: budgetsError } = useQuery({
    queryKey: ['cloudBudgets', getConnectedProviders()],
    queryFn: () => cloudService.getAllBudgets(),
    enabled: getConnectedProviders().length > 0,
    refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes
  });

  // Calculate totals and metrics
  const totalSpend = Object.values(costData || {})
    .flat()
    .reduce((sum, cost) => sum + cost.amount, 0);

  const totalBudget = (budgetsData || [])
    .reduce((sum, budget) => sum + budget.amount, 0);

  const totalBudgetSpent = (budgetsData || [])
    .reduce((sum, budget) => sum + budget.spent, 0);

  const budgetUtilization = totalBudget > 0 ? (totalBudgetSpent / totalBudget) * 100 : 0;

  const totalResources = (resourcesData || []).length;

  const connectedProviders = getConnectedProviders();

  return {
    // Data
    costData: costData || {},
    resourcesData: resourcesData || [],
    budgetsData: budgetsData || [],
    
    // Loading states
    isLoading: costLoading || resourcesLoading || budgetsLoading,
    costLoading,
    resourcesLoading,
    budgetsLoading,
    
    // Errors
    errors: {
      cost: costError,
      resources: resourcesError,
      budgets: budgetsError
    },
    
    // Calculated metrics
    totalSpend,
    totalBudget,
    totalBudgetSpent,
    budgetUtilization,
    totalResources,
    connectedProviders,
    
    // Date range control
    dateRange,
    setDateRange
  };
};
