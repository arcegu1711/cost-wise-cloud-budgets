
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
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 700));
    
    console.log('Fetching simulated GCP cost data from', startDate, 'to', endDate);
    
    // Generate realistic mock data
    const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
    const services = ['Compute Engine', 'Cloud Storage', 'Cloud SQL', 'Cloud Functions', 'Cloud CDN', 'Cloud Load Balancing'];
    const regions = ['us-central1', 'us-east1', 'europe-west1'];
    
    const costData: CostData[] = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date(new Date(startDate).getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      services.forEach(service => {
        regions.forEach(region => {
          const amount = Math.random() * 90 + 12; // $12-$102 per day per service per region
          costData.push({
            date: dateStr,
            amount: Math.round(amount * 100) / 100,
            currency: 'USD',
            service: service,
            region: region
          });
        });
      });
    }

    console.log(`GCP: Retrieved ${costData.length} cost records (simulated)`);
    return costData;
  }

  async getResources(): Promise<ResourceData[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 600));
    
    console.log('Fetching simulated GCP resources');
    
    const machineTypes = ['e2-micro', 'e2-small', 'e2-medium', 'n1-standard-1', 'n1-standard-2'];
    const zones = ['us-central1-a', 'us-east1-b', 'europe-west1-c'];
    const statuses = ['RUNNING', 'TERMINATED', 'STOPPED'];
    
    const resources: ResourceData[] = [];
    
    // Generate project info
    resources.push({
      id: `projects/${this.projectId}`,
      name: this.projectId,
      type: 'Project',
      provider: 'gcp',
      region: 'global',
      cost: 0,
      utilization: 0,
      status: 'running',
      tags: {
        'project-id': this.projectId,
        'billing-enabled': 'true'
      }
    });
    
    // Generate 12-18 Compute Engine instances
    const instanceCount = 12 + Math.floor(Math.random() * 6);
    for (let i = 0; i < instanceCount; i++) {
      const machineType = machineTypes[Math.floor(Math.random() * machineTypes.length)];
      const zone = zones[Math.floor(Math.random() * zones.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const utilization = status === 'RUNNING' ? Math.random() * 75 + 10 : 0;
      
      resources.push({
        id: `projects/${this.projectId}/zones/${zone}/instances/instance-${i}`,
        name: `gce-instance-${i + 1}`,
        type: `Compute Engine ${machineType}`,
        provider: 'gcp',
        region: zone.substring(0, zone.lastIndexOf('-')),
        cost: Math.round((Math.random() * 160 + 30) * 100) / 100,
        utilization: Math.round(utilization),
        status: status.toLowerCase(),
        tags: {
          environment: Math.random() > 0.5 ? 'production' : 'development',
          team: `team-${Math.floor(Math.random() * 4) + 1}`
        }
      });
    }

    // Add some Cloud SQL instances
    for (let i = 0; i < 2; i++) {
      resources.push({
        id: `projects/${this.projectId}/instances/cloudsql-${i}`,
        name: `cloudsql-db-${i + 1}`,
        type: 'Cloud SQL MySQL',
        provider: 'gcp',
        region: zones[Math.floor(Math.random() * zones.length)].substring(0, zones[0].lastIndexOf('-')),
        cost: Math.round((Math.random() * 120 + 60) * 100) / 100,
        utilization: Math.round(Math.random() * 65 + 20),
        status: 'running',
        tags: {
          environment: 'production',
          'backup-enabled': 'true'
        }
      });
    }

    console.log(`GCP: Retrieved ${resources.length} resources (simulated)`);
    return resources;
  }

  async getBudgets(): Promise<BudgetData[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 700 + Math.random() * 500));
    
    console.log('Fetching simulated GCP budgets');
    
    const budgetData: BudgetData[] = [
      {
        id: 'monthly-compute-budget',
        name: 'Monthly Compute Budget',
        amount: 3500,
        spent: Math.round((Math.random() * 2200 + 800) * 100) / 100,
        period: 'monthly',
        provider: 'gcp'
      },
      {
        id: 'quarterly-storage-budget',
        name: 'Quarterly Storage Budget',
        amount: 1500,
        spent: Math.round((Math.random() * 900 + 300) * 100) / 100,
        period: 'quarterly',
        provider: 'gcp'
      },
      {
        id: 'annual-project-budget',
        name: 'Annual Project Budget',
        amount: 40000,
        spent: Math.round((Math.random() * 28000 + 8000) * 100) / 100,
        period: 'yearly',
        provider: 'gcp'
      }
    ];

    console.log(`GCP: Retrieved ${budgetData.length} budgets (simulated)`);
    return budgetData;
  }

  async testConnection(): Promise<boolean> {
    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 1100 + Math.random() * 900));
    
    console.log('Testing simulated GCP connection');
    
    // Simulate occasional connection failures for realism
    const success = Math.random() > 0.12; // 88% success rate
    
    if (success) {
      console.log('GCP connection successful (simulated)');
      return true;
    } else {
      console.log('GCP connection failed (simulated)');
      return false;
    }
  }
}
