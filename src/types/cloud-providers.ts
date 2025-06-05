
export interface CloudCredentials {
  provider: 'aws' | 'azure' | 'gcp';
  accountName?: string; // Nome da conta para identificação
  // AWS
  accessKeyId?: string;
  secretAccessKey?: string;
  region?: string;
  accountId?: string;
  // Azure
  subscriptionId?: string;
  tenantId?: string;
  clientId?: string;
  clientSecret?: string;
  // GCP
  projectId?: string;
  serviceAccountKey?: string;
}

export interface CostData {
  date: string;
  amount: number;
  currency: string;
  service?: string;
  region?: string;
  resourceId?: string;
  resourceName?: string;
  resourceGroup?: string;
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
