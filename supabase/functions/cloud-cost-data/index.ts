
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CostDataRequest {
  provider: 'aws' | 'azure' | 'gcp';
  credentials: any;
  startDate: string;
  endDate: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { provider, credentials, startDate, endDate }: CostDataRequest = await req.json();
    
    console.log(`Fetching cost data for ${provider} from ${startDate} to ${endDate}`);
    
    let costData = [];
    
    switch (provider) {
      case 'aws':
        costData = await fetchAWSCostData(credentials, startDate, endDate);
        break;
      case 'azure':
        costData = await fetchAzureCostData(credentials, startDate, endDate);
        break;
      case 'gcp':
        costData = await fetchGCPCostData(credentials, startDate, endDate);
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    return new Response(JSON.stringify(costData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in cloud-cost-data function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

async function fetchAWSCostData(credentials: any, startDate: string, endDate: string) {
  // Aqui implementaríamos a chamada real para AWS Cost Explorer API
  // Por enquanto, retornamos dados simulados
  console.log("Fetching AWS cost data with credentials:", credentials.accessKeyId);
  
  const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
  const services = ['EC2-Instance', 'S3', 'RDS', 'Lambda', 'CloudFront', 'ELB'];
  const regions = ['us-east-1', 'us-west-2', 'eu-west-1'];
  
  const costData = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date(new Date(startDate).getTime() + i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    
    services.forEach(service => {
      regions.forEach(region => {
        const amount = Math.random() * 100 + 10;
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
  
  return costData;
}

async function fetchAzureCostData(credentials: any, startDate: string, endDate: string) {
  // Aqui implementaríamos a chamada real para Azure Consumption API
  console.log("Fetching Azure cost data with subscription:", credentials.subscriptionId);
  
  const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
  const services = ['Virtual Machines', 'Storage', 'SQL Database', 'App Service', 'CDN', 'Load Balancer'];
  const regions = ['East US', 'West US 2', 'North Europe'];
  
  const costData = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date(new Date(startDate).getTime() + i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    
    services.forEach(service => {
      regions.forEach(region => {
        const amount = Math.random() * 120 + 15;
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
  
  return costData;
}

async function fetchGCPCostData(credentials: any, startDate: string, endDate: string) {
  // Aqui implementaríamos a chamada real para GCP Cloud Billing API
  console.log("Fetching GCP cost data for project:", credentials.projectId);
  
  const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
  const services = ['Compute Engine', 'Cloud Storage', 'Cloud SQL', 'Cloud Functions', 'Cloud CDN', 'Cloud Load Balancing'];
  const regions = ['us-central1', 'us-east1', 'europe-west1'];
  
  const costData = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date(new Date(startDate).getTime() + i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    
    services.forEach(service => {
      regions.forEach(region => {
        const amount = Math.random() * 90 + 12;
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
  
  return costData;
}

serve(handler);
