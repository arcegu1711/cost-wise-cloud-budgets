
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
  // Aqui implementaríamos a chamada real para AWS EC2 API
  console.log("Fetching AWS resources with credentials:", credentials.accessKeyId);
  
  const instanceTypes = ['t3.micro', 't3.small', 't3.medium', 'm5.large', 'c5.xlarge'];
  const regions = ['us-east-1', 'us-west-2', 'eu-west-1'];
  const statuses = ['running', 'stopped'];
  
  const resources = [];
  
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
  
  return resources;
}

async function fetchAzureResources(credentials: any) {
  console.log("Fetching Azure resources with subscription:", credentials.subscriptionId);
  
  try {
    // Get Azure access token
    const accessToken = await getAzureAccessToken();
    
    // Call Azure Resource Manager API for Virtual Machines
    const resourcesResponse = await fetch(
      `https://management.azure.com/subscriptions/${credentials.subscriptionId}/providers/Microsoft.Compute/virtualMachines?api-version=2023-03-01`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!resourcesResponse.ok) {
      console.error('Azure API Error:', await resourcesResponse.text());
      throw new Error(`Azure API returned ${resourcesResponse.status}`);
    }

    const resourcesResult = await resourcesResponse.json();
    console.log(`Retrieved ${resourcesResult.value?.length || 0} resources from Azure`);
    
    // Transform Azure data to our format
    const resources = (resourcesResult.value || []).map((vm: any) => ({
      id: vm.id,
      name: vm.name,
      type: `Virtual Machine ${vm.properties?.hardwareProfile?.vmSize || 'Unknown'}`,
      provider: 'azure',
      region: vm.location,
      cost: Math.round((Math.random() * 180 + 40) * 100) / 100, // We'd need Azure Cost Management API for real costs
      utilization: Math.round(Math.random() * 85 + 5), // We'd need Azure Monitor for real utilization
      status: vm.properties?.instanceView?.statuses?.[1]?.displayStatus || 'unknown',
      tags: vm.tags || {}
    }));

    return resources;
    
  } catch (error) {
    console.error('Error fetching Azure resources:', error);
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

async function fetchGCPResources(credentials: any) {
  // Aqui implementaríamos a chamada real para GCP Compute Engine API
  console.log("Fetching GCP resources for project:", credentials.projectId);
  
  const machineTypes = ['e2-micro', 'e2-small', 'e2-medium', 'n1-standard-1', 'n1-standard-2'];
  const zones = ['us-central1-a', 'us-east1-b', 'europe-west1-c'];
  const statuses = ['running', 'terminated', 'stopped'];
  
  const resources = [];
  
  // Generate 12-18 Compute Engine instances
  const instanceCount = 12 + Math.floor(Math.random() * 6);
  for (let i = 0; i < instanceCount; i++) {
    const machineType = machineTypes[Math.floor(Math.random() * machineTypes.length)];
    const zone = zones[Math.floor(Math.random() * zones.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const utilization = status === 'running' ? Math.random() * 75 + 10 : 0;
    
    resources.push({
      id: `projects/${credentials.projectId}/zones/${zone}/instances/instance-${i}`,
      name: `gce-instance-${i + 1}`,
      type: `Compute Engine ${machineType}`,
      provider: 'gcp',
      region: zone.substring(0, zone.lastIndexOf('-')),
      cost: Math.round((Math.random() * 160 + 30) * 100) / 100,
      utilization: Math.round(utilization),
      status: status,
      tags: {
        environment: Math.random() > 0.5 ? 'production' : 'development',
        team: `team-${Math.floor(Math.random() * 4) + 1}`
      }
    });
  }
  
  return resources;
}

serve(handler);
