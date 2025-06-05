
import { CloudCredentials, CostData, ResourceData, BudgetData } from '@/types/cloud-providers';
import { CostExplorerClient, GetCostAndUsageCommand, GetDimensionValuesCommand } from '@aws-sdk/client-cost-explorer';
import { EC2Client, DescribeInstancesCommand } from '@aws-sdk/client-ec2';
import { BudgetsClient, DescribeBudgetsCommand } from '@aws-sdk/client-budgets';

export class AWSConnector {
  private credentials: CloudCredentials;
  private costExplorerClient: CostExplorerClient;
  private ec2Client: EC2Client;
  private budgetsClient: BudgetsClient;

  constructor(credentials: CloudCredentials) {
    this.credentials = credentials;
    
    const awsConfig = {
      region: credentials.region || 'us-east-1',
      credentials: {
        accessKeyId: credentials.accessKeyId!,
        secretAccessKey: credentials.secretAccessKey!,
      },
    };

    this.costExplorerClient = new CostExplorerClient(awsConfig);
    this.ec2Client = new EC2Client(awsConfig);
    this.budgetsClient = new BudgetsClient(awsConfig);
  }

  async getCostData(startDate: string, endDate: string): Promise<CostData[]> {
    try {
      console.log('Fetching real AWS cost data from', startDate, 'to', endDate);
      
      const command = new GetCostAndUsageCommand({
        TimePeriod: {
          Start: startDate,
          End: endDate,
        },
        Granularity: 'DAILY',
        Metrics: ['BlendedCost'],
        GroupBy: [
          {
            Type: 'DIMENSION',
            Key: 'SERVICE',
          },
        ],
      });

      const response = await this.costExplorerClient.send(command);
      const costData: CostData[] = [];

      response.ResultsByTime?.forEach((result) => {
        const date = result.TimePeriod?.Start || '';
        
        result.Groups?.forEach((group) => {
          const service = group.Keys?.[0] || 'Unknown';
          const amount = parseFloat(group.Metrics?.BlendedCost?.Amount || '0');
          
          if (amount > 0) {
            costData.push({
              date,
              amount,
              currency: 'USD',
              service,
            });
          }
        });
      });

      return costData;
    } catch (error) {
      console.error('Error fetching AWS cost data:', error);
      throw new Error(`Failed to fetch AWS cost data: ${error}`);
    }
  }

  async getResources(): Promise<ResourceData[]> {
    try {
      console.log('Fetching real AWS resources');
      
      const command = new DescribeInstancesCommand({});
      const response = await this.ec2Client.send(command);
      const resources: ResourceData[] = [];

      response.Reservations?.forEach((reservation) => {
        reservation.Instances?.forEach((instance) => {
          if (instance.InstanceId) {
            const tags: Record<string, string> = {};
            instance.Tags?.forEach((tag) => {
              if (tag.Key && tag.Value) {
                tags[tag.Key] = tag.Value;
              }
            });

            resources.push({
              id: instance.InstanceId,
              name: tags.Name || instance.InstanceId,
              type: `EC2 ${instance.InstanceType}`,
              provider: 'aws',
              region: instance.Placement?.AvailabilityZone?.slice(0, -1) || 'unknown',
              cost: 0, // Cost would need to be calculated separately
              utilization: 0, // Would need CloudWatch metrics
              status: instance.State?.Name === 'running' ? 'running' : 
                     instance.State?.Name === 'stopped' ? 'stopped' : 'terminated',
              tags,
            });
          }
        });
      });

      return resources;
    } catch (error) {
      console.error('Error fetching AWS resources:', error);
      throw new Error(`Failed to fetch AWS resources: ${error}`);
    }
  }

  async getBudgets(): Promise<BudgetData[]> {
    try {
      console.log('Fetching real AWS budgets');
      
      const command = new DescribeBudgetsCommand({
        AccountId: this.credentials.accountId || 'self',
      });

      const response = await this.budgetsClient.send(command);
      const budgets: BudgetData[] = [];

      response.Budgets?.forEach((budget) => {
        if (budget.BudgetName && budget.BudgetLimit?.Amount) {
          budgets.push({
            id: budget.BudgetName,
            name: budget.BudgetName,
            amount: parseFloat(budget.BudgetLimit.Amount),
            spent: parseFloat(budget.CalculatedSpend?.ActualSpend?.Amount || '0'),
            period: budget.TimeUnit?.toLowerCase() as 'monthly' | 'quarterly' | 'yearly',
            provider: 'aws',
          });
        }
      });

      return budgets;
    } catch (error) {
      console.error('Error fetching AWS budgets:', error);
      throw new Error(`Failed to fetch AWS budgets: ${error}`);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing real AWS connection');
      
      // Simple test to verify credentials work
      const command = new GetDimensionValuesCommand({
        TimePeriod: {
          Start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          End: new Date().toISOString().split('T')[0],
        },
        Dimension: 'SERVICE',
      });

      await this.costExplorerClient.send(command);
      return true;
    } catch (error) {
      console.error('AWS connection test failed:', error);
      return false;
    }
  }
}
