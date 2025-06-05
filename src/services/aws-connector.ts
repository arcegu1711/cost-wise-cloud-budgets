
import { CloudCredentials, CostData, ResourceData, BudgetData } from '@/types/cloud-providers';

export class AWSConnector {
  private credentials: CloudCredentials;

  constructor(credentials: CloudCredentials) {
    this.credentials = credentials;
  }

  async getCostData(startDate: string, endDate: string): Promise<CostData[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
    
    console.log('Fetching simulated AWS cost data from', startDate, 'to', endDate);
    
    // Generate realistic mock data based on date range
    const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
    const services = ['EC2-Instance', 'S3', 'RDS', 'Lambda', 'CloudFront', 'ELB'];
    const regions = ['us-east-1', 'us-west-2', 'eu-west-1'];
    
    const costData: CostData[] = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date(new Date(startDate).getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      services.forEach(service => {
        regions.forEach(region => {
          const amount = Math.random() * 100 + 10; // $10-$110 per day per service per region
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

    console.log(`AWS: Retrieved ${costData.length} cost records (simulated)`);
    return costData;
  }

  async getResources(): Promise<ResourceData[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));
    
    console.log('Fetching simulated AWS resources');
    
    const instanceTypes = ['t3.micro', 't3.small', 't3.medium', 'm5.large', 'c5.xlarge'];
    const regions = ['us-east-1', 'us-west-2', 'eu-west-1'];
    const statuses = ['running', 'stopped'];
    
    const resources: ResourceData[] = [];
    
    // Generate 15-25 EC2 instances
    const instanceCount = 15 + Math.floor(Math.random() * 10);
    for (let i = 0; i < instanceCount; i++) {
      const instanceType = instanceTypes[Math.floor(Math.random() * instanceTypes.length)];
      const region = regions[Math.floor(Math.random() * regions.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const utilization = status === 'running' ? Math.random() * 80 + 10 : 0;
      
      resources.push({
        id: `i-${Math.random().toString(36).substr(2, 9)}`,
        name: `web-server-${i + 1}`,
        type: `EC2 ${instanceType}`,
        provider: 'aws',
        region: region,
        cost: Math.round((Math.random() * 200 + 50) * 100) / 100,
        utilization: Math.round(utilization),
        status: status,
        tags: {
          Environment: Math.random() > 0.5 ? 'Production' : 'Development',
          Team: `team-${Math.floor(Math.random() * 5) + 1}`
        }
      });
    }

    // Add some RDS instances
    for (let i = 0; i < 3; i++) {
      resources.push({
        id: `db-${Math.random().toString(36).substr(2, 9)}`,
        name: `database-${i + 1}`,
        type: 'RDS MySQL',
        provider: 'aws',
        region: regions[Math.floor(Math.random() * regions.length)],
        cost: Math.round((Math.random() * 150 + 100) * 100) / 100,
        utilization: Math.round(Math.random() * 60 + 20),
        status: 'running',
        tags: {
          Environment: 'Production',
          Backup: 'Enabled'
        }
      });
    }

    console.log(`AWS: Retrieved ${resources.length} resources (simulated)`);
    return resources;
  }

  async getBudgets(): Promise<BudgetData[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 300));
    
    console.log('Fetching simulated AWS budgets');
    
    const budgetData: BudgetData[] = [
      {
        id: 'monthly-compute-budget',
        name: 'Monthly Compute Budget',
        amount: 5000,
        spent: Math.round((Math.random() * 3000 + 1000) * 100) / 100,
        period: 'monthly',
        provider: 'aws'
      },
      {
        id: 'quarterly-storage-budget',
        name: 'Quarterly Storage Budget',
        amount: 2000,
        spent: Math.round((Math.random() * 1200 + 400) * 100) / 100,
        period: 'quarterly',
        provider: 'aws'
      },
      {
        id: 'annual-total-budget',
        name: 'Annual Total Budget',
        amount: 50000,
        spent: Math.round((Math.random() * 35000 + 10000) * 100) / 100,
        period: 'yearly',
        provider: 'aws'
      }
    ];

    console.log(`AWS: Retrieved ${budgetData.length} budgets (simulated)`);
    return budgetData;
  }

  async testConnection(): Promise<boolean> {
    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));
    
    console.log('Testing simulated AWS connection');
    
    // Simulate occasional connection failures for realism
    const success = Math.random() > 0.1; // 90% success rate
    
    if (success) {
      console.log('AWS connection successful (simulated)');
      return true;
    } else {
      console.log('AWS connection failed (simulated)');
      return false;
    }
  }
}
