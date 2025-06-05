import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cloudService } from '@/services/cloud-integration';
import { CloudCredentials } from '@/types/cloud-providers';
import { Cloud, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const CloudConnectionManager = () => {
  const [awsCredentials, setAwsCredentials] = useState<Partial<CloudCredentials>>({});
  const [azureCredentials, setAzureCredentials] = useState<Partial<CloudCredentials>>({});
  const [gcpCredentials, setGcpCredentials] = useState<Partial<CloudCredentials>>({});
  const [connectionStatus, setConnectionStatus] = useState<Record<string, boolean | null>>({});
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const handleConnect = async (provider: 'aws' | 'azure' | 'gcp', credentials: Partial<CloudCredentials>) => {
    setIsLoading({ ...isLoading, [provider]: true });
    
    try {
      cloudService.addProvider(provider, { ...credentials, provider } as CloudCredentials);
      const testResult = await cloudService.testAllConnections();
      setConnectionStatus({ ...connectionStatus, [provider]: testResult[provider] });
      
      if (testResult[provider]) {
        toast({
          title: "Conexão bem-sucedida",
          description: `Conectado com sucesso ao ${provider.toUpperCase()}`,
        });
      } else {
        toast({
          title: "Erro de conexão",
          description: `Falha ao conectar com ${provider.toUpperCase()}. Verifique suas credenciais.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(`Failed to connect to ${provider}:`, error);
      setConnectionStatus({ ...connectionStatus, [provider]: false });
      toast({
        title: "Erro de conexão",
        description: `Erro ao conectar: ${error}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading({ ...isLoading, [provider]: false });
    }
  };

  const getStatusBadge = (provider: string) => {
    const status = connectionStatus[provider];
    const loading = isLoading[provider];

    if (loading) {
      return (
        <Badge variant="secondary">
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          Conectando...
        </Badge>
      );
    }

    if (status === true) {
      return (
        <Badge className="bg-green-100 text-green-700">
          <CheckCircle className="h-3 w-3 mr-1" />
          Conectado
        </Badge>
      );
    }

    if (status === false) {
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          Erro de Conexão
        </Badge>
      );
    }

    return <Badge variant="outline">Não Conectado</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Cloud className="h-5 w-5" />
          <CardTitle>Conexões com Provedores de Nuvem</CardTitle>
        </div>
        <CardDescription>
          Configure as credenciais para conectar com AWS, Azure e Google Cloud Platform usando APIs reais
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="aws" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="aws" className="flex items-center space-x-2">
              <span>AWS</span>
              {getStatusBadge('aws')}
            </TabsTrigger>
            <TabsTrigger value="azure" className="flex items-center space-x-2">
              <span>Azure</span>
              {getStatusBadge('azure')}
            </TabsTrigger>
            <TabsTrigger value="gcp" className="flex items-center space-x-2">
              <span>GCP</span>
              {getStatusBadge('gcp')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="aws" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="aws-access-key">Access Key ID</Label>
                <Input
                  id="aws-access-key"
                  type="password"
                  placeholder="AKIA..."
                  value={awsCredentials.accessKeyId || ''}
                  onChange={(e) => setAwsCredentials({ ...awsCredentials, accessKeyId: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="aws-secret-key">Secret Access Key</Label>
                <Input
                  id="aws-secret-key"
                  type="password"
                  placeholder="..."
                  value={awsCredentials.secretAccessKey || ''}
                  onChange={(e) => setAwsCredentials({ ...awsCredentials, secretAccessKey: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="aws-region">Região</Label>
                <Input
                  id="aws-region"
                  placeholder="us-east-1"
                  value={awsCredentials.region || ''}
                  onChange={(e) => setAwsCredentials({ ...awsCredentials, region: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="aws-account-id">Account ID (opcional)</Label>
                <Input
                  id="aws-account-id"
                  placeholder="123456789012"
                  value={awsCredentials.accountId || ''}
                  onChange={(e) => setAwsCredentials({ ...awsCredentials, accountId: e.target.value })}
                />
              </div>
            </div>
            <Button 
              onClick={() => handleConnect('aws', awsCredentials)}
              disabled={isLoading.aws}
            >
              {isLoading.aws ? 'Conectando...' : 'Conectar AWS'}
            </Button>
          </TabsContent>

          <TabsContent value="azure" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="azure-subscription-id">Subscription ID</Label>
                <Input
                  id="azure-subscription-id"
                  type="password"
                  placeholder="..."
                  value={azureCredentials.subscriptionId || ''}
                  onChange={(e) => setAzureCredentials({ ...azureCredentials, subscriptionId: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="azure-tenant-id">Tenant ID</Label>
                <Input
                  id="azure-tenant-id"
                  type="password"
                  placeholder="..."
                  value={azureCredentials.tenantId || ''}
                  onChange={(e) => setAzureCredentials({ ...azureCredentials, tenantId: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="azure-client-id">Client ID</Label>
                <Input
                  id="azure-client-id"
                  type="password"
                  placeholder="..."
                  value={azureCredentials.clientId || ''}
                  onChange={(e) => setAzureCredentials({ ...azureCredentials, clientId: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="azure-client-secret">Client Secret</Label>
                <Input
                  id="azure-client-secret"
                  type="password"
                  placeholder="..."
                  value={azureCredentials.clientSecret || ''}
                  onChange={(e) => setAzureCredentials({ ...azureCredentials, clientSecret: e.target.value })}
                />
              </div>
            </div>
            <Button 
              onClick={() => handleConnect('azure', azureCredentials)}
              disabled={isLoading.azure}
            >
              {isLoading.azure ? 'Conectando...' : 'Conectar Azure'}
            </Button>
          </TabsContent>

          <TabsContent value="gcp" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gcp-project-id">Project ID</Label>
                <Input
                  id="gcp-project-id"
                  placeholder="meu-projeto-gcp"
                  value={gcpCredentials.projectId || ''}
                  onChange={(e) => setGcpCredentials({ ...gcpCredentials, projectId: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="gcp-service-account">Service Account Key (JSON)</Label>
                <Input
                  id="gcp-service-account"
                  type="password"
                  placeholder="Cole aqui o conteúdo do arquivo JSON..."
                  value={gcpCredentials.serviceAccountKey || ''}
                  onChange={(e) => setGcpCredentials({ ...gcpCredentials, serviceAccountKey: e.target.value })}
                />
              </div>
            </div>
            <Button 
              onClick={() => handleConnect('gcp', gcpCredentials)}
              disabled={isLoading.gcp}
            >
              {isLoading.gcp ? 'Conectando...' : 'Conectar GCP'}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
