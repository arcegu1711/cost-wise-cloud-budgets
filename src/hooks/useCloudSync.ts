
import { useState } from 'react';
import { cloudService } from '@/services/cloud-integration';
import { supabaseCloudService } from '@/services/supabase-cloud-service';
import { useCloudConnections } from './useCloudConnections';
import { useToast } from '@/hooks/use-toast';

export const useCloudSync = (
  dateRange: { startDate: string; endDate: string },
  refetchCallbacks: {
    refetchCosts: () => void;
    refetchResources: () => void;
    refetchBudgets: () => void;
  }
) => {
  const { getConnectedProviders } = useCloudConnections();
  const { toast } = useToast();
  const [syncInProgress, setSyncInProgress] = useState(false);

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
        refetchCallbacks.refetchCosts(),
        refetchCallbacks.refetchResources(),
        refetchCallbacks.refetchBudgets()
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

  return {
    syncCloudData,
    syncInProgress
  };
};
