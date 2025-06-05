
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
  // Aqui implementaríamos a chamada real para AWS Budgets API
  console.log("Fetching AWS budgets with credentials:", credentials.accessKeyId);
  
  return [
    {
      id: 'monthly-compute-budget',
      name: 'Monthly Compute Budget',
      amount: 5000,
      spent: Math.round((Math.random() * 3000 + 1000) * 100) / 100,
      period: 'monthly',
      provider: 'aws'
    },
    {
      id: 'quarterly-storage-budget',
      name: 'Quarterly Storage Budget',
      amount: 2000,
      spent: Math.round((Math.random() * 1200 + 400) * 100) / 100,
      period: 'quarterly',
      provider: 'aws'
    }
  ];
}

async function fetchAzureBudgets(credentials: any) {
  // Aqui implementaríamos a chamada real para Azure Consumption API
  console.log("Fetching Azure budgets with subscription:", credentials.subscriptionId);
  
  return [
    {
      id: 'monthly-vm-budget',
      name: 'Monthly VM Budget',
      amount: 4500,
      spent: Math.round((Math.random() * 2800 + 900) * 100) / 100,
      period: 'monthly',
      provider: 'azure'
    },
    {
      id: 'quarterly-database-budget',
      name: 'Quarterly Database Budget',
      amount: 3000,
      spent: Math.round((Math.random() * 1800 + 600) * 100) / 100,
      period: 'quarterly',
      provider: 'azure'
    }
  ];
}

async function fetchGCPBudgets(credentials: any) {
  // Aqui implementaríamos a chamada real para GCP Cloud Billing API
  console.log("Fetching GCP budgets for project:", credentials.projectId);
  
  return [
    {
      id: 'monthly-compute-budget',
      name: 'Monthly Compute Budget',
      amount: 3500,
      spent: Math.round((Math.random() * 2200 + 800) * 100) / 100,
      period: 'monthly',
      provider: 'gcp'
    },
    {
      id: 'quarterly-storage-budget',
      name: 'Quarterly Storage Budget',
      amount: 1500,
      spent: Math.round((Math.random() * 900 + 300) * 100) / 100,
      period: 'quarterly',
      provider: 'gcp'
    }
  ];
}

serve(handler);
