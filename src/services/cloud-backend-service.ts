
import { supabase } from '@/integrations/supabase/client';
import { CloudCredentials, CostData, ResourceData, BudgetData } from '@/types/cloud-providers';

export class CloudBackendService {
  
  async getCostData(provider: 'aws' | 'azure' | 'gcp', credentials: CloudCredentials, startDate: string, endDate: string): Promise<CostData[]> {
    try {
      console.log(`Fetching cost data from ${provider} backend...`);
      
      const { data, error } = await supabase.functions.invoke('cloud-cost-data', {
        body: {
          provider,
          credentials,
          startDate,
          endDate
        }
      });

      if (error) throw error;
      
      console.log(`${provider}: Retrieved ${data.length} cost records from backend`);
      return data;
    } catch (error) {
      console.error(`Error fetching cost data from ${provider} backend:`, error);
      throw new Error(`Failed to fetch ${provider} cost data: ${error}`);
    }
  }

  async getResources(provider: 'aws' | 'azure' | 'gcp', credentials: CloudCredentials): Promise<ResourceData[]> {
    try {
      console.log(`Fetching resources from ${provider} backend...`);
      
      const { data, error } = await supabase.functions.invoke('cloud-resources', {
        body: {
          provider,
          credentials
        }
      });

      if (error) throw error;
      
      console.log(`${provider}: Retrieved ${data.length} resources from backend`);
      return data;
    } catch (error) {
      console.error(`Error fetching resources from ${provider} backend:`, error);
      throw new Error(`Failed to fetch ${provider} resources: ${error}`);
    }
  }

  async getBudgets(provider: 'aws' | 'azure' | 'gcp', credentials: CloudCredentials): Promise<BudgetData[]> {
    try {
      console.log(`Fetching budgets from ${provider} backend...`);
      
      const { data, error } = await supabase.functions.invoke('cloud-budgets', {
        body: {
          provider,
          credentials
        }
      });

      if (error) throw error;
      
      console.log(`${provider}: Retrieved ${data.length} budgets from backend`);
      return data;
    } catch (error) {
      console.error(`Error fetching budgets from ${provider} backend:`, error);
      throw new Error(`Failed to fetch ${provider} budgets: ${error}`);
    }
  }

  async testConnection(provider: 'aws' | 'azure' | 'gcp', credentials: CloudCredentials): Promise<boolean> {
    try {
      console.log(`Testing ${provider} connection via backend...`);
      
      const { data, error } = await supabase.functions.invoke('cloud-test-connection', {
        body: {
          provider,
          credentials
        }
      });

      if (error) throw error;
      
      console.log(`${provider} connection test result:`, data.success);
      return data.success;
    } catch (error) {
      console.error(`Error testing ${provider} connection:`, error);
      return false;
    }
  }
}

export const cloudBackendService = new CloudBackendService();
