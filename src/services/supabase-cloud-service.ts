
import { supabase } from '@/integrations/supabase/client';
import { CloudCredentials, CostData, ResourceData, BudgetData } from '@/types/cloud-providers';

export class SupabaseCloudService {
  async saveConnection(provider: 'aws' | 'azure' | 'gcp', credentials: CloudCredentials, isActive: boolean = true) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('cloud_connections')
      .upsert({
        user_id: user.id,
        provider,
        credentials: credentials as any, // Cast to any for JSON storage
        is_active: isActive,
        last_sync_at: isActive ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,provider'
      });

    if (error) throw error;
    return data;
  }

  async getConnections() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('cloud_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  }

  async removeConnection(provider: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('cloud_connections')
      .update({ is_active: false })
      .eq('user_id', user.id)
      .eq('provider', provider);

    if (error) throw error;
  }

  async saveCostData(provider: string, costData: CostData[]) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Primeiro, limpa os dados existentes para este provedor
    await supabase
      .from('cloud_cost_data')
      .delete()
      .eq('user_id', user.id)
      .eq('provider', provider);

    if (costData.length === 0) return;

    // Insere os novos dados
    const dataToInsert = costData.map(cost => ({
      user_id: user.id,
      provider,
      date: cost.date,
      amount: cost.amount,
      currency: cost.currency,
      service: cost.service || 'Unknown',
      region: cost.region
    }));

    const { data, error } = await supabase
      .from('cloud_cost_data')
      .insert(dataToInsert);

    if (error) throw error;
    return data;
  }

  async getCostData(provider?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    let query = supabase
      .from('cloud_cost_data')
      .select('*')
      .eq('user_id', user.id);

    if (provider) {
      query = query.eq('provider', provider);
    }

    const { data, error } = await query.order('date', { ascending: false });

    if (error) throw error;

    // Converte para o formato esperado
    const costDataByProvider: Record<string, CostData[]> = {};
    data?.forEach(row => {
      if (!costDataByProvider[row.provider]) {
        costDataByProvider[row.provider] = [];
      }
      costDataByProvider[row.provider].push({
        date: row.date,
        amount: row.amount,
        currency: row.currency,
        service: row.service,
        region: row.region
      });
    });

    return costDataByProvider;
  }

  async saveResources(provider: string, resources: ResourceData[]) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Primeiro, limpa os recursos existentes para este provedor
    await supabase
      .from('cloud_resources')
      .delete()
      .eq('user_id', user.id)
      .eq('provider', provider);

    if (resources.length === 0) return;

    // Insere os novos recursos
    const dataToInsert = resources.map(resource => ({
      user_id: user.id,
      resource_id: resource.id,
      name: resource.name,
      type: resource.type,
      provider: resource.provider,
      region: resource.region,
      cost: resource.cost,
      utilization: resource.utilization,
      status: resource.status,
      tags: resource.tags as any // Cast to any for JSON storage
    }));

    const { data, error } = await supabase
      .from('cloud_resources')
      .insert(dataToInsert);

    if (error) throw error;
    return data;
  }

  async getResources() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('cloud_resources')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Converte para o formato esperado
    return data?.map(row => ({
      id: row.resource_id,
      name: row.name,
      type: row.type,
      provider: row.provider as 'aws' | 'azure' | 'gcp',
      region: row.region || '',
      cost: row.cost || 0,
      utilization: row.utilization || 0,
      status: row.status as 'running' | 'stopped' | 'terminated',
      tags: (row.tags as Record<string, string>) || {}
    })) || [];
  }

  async saveBudgets(provider: string, budgets: BudgetData[]) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Primeiro, limpa os orçamentos existentes para este provedor
    await supabase
      .from('cloud_budgets')
      .delete()
      .eq('user_id', user.id)
      .eq('provider', provider);

    if (budgets.length === 0) return;

    // Insere os novos orçamentos
    const dataToInsert = budgets.map(budget => ({
      user_id: user.id,
      budget_id: budget.id,
      name: budget.name,
      amount: budget.amount,
      spent: budget.spent,
      period: budget.period,
      provider: budget.provider
    }));

    const { data, error } = await supabase
      .from('cloud_budgets')
      .insert(dataToInsert);

    if (error) throw error;
    return data;
  }

  async getBudgets() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('cloud_budgets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Converte para o formato esperado
    return data?.map(row => ({
      id: row.budget_id,
      name: row.name,
      amount: row.amount,
      spent: row.spent,
      period: row.period as 'monthly' | 'quarterly' | 'yearly',
      provider: row.provider as 'aws' | 'azure' | 'gcp'
    })) || [];
  }
}

export const supabaseCloudService = new SupabaseCloudService();
