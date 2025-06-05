
export interface CloudCredentials {
  provider: 'aws' | 'azure' | 'gcp';
  accessKeyId?: string;
  secretAccessKey?: string;
  region?: string;
  subscriptionId?: string;
  tenantId?: string;
  clientId?: string;
  clientSecret?: string;
  projectId?: string;
  serviceAccountKey?: string;
}

export interface CostData {
  date: string;
  amount: number;
  currency: string;
  service?: string;
  region?: string;
}

export interface ResourceData {
  id: string;
  name: string;
  type: string;
  provider: 'aws' | 'azure' | 'gcp';
  region: string;
  cost: number;
  utilization: number;
  status: 'running' | 'stopped' | 'terminated';
  tags?: Record<string, string>;
}

export interface BudgetData {
  id: string;
  name: string;
  amount: number;
  spent: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  provider: 'aws' | 'azure' | 'gcp';
}
