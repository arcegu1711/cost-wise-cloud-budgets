
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
  console.log("Fetching Azure cost data with subscription:", credentials.subscriptionId);
  
  try {
    // Get Azure access token
    const accessToken = await getAzureAccessToken();
    
    // Call Azure Consumption API for cost data
    const costResponse = await fetch(
      `https://management.azure.com/subscriptions/${credentials.subscriptionId}/providers/Microsoft.Consumption/usageDetails?api-version=2021-10-01&$filter=properties/usageStart ge '${startDate}' and properties/usageEnd le '${endDate}'`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!costResponse.ok) {
      console.error('Azure API Error:', await costResponse.text());
      throw new Error(`Azure API returned ${costResponse.status}`);
    }

    const costResult = await costResponse.json();
    console.log(`Retrieved ${costResult.value?.length || 0} cost records from Azure`);
    
    // Transform Azure data to our format
    const costData = (costResult.value || []).map((item: any) => ({
      date: item.properties.date,
      amount: parseFloat(item.properties.pretaxCost || item.properties.cost || 0),
      currency: item.properties.billingCurrency || 'USD',
      service: item.properties.meterCategory || 'Unknown Service',
      region: item.properties.resourceLocation || 'Unknown Region'
    }));

    return costData;
    
  } catch (error) {
    console.error('Error fetching Azure cost data:', error);
    // Return empty array instead of throwing to avoid breaking the whole flow
    return [];
  }
}

async function getAzureAccessToken(): Promise<string> {
  const tenantId = Deno.env.get('AZURE_TENANT_ID');
  const clientId = Deno.env.get('AZURE_CLIENT_ID');
  const clientSecret = Deno.env.get('AZURE_CLIENT_SECRET');

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error('Azure credentials not configured');
  }

  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  
  const body = new URLSearchParams({
    'client_id': clientId,
    'client_secret': clientSecret,
    'scope': 'https://management.azure.com/.default',
    'grant_type': 'client_credentials'
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Azure token error:', errorText);
    throw new Error(`Failed to get Azure access token: ${response.status}`);
  }

  const tokenData = await response.json();
  return tokenData.access_token;
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
