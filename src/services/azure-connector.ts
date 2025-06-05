
import { CloudCredentials, CostData, ResourceData, BudgetData } from '@/types/cloud-providers';

export class AzureConnector {
  private credentials: CloudCredentials;

  constructor(credentials: CloudCredentials) {
    this.credentials = credentials;
  }

  async getCostData(startDate: string, endDate: string): Promise<CostData[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 900 + Math.random() * 600));
    
    console.log('Fetching simulated Azure cost data from', startDate, 'to', endDate);
    
    // Generate realistic mock data
    const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
    const services = ['Virtual Machines', 'Storage', 'SQL Database', 'App Service', 'CDN', 'Load Balancer'];
    const regions = ['East US', 'West US 2', 'North Europe'];
    
    const costData: CostData[] = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date(new Date(startDate).getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      services.forEach(service => {
        regions.forEach(region => {
          const amount = Math.random() * 120 + 15; // $15-$135 per day per service per region
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

    console.log(`Azure: Retrieved ${costData.length} cost records (simulated)`);
    return costData;
  }

  async getResources(): Promise<ResourceData[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 700 + Math.random() * 500));
    
    console.log('Fetching simulated Azure resources');
    
    const vmSizes = ['Standard_B1s', 'Standard_B2s', 'Standard_D2s_v3', 'Standard_F4s_v2'];
    const regions = ['East US', 'West US 2', 'North Europe'];
    const statuses = ['running', 'stopped', 'deallocated'];
    
    const resources: ResourceData[] = [];
    
    // Generate 10-20 Virtual Machines
    const vmCount = 10 + Math.floor(Math.random() * 10);
    for (let i = 0; i < vmCount; i++) {
      const vmSize = vmSizes[Math.floor(Math.random() * vmSizes.length)];
      const region = regions[Math.floor(Math.random() * regions.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const utilization = status === 'running' ? Math.random() * 85 + 5 : 0;
      
      resources.push({
        id: `/subscriptions/${this.credentials.subscriptionId}/resourceGroups/rg-${i}/providers/Microsoft.Compute/virtualMachines/vm-${i}`,
        name: `vm-web-${i + 1}`,
        type: `Virtual Machine ${vmSize}`,
        provider: 'azure',
        region: region,
        cost: Math.round((Math.random() * 180 + 40) * 100) / 100,
        utilization: Math.round(utilization),
        status: status,
        tags: {
          Environment: Math.random() > 0.6 ? 'Production' : 'Development',
          CostCenter: `CC-${Math.floor(Math.random() * 3) + 1}`
        }
      });
    }

    // Add some SQL Databases
    for (let i = 0; i < 4; i++) {
      resources.push({
        id: `/subscriptions/${this.credentials.subscriptionId}/resourceGroups/rg-db/providers/Microsoft.Sql/servers/sqlsrv-${i}/databases/db-${i}`,
        name: `sqldb-app-${i + 1}`,
        type: 'SQL Database',
        provider: 'azure',
        region: regions[Math.floor(Math.random() * regions.length)],
        cost: Math.round((Math.random() * 200 + 80) * 100) / 100,
        utilization: Math.round(Math.random() * 70 + 15),
        status: 'running',
        tags: {
          Environment: 'Production',
          Tier: 'Standard'
        }
      });
    }

    console.log(`Azure: Retrieved ${resources.length} resources (simulated)`);
    return resources;
  }

  async getBudgets(): Promise<BudgetData[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));
    
    console.log('Fetching simulated Azure budgets');
    
    const budgetData: BudgetData[] = [
      {
        id: 'monthly-vm-budget',
        name: 'Monthly VM Budget',
        amount: 4500,
        spent: Math.round((Math.random() * 2800 + 900) * 100) / 100,
        period: 'monthly',
        provider: 'azure'
      },
      {
        id: 'quarterly-database-budget',
        name: 'Quarterly Database Budget',
        amount: 3000,
        spent: Math.round((Math.random() * 1800 + 600) * 100) / 100,
        period: 'quarterly',
        provider: 'azure'
      },
      {
        id: 'annual-subscription-budget',
        name: 'Annual Subscription Budget',
        amount: 60000,
        spent: Math.round((Math.random() * 42000 + 15000) * 100) / 100,
        period: 'yearly',
        provider: 'azure'
      }
    ];

    console.log(`Azure: Retrieved ${budgetData.length} budgets (simulated)`);
    return budgetData;
  }

  async testConnection(): Promise<boolean> {
    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 800));
    
    console.log('Testing simulated Azure connection');
    
    // Simulate occasional connection failures for realism
    const success = Math.random() > 0.15; // 85% success rate
    
    if (success) {
      console.log('Azure connection successful (simulated)');
      return true;
    } else {
      console.log('Azure connection failed (simulated)');
      return false;
    }
  }
}
