
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
      console.log('Fetching real GCP cost data from', startDate, 'to', endDate);
      
      const { CloudBillingClient } = await import('@google-cloud/billing');
      
      const client = new CloudBillingClient({
        credentials: this.serviceAccountKey,
        projectId: this.projectId
      });

      // Get billing account
      const [accounts] = await client.listBillingAccounts();
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No billing accounts found');
      }

      const billingAccount = accounts[0].name;
      
      // Note: For detailed cost data, you would typically use BigQuery with billing export
      // This is a simplified example
      const costData: CostData[] = [
        {
          date: startDate,
          amount: 0, // Would come from BigQuery billing export
          currency: 'USD',
          service: 'Cloud Billing API does not provide detailed cost breakdown',
          region: 'global'
        }
      ];

      console.log(`GCP: Retrieved ${costData.length} cost records`);
      return costData;
    } catch (error) {
      console.error('Error fetching real GCP cost data:', error);
      throw new Error(`Failed to fetch GCP cost data: ${error}`);
    }
  }

  async getResources(): Promise<ResourceData[]> {
    try {
      console.log('Fetching real GCP resources');
      
      const { ProjectsClient } = await import('@google-cloud/resource-manager');
      
      const client = new ProjectsClient({
        credentials: this.serviceAccountKey,
        projectId: this.projectId
      });

      // Get project info
      const [project] = await client.getProject({
        name: `projects/${this.projectId}`
      });

      const resources: ResourceData[] = [];

      if (project) {
        resources.push({
          id: project.name || this.projectId,
          name: project.displayName || this.projectId,
          type: 'Project',
          provider: 'gcp',
          region: 'global',
          cost: 0,
          utilization: 0,
          status: project.state === 'ACTIVE' ? 'running' : 'stopped',
          tags: project.labels || {}
        });
      }

      // Note: To get compute instances, storage buckets, etc., you would need to
      // import and use their respective clients (Compute Engine, Cloud Storage, etc.)

      console.log(`GCP: Retrieved ${resources.length} resources`);
      return resources;
    } catch (error) {
      console.error('Error fetching real GCP resources:', error);
      throw new Error(`Failed to fetch GCP resources: ${error}`);
    }
  }

  async getBudgets(): Promise<BudgetData[]> {
    try {
      console.log('Fetching real GCP budgets');
      
      // Import the billing client that contains budget functionality
      const billing = await import('@google-cloud/billing');
      
      // Use CloudBillingClient which has budget methods
      const client = new billing.CloudBillingClient({
        credentials: this.serviceAccountKey,
        projectId: this.projectId
      });

      // Get billing account first
      const [accounts] = await client.listBillingAccounts();
      
      if (!accounts || accounts.length === 0) {
        return [];
      }

      const billingAccount = accounts[0].name;
      
      // Note: The budget functionality in @google-cloud/billing might be limited
      // In real scenarios, you'd typically use the Budget Service API directly
      const budgetData: BudgetData[] = [];

      console.log(`GCP: Retrieved ${budgetData.length} budgets`);
      return budgetData;
    } catch (error) {
      console.error('Error fetching real GCP budgets:', error);
      throw new Error(`Failed to fetch GCP budgets: ${error}`);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing real GCP connection');
      
      const { ProjectsClient } = await import('@google-cloud/resource-manager');
      
      const client = new ProjectsClient({
        credentials: this.serviceAccountKey,
        projectId: this.projectId
      });

      // Test by getting project info
      await client.getProject({
        name: `projects/${this.projectId}`
      });
      
      console.log('GCP connection successful');
      return true;
    } catch (error) {
      console.error('GCP connection test failed:', error);
      return false;
    }
  }
}
