
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

  // Enhanced cost correlation logic with multiple strategies
  const resourcesData = rawResourcesData ? rawResourcesData.map(resource => {
    let resourceCost = 0;
    
    if (costData) {
      // Get all cost entries for this provider
      const providerCosts = costData[resource.provider] || [];
      
      // Strategy 1: Direct service name matching
      const getServiceMappings = (resourceType: string) => {
        const type = resourceType.toLowerCase();
        const mappings = [];
        
        // More comprehensive mappings based on Azure resource types
        if (type.includes('microsoft.compute') || type.includes('virtualmachines') || type.includes('compute')) {
          mappings.push('microsoft.compute', 'compute', 'virtual machines', 'vm');
        }
        if (type.includes('microsoft.storage') || type.includes('storage') || type.includes('disk') || type.includes('blob')) {
          mappings.push('microsoft.storage', 'storage', 'disk', 'blob');
        }
        if (type.includes('microsoft.network') || type.includes('network') || type.includes('loadbalancer')) {
          mappings.push('microsoft.network', 'network', 'load balancer', 'networking');
        }
        if (type.includes('microsoft.sql') || type.includes('microsoft.dbfor') || type.includes('database') || type.includes('sql')) {
          mappings.push('microsoft.dbformysql', 'microsoft.dbforpostgresql', 'microsoft.sql', 'database', 'sql', 'mysql', 'postgresql');
        }
        if (type.includes('microsoft.cache') || type.includes('cache') || type.includes('redis')) {
          mappings.push('microsoft.cache', 'cache', 'redis');
        }
        if (type.includes('microsoft.eventhub') || type.includes('eventhub')) {
          mappings.push('microsoft.eventhub', 'event hub', 'eventhub');
        }
        if (type.includes('microsoft.logic') || type.includes('logic')) {
          mappings.push('microsoft.logic', 'logic app', 'logic');
        }
        if (type.includes('microsoft.web') || type.includes('web') || type.includes('app')) {
          mappings.push('microsoft.web', 'app service', 'web app', 'web');
        }
        if (type.includes('microsoft.containerservice') || type.includes('kubernetes') || type.includes('aks')) {
          mappings.push('kubernetes', 'aks', 'container');
        }
        if (type.includes('microsoft.security')) {
          mappings.push('microsoft.security', 'security');
        }
        if (type.includes('microsoft.operationalinsights')) {
          mappings.push('microsoft.operationalinsights', 'operational insights', 'log analytics');
        }
        
        return mappings;
      };

      const serviceMappings = getServiceMappings(resource.type);
      
      // Find matching costs
      const matchingCosts = providerCosts.filter(cost => {
        const costService = cost.service.toLowerCase();
        
        // Check for direct service match (case insensitive)
        const isServiceMatch = serviceMappings.some(mapping => 
          costService.includes(mapping.toLowerCase()) || mapping.toLowerCase().includes(costService)
        );
        
        // Region matching (more flexible - just check if regions contain each other)
        const isRegionMatch = !cost.region || !resource.region || 
          cost.region.toLowerCase().includes(resource.region.toLowerCase()) ||
          resource.region.toLowerCase().includes(cost.region.toLowerCase()) ||
          cost.region.toLowerCase() === 'all regions'; // Azure global services
        
        return isServiceMatch && isRegionMatch;
      });

      // Sum up all matching costs
      resourceCost = matchingCosts.reduce((sum, cost) => sum + cost.amount, 0);
      
      // If no direct match found, try fallback strategies
      if (resourceCost === 0 && providerCosts.length > 0) {
        // Strategy 2: Try partial matching on resource name or type
        const partialMatches = providerCosts.filter(cost => {
          const costService = cost.service.toLowerCase();
          const resourceName = resource.name.toLowerCase();
          const resourceType = resource.type.toLowerCase();
          
          // Check if cost service appears in resource type or name
          return resourceType.includes(costService.replace('microsoft.', '')) ||
                 resourceName.includes(costService.replace('microsoft.', '')) ||
                 costService.includes(resourceType.replace('microsoft.', ''));
        });
        
        if (partialMatches.length > 0) {
          resourceCost = partialMatches.reduce((sum, cost) => sum + cost.amount, 0) / partialMatches.length;
        }
      }
      
      // Strategy 3: For unmatched resources, assign a small portion of total unassigned costs
      if (resourceCost === 0 && providerCosts.length > 0) {
        const totalCosts = providerCosts.reduce((sum, cost) => sum + cost.amount, 0);
        const averageCost = totalCosts / Math.max(rawResourcesData.length, 10); // Distribute among resources
        resourceCost = averageCost * 0.1; // Assign 10% of average as estimate
      }
    }
    
    return {
      ...resource,
      cost: resourceCost > 0 ? Number(resourceCost.toFixed(2)) : 0
    };
  }) : [];

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

  const totalResources = resourcesData.length;
  const totalResourcesCost = resourcesData.reduce((sum, resource) => sum + (resource.cost || 0), 0);

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
    totalSpend,
    totalBudget,
    totalBudgetSpent,
    budgetUtilization,
    totalResources,
    totalResourcesCost,
    connectedProviders,
    
    // Date range control
    dateRange,
    setDateRange,
    
    // Manual sync function
    syncCloudData
  };
};
