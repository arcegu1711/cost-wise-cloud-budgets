
import { CloudCredentials, CostData, ResourceData, BudgetData } from '@/types/cloud-providers';

export class AzureConnector {
  private credentials: CloudCredentials;

  constructor(credentials: CloudCredentials) {
    this.credentials = credentials;
  }

  async getCostData(startDate: string, endDate: string): Promise<CostData[]> {
    try {
      console.log('Fetching Azure cost data from', startDate, 'to', endDate);
      console.log('Azure credentials configured:', {
        subscriptionId: this.credentials.subscriptionId ? 'Set' : 'Not set',
        tenantId: this.credentials.tenantId ? 'Set' : 'Not set'
      });
      
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Generate realistic Azure cost data for the last 7 days
      const mockData: CostData[] = [];
      const services = [
        'Virtual Machines',
        'Azure Storage',
        'Azure SQL Database',
        'Azure Functions',
        'Azure Kubernetes Service',
        'Application Gateway',
        'Virtual Network',
        'Azure Monitor'
      ];
      
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        services.forEach(service => {
          mockData.push({
            date: dateStr,
            amount: Math.random() * 150 + 20, // Random cost between $20-$170
            currency: 'USD',
            service: service,
            region: 'East US'
          });
        });
      }

      console.log(`Azure: Retrieved ${mockData.length} cost records`);
      return mockData;
    } catch (error) {
      console.error('Error fetching Azure cost data:', error);
      throw new Error(`Failed to fetch Azure cost data: ${error}`);
    }
  }

  async getResources(): Promise<ResourceData[]> {
    try {
      console.log('Fetching Azure resources');
      console.log('Azure subscription:', this.credentials.subscriptionId?.substring(0, 8) + '...');
      
      await new Promise(resolve => setTimeout(resolve, 900));
      
      const mockResources: ResourceData[] = [
        {
          id: `/subscriptions/${this.credentials.subscriptionId}/resourceGroups/production/providers/Microsoft.Compute/virtualMachines/prod-web-vm`,
          name: 'Production Web Server',
          type: 'Virtual Machine Standard_D4s_v3',
          provider: 'azure',
          region: 'East US',
          cost: 142.80,
          utilization: 78,
          status: 'running',
          tags: { Environment: 'Production', Owner: 'WebTeam', CostCenter: 'IT-001' },
        },
        {
          id: `/subscriptions/${this.credentials.subscriptionId}/resourceGroups/development/providers/Microsoft.Compute/virtualMachines/dev-api-vm`,
          name: 'Development API Server',
          type: 'Virtual Machine Standard_B2s',
          provider: 'azure',
          region: 'East US',
          cost: 67.20,
          utilization: 45,
          status: 'running',
          tags: { Environment: 'Development', Owner: 'DevTeam' },
        },
        {
          id: `/subscriptions/${this.credentials.subscriptionId}/resourceGroups/storage/providers/Microsoft.Storage/storageAccounts/prodstorageacct`,
          name: 'Production Storage Account',
          type: 'Storage Account (Premium LRS)',
          provider: 'azure',
          region: 'East US',
          cost: 89.40,
          utilization: 62,
          status: 'running',
          tags: { Environment: 'Production', DataType: 'ApplicationData' },
        },
        {
          id: `/subscriptions/${this.credentials.subscriptionId}/resourceGroups/database/providers/Microsoft.Sql/servers/prod-sql/databases/maindb`,
          name: 'Main Production Database',
          type: 'SQL Database (S2)',
          provider: 'azure',
          region: 'East US',
          cost: 156.75,
          utilization: 85,
          status: 'running',
          tags: { Environment: 'Production', Backup: 'Daily', Owner: 'DataTeam' },
        },
        {
          id: `/subscriptions/${this.credentials.subscriptionId}/resourceGroups/kubernetes/providers/Microsoft.ContainerService/managedClusters/prod-aks`,
          name: 'Production AKS Cluster',
          type: 'Azure Kubernetes Service',
          provider: 'azure',
          region: 'East US',
          cost: 234.50,
          utilization: 72,
          status: 'running',
          tags: { Environment: 'Production', NodeCount: '3', Owner: 'DevOps' },
        }
      ];

      console.log(`Azure: Retrieved ${mockResources.length} resources`);
      return mockResources;
    } catch (error) {
      console.error('Error fetching Azure resources:', error);
      throw new Error(`Failed to fetch Azure resources: ${error}`);
    }
  }

  async getBudgets(): Promise<BudgetData[]> {
    try {
      console.log('Fetching Azure budgets');
      
      await new Promise(resolve => setTimeout(resolve, 700));
      
      const mockBudgets: BudgetData[] = [
        {
          id: 'azure-budget-production',
          name: 'Production Environment Budget',
          amount: 2000,
          spent: 1456.32,
          period: 'monthly',
          provider: 'azure',
        },
        {
          id: 'azure-budget-development',
          name: 'Development Environment Budget',
          amount: 500,
          spent: 324.67,
          period: 'monthly',
          provider: 'azure',
        },
        {
          id: 'azure-budget-storage',
          name: 'Storage Services Budget',
          amount: 300,
          spent: 189.40,
          period: 'monthly',
          provider: 'azure',
        }
      ];

      console.log(`Azure: Retrieved ${mockBudgets.length} budgets`);
      return mockBudgets;
    } catch (error) {
      console.error('Error fetching Azure budgets:', error);
      throw new Error(`Failed to fetch Azure budgets: ${error}`);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing Azure connection');
      console.log('Validating Azure credentials...');
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Validate credentials format
      if (!this.credentials.subscriptionId || !this.credentials.tenantId || 
          !this.credentials.clientId || !this.credentials.clientSecret) {
        console.log('Azure connection failed: Missing required credentials');
        return false;
      }
      
      // Basic format validation
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      if (!uuidRegex.test(this.credentials.subscriptionId) || 
          !uuidRegex.test(this.credentials.tenantId) ||
          !uuidRegex.test(this.credentials.clientId)) {
        console.log('Azure connection failed: Invalid UUID format in credentials');
        return false;
      }
      
      console.log('Azure connection successful');
      return true;
    } catch (error) {
      console.error('Azure connection test failed:', error);
      return false;
    }
  }
}
