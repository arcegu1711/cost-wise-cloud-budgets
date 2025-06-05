
import { CloudCredentials, CostData, ResourceData, BudgetData } from '@/types/cloud-providers';

export class AWSConnector {
  private credentials: CloudCredentials;

  constructor(credentials: CloudCredentials) {
    this.credentials = credentials;
  }

  async getCostData(startDate: string, endDate: string): Promise<CostData[]> {
    try {
      console.log('Fetching real AWS cost data from', startDate, 'to', endDate);
      
      // AWS Cost Explorer API call
      const AWS = await import('aws-sdk');
      const costExplorer = new AWS.CostExplorer({
        accessKeyId: this.credentials.accessKeyId,
        secretAccessKey: this.credentials.secretAccessKey,
        region: this.credentials.region || 'us-east-1'
      });

      const params = {
        TimePeriod: {
          Start: startDate,
          End: endDate
        },
        Granularity: 'DAILY',
        Metrics: ['BlendedCost'],
        GroupBy: [
          {
            Type: 'DIMENSION',
            Key: 'SERVICE'
          }
        ]
      };

      const response = await costExplorer.getCostAndUsage(params).promise();
      
      const costData: CostData[] = [];
      
      response.ResultsByTime?.forEach(result => {
        result.Groups?.forEach(group => {
          const service = group.Keys?.[0] || 'Unknown';
          const amount = parseFloat(group.Metrics?.BlendedCost?.Amount || '0');
          
          if (amount > 0) {
            costData.push({
              date: result.TimePeriod?.Start || startDate,
              amount: amount,
              currency: group.Metrics?.BlendedCost?.Unit || 'USD',
              service: service,
              region: this.credentials.region
            });
          }
        });
      });

      console.log(`AWS: Retrieved ${costData.length} cost records`);
      return costData;
    } catch (error) {
      console.error('Error fetching real AWS cost data:', error);
      throw new Error(`Failed to fetch AWS cost data: ${error}`);
    }
  }

  async getResources(): Promise<ResourceData[]> {
    try {
      console.log('Fetching real AWS resources');
      
      const AWS = await import('aws-sdk');
      const ec2 = new AWS.EC2({
        accessKeyId: this.credentials.accessKeyId,
        secretAccessKey: this.credentials.secretAccessKey,
        region: this.credentials.region || 'us-east-1'
      });

      const response = await ec2.describeInstances().promise();
      const resources: ResourceData[] = [];

      response.Reservations?.forEach(reservation => {
        reservation.Instances?.forEach(instance => {
          if (instance.InstanceId) {
            const tags: Record<string, string> = {};
            instance.Tags?.forEach(tag => {
              if (tag.Key && tag.Value) {
                tags[tag.Key] = tag.Value;
              }
            });

            resources.push({
              id: instance.InstanceId,
              name: tags['Name'] || instance.InstanceId,
              type: `EC2 ${instance.InstanceType}`,
              provider: 'aws',
              region: instance.Placement?.AvailabilityZone?.slice(0, -1) || this.credentials.region || 'us-east-1',
              cost: 0, // Would need additional API calls to get cost
              utilization: 0, // Would need CloudWatch metrics
              status: instance.State?.Name === 'running' ? 'running' : 
                     instance.State?.Name === 'stopped' ? 'stopped' : 'terminated',
              tags: tags
            });
          }
        });
      });

      console.log(`AWS: Retrieved ${resources.length} resources`);
      return resources;
    } catch (error) {
      console.error('Error fetching real AWS resources:', error);
      throw new Error(`Failed to fetch AWS resources: ${error}`);
    }
  }

  async getBudgets(): Promise<BudgetData[]> {
    try {
      console.log('Fetching real AWS budgets');
      
      const AWS = await import('aws-sdk');
      const budgets = new AWS.Budgets({
        accessKeyId: this.credentials.accessKeyId,
        secretAccessKey: this.credentials.secretAccessKey,
        region: 'us-east-1' // Budgets API is only available in us-east-1
      });

      const response = await budgets.describeBudgets({
        AccountId: this.credentials.accountId || 'auto'
      }).promise();

      const budgetData: BudgetData[] = [];

      response.Budgets?.forEach(budget => {
        if (budget.BudgetName && budget.BudgetLimit?.Amount) {
          budgetData.push({
            id: budget.BudgetName,
            name: budget.BudgetName,
            amount: parseFloat(budget.BudgetLimit.Amount),
            spent: parseFloat(budget.CalculatedSpend?.ActualSpend?.Amount || '0'),
            period: budget.TimeUnit?.toLowerCase() as 'monthly' | 'quarterly' | 'yearly',
            provider: 'aws'
          });
        }
      });

      console.log(`AWS: Retrieved ${budgetData.length} budgets`);
      return budgetData;
    } catch (error) {
      console.error('Error fetching real AWS budgets:', error);
      throw new Error(`Failed to fetch AWS budgets: ${error}`);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing real AWS connection');
      
      const AWS = await import('aws-sdk');
      const sts = new AWS.STS({
        accessKeyId: this.credentials.accessKeyId,
        secretAccessKey: this.credentials.secretAccessKey,
        region: this.credentials.region || 'us-east-1'
      });

      await sts.getCallerIdentity().promise();
      console.log('AWS connection successful');
      return true;
    } catch (error) {
      console.error('AWS connection test failed:', error);
      return false;
    }
  }
}
