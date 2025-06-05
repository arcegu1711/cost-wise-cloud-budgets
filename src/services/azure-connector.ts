
import { CloudCredentials, CostData, ResourceData, BudgetData } from '@/types/cloud-providers';

export class AzureConnector {
  private credentials: CloudCredentials;

  constructor(credentials: CloudCredentials) {
    this.credentials = credentials;
  }

  async getCostData(startDate: string, endDate: string): Promise<CostData[]> {
    try {
      console.log('Simulating Azure cost data fetch from', startDate, 'to', endDate);
      
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const mockData: CostData[] = [
        { date: startDate, amount: 98.75, currency: 'USD', service: 'Virtual Machines' },
        { date: startDate, amount: 56.40, currency: 'USD', service: 'Storage' },
        { date: startDate, amount: 23.15, currency: 'USD', service: 'SQL Database' },
      ];

      return mockData;
    } catch (error) {
      console.error('Error simulating Azure cost data:', error);
      throw new Error(`Failed to fetch Azure cost data: ${error}`);
    }
  }

  async getResources(): Promise<ResourceData[]> {
    try {
      console.log('Simulating Azure resources fetch');
      
      await new Promise(resolve => setTimeout(resolve, 900));
      
      const mockResources: ResourceData[] = [
        {
          id: '/subscriptions/12345/resourceGroups/prod/providers/Microsoft.Compute/virtualMachines/vm1',
          name: 'Production VM',
          type: 'Virtual Machine Standard_D2s_v3',
          provider: 'azure',
          region: 'East US',
          cost: 67.20,
          utilization: 72,
          status: 'running',
          tags: { Environment: 'Production', Owner: 'DevOps' },
        },
        {
          id: '/subscriptions/12345/resourceGroups/dev/providers/Microsoft.Storage/storageAccounts/devstorage',
          name: 'Development Storage',
          type: 'Storage Account',
          provider: 'azure',
          region: 'East US',
          cost: 15.60,
          utilization: 45,
          status: 'running',
          tags: { Environment: 'Development' },
        },
      ];

      return mockResources;
    } catch (error) {
      console.error('Error simulating Azure resources:', error);
      throw new Error(`Failed to fetch Azure resources: ${error}`);
    }
  }

  async getBudgets(): Promise<BudgetData[]> {
    try {
      console.log('Simulating Azure budgets fetch');
      
      await new Promise(resolve => setTimeout(resolve, 700));
      
      const mockBudgets: BudgetData[] = [
        {
          id: 'azure-budget-prod',
          name: 'Production Subscription',
          amount: 800,
          spent: 543.20,
          period: 'monthly',
          provider: 'azure',
        },
      ];

      return mockBudgets;
    } catch (error) {
      console.error('Error simulating Azure budgets:', error);
      throw new Error(`Failed to fetch Azure budgets: ${error}`);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing simulated Azure connection');
      
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Validate credentials format
      if (!this.credentials.subscriptionId || !this.credentials.tenantId || 
          !this.credentials.clientId || !this.credentials.clientSecret) {
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Azure connection test failed:', error);
      return false;
    }
  }
}
