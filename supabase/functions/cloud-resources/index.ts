
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ResourcesRequest {
  provider: 'aws' | 'azure' | 'gcp';
  credentials: any;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { provider, credentials }: ResourcesRequest = await req.json();
    
    console.log(`Fetching resources for ${provider}`);
    
    let resources = [];
    
    switch (provider) {
      case 'aws':
        resources = await fetchAWSResources(credentials);
        break;
      case 'azure':
        resources = await fetchAzureResources(credentials);
        break;
      case 'gcp':
        resources = await fetchGCPResources(credentials);
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    console.log(`Successfully retrieved ${resources.length} resources for ${provider}`);

    return new Response(JSON.stringify(resources), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in cloud-resources function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

async function fetchAWSResources(credentials: any) {
  console.log("AWS resources not yet implemented - returning empty array");
  return [];
}

async function fetchAzureResources(credentials: any) {
  console.log("Fetching REAL Azure resources with subscription:", credentials.subscriptionId);
  
  try {
    // Get Azure access token
    const accessToken = await getAzureAccessToken();
    console.log("Successfully obtained Azure access token for resources");
    
    // Call Azure Resource Manager API for all resources
    const resourcesUrl = `https://management.azure.com/subscriptions/${credentials.subscriptionId}/resources?api-version=2021-04-01&$top=1000`;
    
    console.log("Making request to Azure Resources API:", resourcesUrl);
    
    const resourcesResponse = await fetch(resourcesUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!resourcesResponse.ok) {
      const errorText = await resourcesResponse.text();
      console.error('Azure Resources API Error Response:', errorText);
      console.error('Azure Resources API Status:', resourcesResponse.status);
      
      throw new Error(`Azure Resources API returned ${resourcesResponse.status}: ${errorText}`);
    }

    const resourcesResult = await resourcesResponse.json();
    console.log(`Azure Resources API returned ${resourcesResult.value?.length || 0} resources`);
    
    if (!resourcesResult.value || resourcesResult.value.length === 0) {
      console.warn("Azure API returned no resources");
      console.warn("This could mean: no resources in subscription, insufficient permissions, or API issues");
      return [];
    }
    
    // Transform Azure data to our format
    const resources = resourcesResult.value.map((resource: any) => {
      const transformedResource = {
        id: resource.id,
        name: resource.name,
        type: resource.type || 'Unknown Resource Type',
        provider: 'azure',
        region: resource.location || 'Unknown Region',
        cost: 0, // We'd need Azure Cost Management API for real costs - setting to 0 for now
        utilization: null, // We'd need Azure Monitor for real utilization
        status: 'unknown', // Azure doesn't provide general status in resources API
        tags: resource.tags || {}
      };
      
      console.log(`Transformed resource: ${transformedResource.name} (${transformedResource.type}) in ${transformedResource.region}`);
      return transformedResource;
    });

    console.log(`Successfully transformed ${resources.length} Azure resources`);
    return resources;
    
  } catch (error) {
    console.error('Critical error fetching Azure resources:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      subscriptionId: credentials.subscriptionId
    });
    
    throw new Error(`Failed to fetch Azure resources: ${error.message}`);
  }
}

async function getAzureAccessToken(): Promise<string> {
  const tenantId = Deno.env.get('AZURE_TENANT_ID');
  const clientId = Deno.env.get('AZURE_CLIENT_ID');
  const clientSecret = Deno.env.get('AZURE_CLIENT_SECRET');

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error('Azure credentials not configured in Supabase secrets');
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

async function fetchGCPResources(credentials: any) {
  console.log("GCP resources not yet implemented - returning empty array");
  return [];
}

serve(handler);
