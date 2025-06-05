
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BudgetsRequest {
  provider: 'aws' | 'azure' | 'gcp';
  credentials: any;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { provider, credentials }: BudgetsRequest = await req.json();
    
    console.log(`Fetching budgets for ${provider}`);
    
    let budgets = [];
    
    switch (provider) {
      case 'aws':
        budgets = await fetchAWSBudgets(credentials);
        break;
      case 'azure':
        budgets = await fetchAzureBudgets(credentials);
        break;
      case 'gcp':
        budgets = await fetchGCPBudgets(credentials);
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    console.log(`Successfully retrieved ${budgets.length} budgets for ${provider}`);

    return new Response(JSON.stringify(budgets), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in cloud-budgets function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

async function fetchAWSBudgets(credentials: any) {
  console.log("AWS budgets not yet implemented - returning empty array");
  return [];
}

async function fetchAzureBudgets(credentials: any) {
  console.log("Fetching REAL Azure budgets with subscription:", credentials.subscriptionId);
  
  try {
    // Get Azure access token
    const accessToken = await getAzureAccessToken();
    console.log("Successfully obtained Azure access token for budgets");
    
    // Call Azure Consumption API for budgets
    const budgetsUrl = `https://management.azure.com/subscriptions/${credentials.subscriptionId}/providers/Microsoft.Consumption/budgets?api-version=2021-10-01`;
    
    console.log("Making request to Azure Budgets API:", budgetsUrl);
    
    const budgetsResponse = await fetch(budgetsUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!budgetsResponse.ok) {
      const errorText = await budgetsResponse.text();
      console.error('Azure Budgets API Error Response:', errorText);
      console.error('Azure Budgets API Status:', budgetsResponse.status);
      
      // Azure Budgets API often returns 404 if no budgets are configured
      if (budgetsResponse.status === 404) {
        console.warn("No budgets configured in Azure subscription");
        return [];
      }
      
      throw new Error(`Azure Budgets API returned ${budgetsResponse.status}: ${errorText}`);
    }

    const budgetsResult = await budgetsResponse.json();
    console.log(`Azure Budgets API returned ${budgetsResult.value?.length || 0} budgets`);
    
    if (!budgetsResult.value || budgetsResult.value.length === 0) {
      console.warn("No budgets found in Azure subscription");
      return [];
    }
    
    // Transform Azure budget data to our format
    const budgets = budgetsResult.value.map((budget: any) => {
      const currentSpend = budget.properties?.currentSpend?.amount || 0;
      const budgetAmount = budget.properties?.amount || 0;
      
      const transformedBudget = {
        id: budget.name || budget.id,
        name: budget.properties?.displayName || budget.name || 'Unknown Budget',
        amount: parseFloat(budgetAmount),
        spent: parseFloat(currentSpend),
        period: budget.properties?.timeGrain?.toLowerCase() || 'monthly',
        provider: 'azure'
      };
      
      console.log(`Transformed budget: ${transformedBudget.name} - ${transformedBudget.spent}/${transformedBudget.amount} (${transformedBudget.period})`);
      return transformedBudget;
    });

    console.log(`Successfully transformed ${budgets.length} Azure budgets`);
    return budgets;
    
  } catch (error) {
    console.error('Critical error fetching Azure budgets:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      subscriptionId: credentials.subscriptionId
    });
    
    // For budgets, we can return empty array if there's an error since budgets are optional
    console.warn("Returning empty budgets array due to error");
    return [];
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

async function fetchGCPBudgets(credentials: any) {
  console.log("GCP budgets not yet implemented - returning empty array");
  return [];
}

serve(handler);
