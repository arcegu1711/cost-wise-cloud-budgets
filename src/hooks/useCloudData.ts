
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabaseCloudService } from '@/services/supabase-cloud-service';
import { CostData, ResourceData, BudgetData } from '@/types/cloud-providers';
import { useCloudConnections } from './useCloudConnections';
import { useCloudSync } from './useCloudSync';
import { correlateResourceCosts } from '@/utils/costCorrelation';
import { calculateCloudMetrics } from '@/utils/cloudMetrics';

export const useCloudData = () => {
  const { getConnectedProviders } = useCloudConnections();
  
  // Use Azure's billing period: June 1-30, 2025
  const [dateRange, setDateRange] = useState({
    startDate: '2025-06-01',
    endDate: '2025-06-30'
  });

  console.log('useCloudData initialized with Azure billing period:', dateRange);

  // Query para dados de custo do banco de dados
  const { data: costData, isLoading: costLoading, error: costError, refetch: refetchCosts } = useQuery({
    queryKey: ['cloudCosts', getConnectedProviders()],
    queryFn: () => supabaseCloudService.getCostData(),
    enabled: getConnectedProviders().length > 0,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  // Query para recursos do banco de dados
  const { data: rawResourcesData, isLoading: resourcesLoading, error: resourcesError, refetch: refetchResources } = useQuery({
    queryKey: ['cloudResources', getConnectedProviders()],
    queryFn: () => supabaseCloudService.getResources(),
    enabled: getConnectedProviders().length > 0,
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });

  // Query para orçamentos do banco de dados
  const { data: budgetsData, isLoading: budgetsLoading, error: budgetsError, refetch: refetchBudgets } = useQuery({
    queryKey: ['cloudBudgets', getConnectedProviders()],
    queryFn: () => supabaseCloudService.getBudgets(),
    enabled: getConnectedProviders().length > 0,
    refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes
  });

  // Correlate costs with resources
  const resourcesData = correlateResourceCosts(rawResourcesData || [], costData || {});

  // Cloud sync functionality
  const { syncCloudData, syncInProgress } = useCloudSync(dateRange, {
    refetchCosts,
    refetchResources,
    refetchBudgets
  });

  // Calculate metrics
  const metrics = calculateCloudMetrics(costData, resourcesData, budgetsData || []);
  const connectedProviders = getConnectedProviders();

  // Enhanced logging for debugging cost correlation
  useEffect(() => {
    if (costData && resourcesData.length > 0) {
      console.log('=== COST CORRELATION DEBUG ===');
      console.log('Available cost data by provider:', Object.keys(costData));
      
      Object.entries(costData).forEach(([provider, costs]) => {
        console.log(`${provider} costs:`, costs.map(c => `${c.service} (${c.region}): ${c.amount}`));
      });
      
      console.log('Resources with costs assigned:');
      const resourcesWithCosts = resourcesData.filter(r => r.cost && r.cost > 0);
      resourcesWithCosts.forEach(r => {
        console.log(`- ${r.name} (${r.type}): R$ ${r.cost}`);
      });
      
      console.log(`Total: ${resourcesWithCosts.length}/${resourcesData.length} resources have costs assigned`);
      console.log('=== END DEBUG ===');
    }
  }, [costData, resourcesData]);

  return {
    // Data
    costData: costData || {},
    resourcesData,
    budgetsData: budgetsData || [],
    
    // Loading states
    isLoading: costLoading || resourcesLoading || budgetsLoading || syncInProgress,
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
    ...metrics,
    connectedProviders,
    
    // Date range control
    dateRange,
    setDateRange,
    
    // Manual sync function
    syncCloudData
  };
};
