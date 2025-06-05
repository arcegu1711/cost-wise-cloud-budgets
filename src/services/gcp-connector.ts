
import { CloudCredentials, CostData, ResourceData, BudgetData } from '@/types/cloud-providers';

export class GCPConnector {
  private credentials: CloudCredentials;
  private projectId: string;
  private serviceAccountKey: any;

  constructor(credentials: CloudCredentials) {
    this.credentials = credentials;
    this.projectId = credentials.projectId!;
    
    try {
      this.serviceAccountKey = JSON.parse(credentials.serviceAccountKey!);
    } catch (error) {
      throw new Error('Invalid service account key JSON');
    }
  }

  async getCostData(startDate: string, endDate: string): Promise<CostData[]> {
    try {
      console.log('Simulating GCP cost data fetch from', startDate, 'to', endDate);
      
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      const mockData: CostData[] = [
        { date: startDate, amount: 78.90, currency: 'USD', service: 'Compute Engine' },
        { date: startDate, amount: 34.50, currency: 'USD', service: 'Cloud Storage' },
        { date: startDate, amount: 19.25, currency: 'USD', service: 'Cloud SQL' },
      ];

      return mockData;
    } catch (error) {
      console.error('Error simulating GCP cost data:', error);
      throw new Error(`Failed to fetch GCP cost data: ${error}`);
    }
  }

  async getResources(): Promise<ResourceData[]> {
    try {
      console.log('Simulating GCP resources fetch');
      
      await new Promise(resolve => setTimeout(resolve, 850));
      
      const mockResources: ResourceData[] = [
        {
          id: `projects/${this.projectId}/zones/us-central1-a/instances/web-server-1`,
          name: 'Web Server Instance',
          type: 'Compute Engine n1-standard-2',
          provider: 'gcp',
          region: 'us-central1',
          cost: 52.40,
          utilization: 68,
          status: 'running',
          tags: { env: 'production', team: 'frontend' },
        },
        {
          id: `projects/${this.projectId}`,
          name: this.projectId,
          type: 'Project',
          provider: 'gcp',
          region: 'global',
          cost: 0,
          utilization: 0,
          status: 'running',
          tags: {},
        },
      ];

      return mockResources;
    } catch (error) {
      console.error('Error simulating GCP resources:', error);
      throw new Error(`Failed to fetch GCP resources: ${error}`);
    }
  }

  async getBudgets(): Promise<BudgetData[]> {
    try {
      console.log('Simulating GCP budgets fetch');
      
      await new Promise(resolve => setTimeout(resolve, 750));
      
      const mockBudgets: BudgetData[] = [
        {
          id: 'gcp-budget-main',
          name: 'Main Project Budget',
          amount: 600,
          spent: 387.65,
          period: 'monthly',
          provider: 'gcp',
        },
      ];

      return mockBudgets;
    } catch (error) {
      console.error('Error simulating GCP budgets:', error);
      throw new Error(`Failed to fetch GCP budgets: ${error}`);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing simulated GCP connection');
      
      await new Promise(resolve => setTimeout(resolve, 550));
      
      // Validate credentials format
      if (!this.projectId || !this.serviceAccountKey) {
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('GCP connection test failed:', error);
      return false;
    }
  }
}
