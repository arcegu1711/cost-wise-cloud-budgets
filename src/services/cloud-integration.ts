
import { AWSConnector } from './aws-connector';
import { AzureConnector } from './azure-connector';
import { GCPConnector } from './gcp-connector';
import { cloudBackendService } from './cloud-backend-service';
import { CloudCredentials, CostData, ResourceData, BudgetData } from '@/types/cloud-providers';

export class CloudIntegrationService {
  private connectors: Map<string, AWSConnector | AzureConnector | GCPConnector> = new Map();
  private useBackend: boolean = true; // Flag para usar backend ou mock

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
        if (this.useBackend) {
          // Usar backend service
          results[provider] = await cloudBackendService.getCostData(
            provider as 'aws' | 'azure' | 'gcp',
            (connector as any).credentials,
            startDate,
            endDate
          );
        } else {
          // Usar mock local
          results[provider] = await connector.getCostData(startDate, endDate);
        }
      } catch (error) {
        console.error(`Failed to get cost data for ${provider}:`, error);
        // Fallback para mock local em caso de erro
        try {
          results[provider] = await connector.getCostData(startDate, endDate);
        } catch (fallbackError) {
          console.error(`Fallback also failed for ${provider}:`, fallbackError);
          results[provider] = [];
        }
      }
    }
    
    return results;
  }

  async getAllResources(): Promise<ResourceData[]> {
    const allResources: ResourceData[] = [];
    
    for (const [provider, connector] of this.connectors.entries()) {
      try {
        let resources: ResourceData[];
        
        if (this.useBackend) {
          // Usar backend service
          resources = await cloudBackendService.getResources(
            provider as 'aws' | 'azure' | 'gcp',
            (connector as any).credentials
          );
        } else {
          // Usar mock local
          resources = await connector.getResources();
        }
        
        allResources.push(...resources);
      } catch (error) {
        console.error(`Failed to get resources for ${provider}:`, error);
        // Fallback para mock local em caso de erro
        try {
          const resources = await connector.getResources();
          allResources.push(...resources);
        } catch (fallbackError) {
          console.error(`Fallback also failed for ${provider}:`, fallbackError);
        }
      }
    }
    
    return allResources;
  }

  async getAllBudgets(): Promise<BudgetData[]> {
    const allBudgets: BudgetData[] = [];
    
    for (const [provider, connector] of this.connectors.entries()) {
      try {
        let budgets: BudgetData[];
        
        if (this.useBackend) {
          // Usar backend service
          budgets = await cloudBackendService.getBudgets(
            provider as 'aws' | 'azure' | 'gcp',
            (connector as any).credentials
          );
        } else {
          // Usar mock local
          budgets = await connector.getBudgets();
        }
        
        allBudgets.push(...budgets);
      } catch (error) {
        console.error(`Failed to get budgets for ${provider}:`, error);
        // Fallback para mock local em caso de erro
        try {
          const budgets = await connector.getBudgets();
          allBudgets.push(...budgets);
        } catch (fallbackError) {
          console.error(`Fallback also failed for ${provider}:`, fallbackError);
        }
      }
    }
    
    return allBudgets;
  }

  async testAllConnections(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    
    for (const [provider, connector] of this.connectors.entries()) {
      try {
        if (this.useBackend) {
          // Usar backend service
          results[provider] = await cloudBackendService.testConnection(
            provider as 'aws' | 'azure' | 'gcp',
            (connector as any).credentials
          );
        } else {
          // Usar mock local
          results[provider] = await connector.testConnection();
        }
      } catch (error) {
        console.error(`Connection test failed for ${provider}:`, error);
        // Fallback para mock local em caso de erro
        try {
          results[provider] = await connector.testConnection();
        } catch (fallbackError) {
          console.error(`Fallback also failed for ${provider}:`, fallbackError);
          results[provider] = false;
        }
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

  // Método para alternar entre backend e mock
  setUseBackend(useBackend: boolean) {
    this.useBackend = useBackend;
    console.log(`Cloud service mode: ${useBackend ? 'Backend' : 'Mock'}`);
  }

  isUsingBackend(): boolean {
    return this.useBackend;
  }
}

// Instância singleton para uso global
export const cloudService = new CloudIntegrationService();
