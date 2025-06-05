import { CloudCredentials, CostData, ResourceData, BudgetData } from '@/types/cloud-providers';
import { CostManagementClient } from '@azure/arm-costmanagement';
import { ResourceManagementClient } from '@azure/arm-resources';
import { ClientSecretCredential } from '@azure/identity';

export class AzureConnector {
  private credentials: CloudCredentials;
  private costManagementClient: CostManagementClient;
  private resourceClient: ResourceManagementClient;
  private credential: ClientSecretCredential;

  constructor(credentials: CloudCredentials) {
    this.credentials = credentials;
    
    this.credential = new ClientSecretCredential(
      credentials.tenantId!,
      credentials.clientId!,
      credentials.clientSecret!
    );

    this.costManagementClient = new CostManagementClient(this.credential);

    this.resourceClient = new ResourceManagementClient(
      this.credential,
      credentials.subscriptionId!
    );
  }

  async getCostData(startDate: string, endDate: string): Promise<CostData[]> {
    try {
      console.log('Fetching real Azure cost data from', startDate, 'to', endDate);
      
      const scope = `/subscriptions/${this.credentials.subscriptionId}`;
      
      const queryDefinition = {
        type: "ActualCost",
        timeframe: "Custom",
        timePeriod: {
          from: new Date(startDate),
          to: new Date(endDate),
        },
        dataset: {
          granularity: "Daily",
          aggregation: {
            totalCost: {
              name: "Cost",
              function: "Sum",
            },
          },
          grouping: [
            {
              type: "Dimension",
              name: "ServiceName",
            },
          ],
        },
      };

      const result = await this.costManagementClient.query.usage(scope, queryDefinition);
      const costData: CostData[] = [];

      if (result.rows) {
        result.rows.forEach((row: any[]) => {
          const amount = row[0] || 0;
          const currency = row[1] || 'USD';
          const date = row[2] || '';
          const service = row[3] || 'Unknown';

          if (amount > 0) {
            costData.push({
              date: new Date(date).toISOString().split('T')[0],
              amount: parseFloat(amount),
              currency,
              service,
            });
          }
        });
      }

      return costData;
    } catch (error) {
      console.error('Error fetching Azure cost data:', error);
      throw new Error(`Failed to fetch Azure cost data: ${error}`);
    }
  }

  async getResources(): Promise<ResourceData[]> {
    try {
      console.log('Fetching real Azure resources');
      
      const resources: ResourceData[] = [];
      
      for await (const resource of this.resourceClient.resources.list()) {
        if (resource.id && resource.name && resource.type) {
          resources.push({
            id: resource.id,
            name: resource.name,
            type: resource.type,
            provider: 'azure',
            region: resource.location || 'unknown',
            cost: 0, // Would need to be calculated from cost data
            utilization: 0, // Would need Azure Monitor metrics
            status: 'running', // Would need to check actual status
            tags: resource.tags || {},
          });
        }
      }

      return resources;
    } catch (error) {
      console.error('Error fetching Azure resources:', error);
      throw new Error(`Failed to fetch Azure resources: ${error}`);
    }
  }

  async getBudgets(): Promise<BudgetData[]> {
    try {
      console.log('Fetching real Azure budgets');
      
      // Azure doesn't have a direct budgets API in the same way
      // This would typically involve the Consumption API or Cost Management
      // For now, returning empty array as budget management in Azure is more complex
      console.log('Azure budget fetching requires additional setup with Consumption API');
      
      return [];
    } catch (error) {
      console.error('Error fetching Azure budgets:', error);
      throw new Error(`Failed to fetch Azure budgets: ${error}`);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing real Azure connection');
      
      // Test by listing resource groups
      const resourceGroups = this.resourceClient.resourceGroups.list();
      await resourceGroups.next();
      
      return true;
    } catch (error) {
      console.error('Azure connection test failed:', error);
      return false;
    }
  }
}
