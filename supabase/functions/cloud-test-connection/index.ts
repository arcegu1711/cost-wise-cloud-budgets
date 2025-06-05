
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TestConnectionRequest {
  provider: 'aws' | 'azure' | 'gcp';
  credentials: any;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { provider, credentials }: TestConnectionRequest = await req.json();
    
    console.log(`Testing connection for ${provider}`);
    
    let success = false;
    
    switch (provider) {
      case 'aws':
        success = await testAWSConnection(credentials);
        break;
      case 'azure':
        success = await testAzureConnection(credentials);
        break;
      case 'gcp':
        success = await testGCPConnection(credentials);
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    return new Response(JSON.stringify({ success }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in cloud-test-connection function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 200, // Return 200 but with success: false
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

async function testAWSConnection(credentials: any): Promise<boolean> {
  // Aqui implementaríamos a chamada real para AWS STS GetCallerIdentity
  console.log("Testing AWS connection with credentials:", credentials.accessKeyId);
  
  // Simulate connection test with some validation
  if (!credentials.accessKeyId || !credentials.secretAccessKey) {
    throw new Error("Missing AWS credentials");
  }
  
  // Simulate API delay and occasional failures
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));
  
  const success = Math.random() > 0.1; // 90% success rate
  console.log(`AWS connection test result: ${success}`);
  
  return success;
}

async function testAzureConnection(credentials: any): Promise<boolean> {
  // Aqui implementaríamos a chamada real para Azure Resource Manager API
  console.log("Testing Azure connection with subscription:", credentials.subscriptionId);
  
  // Simulate connection test with some validation
  if (!credentials.subscriptionId || !credentials.tenantId || !credentials.clientId || !credentials.clientSecret) {
    throw new Error("Missing Azure credentials");
  }
  
  // Simulate API delay and occasional failures
  await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 800));
  
  const success = Math.random() > 0.15; // 85% success rate
  console.log(`Azure connection test result: ${success}`);
  
  return success;
}

async function testGCPConnection(credentials: any): Promise<boolean> {
  // Aqui implementaríamos a chamada real para GCP Resource Manager API
  console.log("Testing GCP connection for project:", credentials.projectId);
  
  // Simulate connection test with some validation
  if (!credentials.projectId || !credentials.serviceAccountKey) {
    throw new Error("Missing GCP credentials");
  }
  
  try {
    JSON.parse(credentials.serviceAccountKey);
  } catch {
    throw new Error("Invalid GCP service account key JSON");
  }
  
  // Simulate API delay and occasional failures
  await new Promise(resolve => setTimeout(resolve, 1100 + Math.random() * 900));
  
  const success = Math.random() > 0.12; // 88% success rate
  console.log(`GCP connection test result: ${success}`);
  
  return success;
}

serve(handler);
