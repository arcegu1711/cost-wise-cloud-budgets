
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

    console.log(`Successfully retrieved ${costData.length} cost records for ${provider}`);

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
  console.log("AWS cost data not yet implemented - returning empty array");
  return [];
}

async function fetchAzureCostData(credentials: any, startDate: string, endDate: string) {
  console.log("Fetching REAL Azure cost data with subscription:", credentials.subscriptionId);
  
  try {
    // Get Azure access token
    const accessToken = await getAzureAccessToken();
    console.log("Successfully obtained Azure access token");
    
    // Format dates for Azure API (they expect YYYY-MM-DD format)
    const formattedStartDate = startDate;
    const formattedEndDate = endDate;
    
    console.log(`Calling Azure Consumption API for period ${formattedStartDate} to ${formattedEndDate}`);
    
    // Call Azure Consumption API for usage details
    const usageUrl = `https://management.azure.com/subscriptions/${credentials.subscriptionId}/providers/Microsoft.Consumption/usageDetails?api-version=2021-10-01&$filter=properties/usageStart ge '${formattedStartDate}' and properties/usageEnd le '${formattedEndDate}'&$top=1000`;
    
    console.log("Making request to Azure API:", usageUrl);
    
    const costResponse = await fetch(usageUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!costResponse.ok) {
      const errorText = await costResponse.text();
      console.error('Azure Consumption API Error Response:', errorText);
      console.error('Azure API Status:', costResponse.status);
      console.error('Azure API Status Text:', costResponse.statusText);
      
      // Don't return empty data - throw error so we know there's a problem
      throw new Error(`Azure Consumption API returned ${costResponse.status}: ${errorText}`);
    }

    const costResult = await costResponse.json();
    console.log(`Azure API returned ${costResult.value?.length || 0} usage records`);
    
    if (!costResult.value || costResult.value.length === 0) {
      console.warn("Azure API returned no usage data for the specified period");
      console.warn("This could mean: no usage in period, insufficient permissions, or API issues");
      return [];
    }
    
    // Transform Azure data to our format
    const costData = costResult.value.map((item: any) => {
      const cost = parseFloat(item.properties.pretaxCost || item.properties.cost || 0);
      const transformedItem = {
        date: item.properties.date || item.properties.usageStart?.split('T')[0] || formattedStartDate,
        amount: cost,
        currency: item.properties.billingCurrency || 'USD',
        service: item.properties.meterCategory || item.properties.consumedService || 'Unknown Service',
        region: item.properties.resourceLocation || item.properties.location || 'Unknown Region'
      };
      
      console.log(`Transformed cost item: ${transformedItem.service} in ${transformedItem.region} = ${transformedItem.currency} ${transformedItem.amount} on ${transformedItem.date}`);
      return transformedItem;
    });

    console.log(`Successfully transformed ${costData.length} Azure cost records`);
    return costData;
    
  } catch (error) {
    console.error('Critical error fetching Azure cost data:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      subscriptionId: credentials.subscriptionId
    });
    
    // Re-throw the error instead of returning empty array so we know there's a problem
    throw new Error(`Failed to fetch Azure cost data: ${error.message}`);
  }
}

async function getAzureAccessToken(): Promise<string> {
  const tenantId = Deno.env.get('AZURE_TENANT_ID');
  const clientId = Deno.env.get('AZURE_CLIENT_ID');
  const clientSecret = Deno.env.get('AZURE_CLIENT_SECRET');

  console.log('Azure credentials check:', {
    tenantId: tenantId ? 'Present' : 'Missing',
    clientId: clientId ? 'Present' : 'Missing',
    clientSecret: clientSecret ? 'Present' : 'Missing'
  });

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error('Azure credentials not configured in Supabase secrets. Please configure AZURE_TENANT_ID, AZURE_CLIENT_ID, and AZURE_CLIENT_SECRET');
  }

  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  
  const body = new URLSearchParams({
    'client_id': clientId,
    'client_secret': clientSecret,
    'scope': 'https://management.azure.com/.default',
    'grant_type': 'client_credentials'
  });

  console.log('Requesting Azure access token from:', tokenUrl);

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Azure token request failed:', {
      status: response.status,
      statusText: response.statusText,
      error: errorText
    });
    throw new Error(`Failed to get Azure access token: ${response.status} - ${errorText}`);
  }

  const tokenData = await response.json();
  console.log('Successfully obtained Azure access token');
  return tokenData.access_token;
}

async function fetchGCPCostData(credentials: any, startDate: string, endDate: string) {
  console.log("GCP cost data not yet implemented - returning empty array");
  return [];
}

serve(handler);
