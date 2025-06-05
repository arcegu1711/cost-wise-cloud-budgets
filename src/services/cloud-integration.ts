
import { AWSConnector } from './aws-connector';
import { AzureConnector } from './azure-connector';
import { GCPConnector } from './gcp-connector';
import { CloudCredentials, CostData, ResourceData, BudgetData } from '@/types/cloud-providers';

export class CloudIntegrationService {
  private connectors: Map<string, AWSConnector | AzureConnector | GCPConnector> = new Map();

  addProvider(provider: 'aws' | 'azure' | 'gcp', credentials: CloudCredentials) {
    switch (provider) {
      case 'aws':
        this.connectors.set('aws', new AWSConnector(credentials));
        break;
      case 'azure':
        this.connectors.set('azure', new AzureConnector(credentials));
        break;
      case 'gcp':
        this.connectors.set('gcp', new GCPConnector(credentials));
        break;
    }
  }

  async getAllCostData(startDate: string, endDate: string): Promise<Record<string, CostData[]>> {
    const results: Record<string, CostData[]> = {};
    
    for (const [provider, connector] of this.connectors.entries()) {
      try {
        results[provider] = await connector.getCostData(startDate, endDate);
      } catch (error) {
        console.error(`Failed to get cost data for ${provider}:`, error);
        results[provider] = [];
      }
    }
    
    return results;
  }

  async getAllResources(): Promise<ResourceData[]> {
    const allResources: ResourceData[] = [];
    
    for (const [provider, connector] of this.connectors.entries()) {
      try {
        const resources = await connector.getResources();
        allResources.push(...resources);
      } catch (error) {
        console.error(`Failed to get resources for ${provider}:`, error);
      }
    }
    
    return allResources;
  }

  async getAllBudgets(): Promise<BudgetData[]> {
    const allBudgets: BudgetData[] = [];
    
    for (const [provider, connector] of this.connectors.entries()) {
      try {
        const budgets = await connector.getBudgets();
        allBudgets.push(...budgets);
      } catch (error) {
        console.error(`Failed to get budgets for ${provider}:`, error);
      }
    }
    
    return allBudgets;
  }

  async testAllConnections(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    
    for (const [provider, connector] of this.connectors.entries()) {
      try {
        results[provider] = await connector.testConnection();
      } catch (error) {
        console.error(`Connection test failed for ${provider}:`, error);
        results[provider] = false;
      }
    }
    
    return results;
  }

  getConnectedProviders(): string[] {
    return Array.from(this.connectors.keys());
  }

  removeProvider(provider: string) {
    this.connectors.delete(provider);
  }
}

// Instância singleton para uso global
export const cloudService = new CloudIntegrationService();
