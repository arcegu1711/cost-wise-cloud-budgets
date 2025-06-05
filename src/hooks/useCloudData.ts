import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cloudService } from '@/services/cloud-integration';
import { supabaseCloudService } from '@/services/supabase-cloud-service';
import { CostData, ResourceData, BudgetData } from '@/types/cloud-providers';
import { useCloudConnections } from './useCloudConnections';
import { useToast } from '@/hooks/use-toast';

export const useCloudData = () => {
  const { getConnectedProviders } = useCloudConnections();
  const { toast } = useToast();
  
  // Use Azure's billing period: June 1-30, 2025
  const [dateRange, setDateRange] = useState({
    startDate: '2025-06-01',
    endDate: '2025-06-30'
  });
  const [syncInProgress, setSyncInProgress] = useState(false);

  console.log('useCloudData initialized with Azure billing period:', dateRange);

  // Query para dados de custo do banco de dados
  const { data: costData, isLoading: costLoading, error: costError, refetch: refetchCosts } = useQuery({
    queryKey: ['cloudCosts', getConnectedProviders()],
    queryFn: () => supabaseCloudService.getCostData(),
    enabled: getConnectedProviders().length > 0,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  // Query para recursos do banco de dados
  const { data: resourcesData, isLoading: resourcesLoading, error: resourcesError, refetch: refetchResources } = useQuery({
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

  // Função para sincronizar dados dos provedores com o banco
  const syncCloudData = async () => {
    const connectedProviders = getConnectedProviders();
    if (connectedProviders.length === 0 || syncInProgress) return;

    setSyncInProgress(true);
    
    try {
      console.log('Iniciando sincronização dos dados dos provedores para período de cobrança Azure:', dateRange);
      
      // Busca dados atualizados dos provedores usando backend service
      const [newCostData, newResourcesData, newBudgetsData] = await Promise.all([
        cloudService.getAllCostData(dateRange.startDate, dateRange.endDate),
        cloudService.getAllResources(),
        cloudService.getAllBudgets()
      ]);

      console.log('Dados obtidos dos provedores para período Azure:', {
        costData: newCostData,
        resourcesData: newResourcesData,
        budgetsData: newBudgetsData,
        period: `${dateRange.startDate} to ${dateRange.endDate}`
      });

      // Salva os dados no banco
      await Promise.all([
        ...Object.entries(newCostData).map(([provider, costs]) => {
          console.log(`Salvando ${costs.length} registros de custo para ${provider} (período Azure)`);
          return supabaseCloudService.saveCostData(provider, costs);
        }),
        ...connectedProviders.map(provider => {
          const providerResources = newResourcesData.filter(r => r.provider === provider);
          console.log(`Salvando ${providerResources.length} recursos para ${provider}`);
          return supabaseCloudService.saveResources(provider, providerResources);
        }),
        ...connectedProviders.map(provider => {
          const providerBudgets = newBudgetsData.filter(b => b.provider === provider);
          console.log(`Salvando ${providerBudgets.length} orçamentos para ${provider}`);
          return supabaseCloudService.saveBudgets(provider, providerBudgets);
        })
      ]);

      // Refetch das queries para atualizar os dados na UI
      await Promise.all([
        refetchCosts(),
        refetchResources(),
        refetchBudgets()
      ]);

      console.log('Sincronização concluída com sucesso para período de cobrança Azure');
      
      toast({
        title: "Dados sincronizados",
        description: `Dados atualizados para período de cobrança Azure: ${dateRange.startDate} a ${dateRange.endDate}`,
      });

    } catch (error) {
      console.error('Erro na sincronização dos dados:', error);
      toast({
        title: "Erro na sincronização",
        description: "Não foi possível sincronizar os dados dos provedores.",
        variant: "destructive",
      });
    } finally {
      setSyncInProgress(false);
    }
  };

  // Calculate totals and metrics - usando apenas dados reais
  const totalSpend = costData ? 
    Object.values(costData).flat().reduce((sum, cost) => sum + cost.amount, 0) : 0;

  const totalBudget = (budgetsData || [])
    .reduce((sum, budget) => sum + budget.amount, 0);

  const totalBudgetSpent = (budgetsData || [])
    .reduce((sum, budget) => sum + budget.spent, 0);

  const budgetUtilization = totalBudget > 0 ? (totalBudgetSpent / totalBudget) * 100 : 0;

  const totalResources = (resourcesData || []).length;

  const connectedProviders = getConnectedProviders();

  // Log para debug - com mais detalhes
  useEffect(() => {
    if (costData) {
      console.log('Cost data received from database (Azure billing period):', costData);
      console.log('Total spend calculated for Azure billing period:', totalSpend);
      console.log('Azure billing period used:', dateRange);
      
      // Log detalhado dos custos por provedor
      Object.entries(costData).forEach(([provider, costs]) => {
        const providerTotal = costs.reduce((sum, cost) => sum + cost.amount, 0);
        console.log(`${provider}: ${costs.length} registros, total: ${providerTotal} (período Azure)`);
      });
    }
    if (resourcesData) {
      console.log('Resources data received from database:', resourcesData);
      console.log('Total resources:', totalResources);
    }
    if (budgetsData) {
      console.log('Budgets data received from database:', budgetsData);
      console.log('Total budget:', totalBudget);
    }
  }, [costData, resourcesData, budgetsData, totalSpend, totalResources, totalBudget, dateRange]);

  return {
    // Data
    costData: costData || {},
    resourcesData: resourcesData || [],
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
    totalSpend,
    totalBudget,
    totalBudgetSpent,
    budgetUtilization,
    totalResources,
    connectedProviders,
    
    // Date range control
    dateRange,
    setDateRange,
    
    // Manual sync function
    syncCloudData
  };
};
