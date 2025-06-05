
import { CloudCredentials, CostData, ResourceData, BudgetData } from '@/types/cloud-providers';

export class AzureConnector {
  private credentials: CloudCredentials;

  constructor(credentials: CloudCredentials) {
    this.credentials = credentials;
  }

  async getCostData(startDate: string, endDate: string): Promise<CostData[]> {
    try {
      console.log('Fetching real Azure cost data from', startDate, 'to', endDate);
      
      const { ConsumptionManagementClient } = await import('@azure/arm-consumption');
      const { ClientSecretCredential } = await import('@azure/identity');

      const credential = new ClientSecretCredential(
        this.credentials.tenantId!,
        this.credentials.clientId!,
        this.credentials.clientSecret!
      );

      const client = new ConsumptionManagementClient(credential, this.credentials.subscriptionId!);
      
      // Get usage details for the subscription
      const usageDetails = client.usageDetails.list(
        `/subscriptions/${this.credentials.subscriptionId}`,
        {
          filter: `properties/usageStart ge '${startDate}' and properties/usageEnd le '${endDate}'`
        }
      );

      const costData: CostData[] = [];
      
      for await (const usage of usageDetails) {
        // Handle the union type properly
        if (usage && 'properties' in usage && usage.properties) {
          const props = usage.properties as any;
          if ('cost' in props) {
            costData.push({
              date: props.date?.toISOString?.()?.split('T')[0] || startDate,
              amount: props.cost || 0,
              currency: props.currency || 'USD',
              service: props.meterCategory || 'Unknown',
              region: props.resourceLocation || 'Unknown'
            });
          }
        }
      }

      console.log(`Azure: Retrieved ${costData.length} cost records`);
      return costData;
    } catch (error) {
      console.error('Error fetching real Azure cost data:', error);
      throw new Error(`Failed to fetch Azure cost data: ${error}`);
    }
  }

  async getResources(): Promise<ResourceData[]> {
    try {
      console.log('Fetching real Azure resources');
      
      const { ResourceManagementClient } = await import('@azure/arm-resources');
      const { ClientSecretCredential } = await import('@azure/identity');

      const credential = new ClientSecretCredential(
        this.credentials.tenantId!,
        this.credentials.clientId!,
        this.credentials.clientSecret!
      );

      const client = new ResourceManagementClient(credential, this.credentials.subscriptionId!);
      
      const resources: ResourceData[] = [];
      const resourcesResponse = client.resources.list();

      for await (const resource of resourcesResponse) {
        if (resource.id && resource.name && resource.type) {
          resources.push({
            id: resource.id,
            name: resource.name,
            type: resource.type,
            provider: 'azure',
            region: resource.location || 'Unknown',
            cost: 0, // Would need additional API calls to get cost
            utilization: 0, // Would need Azure Monitor metrics
            status: 'running', // Would need resource-specific status checks
            tags: resource.tags || {}
          });
        }
      }

      console.log(`Azure: Retrieved ${resources.length} resources`);
      return resources;
    } catch (error) {
      console.error('Error fetching real Azure resources:', error);
      throw new Error(`Failed to fetch Azure resources: ${error}`);
    }
  }

  async getBudgets(): Promise<BudgetData[]> {
    try {
      console.log('Fetching real Azure budgets');
      
      const { ConsumptionManagementClient } = await import('@azure/arm-consumption');
      const { ClientSecretCredential } = await import('@azure/identity');

      const credential = new ClientSecretCredential(
        this.credentials.tenantId!,
        this.credentials.clientId!,
        this.credentials.clientSecret!
      );

      const client = new ConsumptionManagementClient(credential, this.credentials.subscriptionId!);
      
      // Get budgets for the subscription
      const budgetsResponse = client.budgets.list(`/subscriptions/${this.credentials.subscriptionId}`);
      
      const budgetData: BudgetData[] = [];
      
      for await (const budget of budgetsResponse) {
        if (budget.name && budget.amount) {
          budgetData.push({
            id: budget.name,
            name: budget.name,
            amount: budget.amount,
            spent: budget.currentSpend?.amount || 0,
            period: budget.timeGrain?.toLowerCase() as 'monthly' | 'quarterly' | 'yearly' || 'monthly',
            provider: 'azure'
          });
        }
      }

      console.log(`Azure: Retrieved ${budgetData.length} budgets`);
      return budgetData;
    } catch (error) {
      console.error('Error fetching real Azure budgets:', error);
      throw new Error(`Failed to fetch Azure budgets: ${error}`);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing real Azure connection');
      
      const { ClientSecretCredential } = await import('@azure/identity');
      const { ResourceManagementClient } = await import('@azure/arm-resources');

      const credential = new ClientSecretCredential(
        this.credentials.tenantId!,
        this.credentials.clientId!,
        this.credentials.clientSecret!
      );

      const client = new ResourceManagementClient(credential, this.credentials.subscriptionId!);
      
      // Test by getting resource groups instead of subscription
      const resourceGroups = client.resourceGroups.list();
      const result = await resourceGroups.next();
      
      console.log('Azure connection successful');
      return true;
    } catch (error) {
      console.error('Azure connection test failed:', error);
      return false;
    }
  }
}
