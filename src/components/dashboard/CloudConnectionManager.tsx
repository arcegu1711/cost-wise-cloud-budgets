
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cloudService } from '@/services/cloud-integration';
import { CloudCredentials } from '@/types/cloud-providers';
import { Cloud, CheckCircle, XCircle, Loader2, Trash2, Activity, Database, DollarSign, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCloudConnections } from '@/hooks/useCloudConnections';
import { useCloudData } from '@/hooks/useCloudData';

export const CloudConnectionManager = () => {
  const [awsCredentials, setAwsCredentials] = useState<Partial<CloudCredentials>>({});
  const [azureCredentials, setAzureCredentials] = useState<Partial<CloudCredentials>>({});
  const [gcpCredentials, setGcpCredentials] = useState<Partial<CloudCredentials>>({});
  
  const { 
    connectionStatus, 
    isLoading, 
    setIsLoading, 
    saveConnection, 
    removeConnection,
    getConnectedProviders,
    getConnectionData
  } = useCloudConnections();
  
  const {
    costData,
    resourcesData,
    budgetsData,
    isLoading: dataLoading,
    costLoading,
    resourcesLoading,
    budgetsLoading,
    syncCloudData
  } = useCloudData();
  
  const { toast } = useToast();

  const handleConnect = async (provider: 'aws' | 'azure' | 'gcp', credentials: Partial<CloudCredentials>) => {
    setIsLoading({ ...isLoading, [provider]: true });
    
    try {
      cloudService.addProvider(provider, { ...credentials, provider } as CloudCredentials);
      const testResult = await cloudService.testAllConnections();
      const isConnected = testResult[provider];
      
      // Save connection to database
      await saveConnection(provider, { ...credentials, provider } as CloudCredentials, isConnected);
      
      if (isConnected) {
        toast({
          title: "Conexão bem-sucedida",
          description: `Conectado com sucesso ao ${provider.toUpperCase()}`,
        });
        
        // Clear credentials form
        if (provider === 'aws') setAwsCredentials({});
        if (provider === 'azure') setAzureCredentials({});
        if (provider === 'gcp') setGcpCredentials({});
        
        // Trigger data sync
        setTimeout(() => syncCloudData(), 1000);
      } else {
        toast({
          title: "Erro de conexão",
          description: `Falha ao conectar com ${provider.toUpperCase()}. Verifique suas credenciais.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(`Failed to connect to ${provider}:`, error);
      await saveConnection(provider, { ...credentials, provider } as CloudCredentials, false);
      toast({
        title: "Erro de conexão",
        description: `Erro ao conectar: ${error}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading({ ...isLoading, [provider]: false });
    }
  };

  const handleDisconnect = async (provider: string) => {
    await removeConnection(provider);
  };

  const handleSyncData = async () => {
    toast({
      title: "Sincronizando dados",
      description: "Buscando dados atualizados dos provedores...",
    });
    await syncCloudData();
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
        <div className="flex items-center space-x-2">
          <Badge className="bg-green-100 text-green-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            Conectado
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDisconnect(provider)}
            className="h-6 px-2"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
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

  const getDataStatus = (provider: string) => {
    const providerCostData = costData[provider] || [];
    const providerResources = resourcesData.filter(r => r.provider === provider);
    const providerBudgets = budgetsData.filter(b => b.provider === provider);
    
    return {
      costs: providerCostData.length,
      resources: providerResources.length,
      budgets: providerBudgets.length
    };
  };

  const getProviderDisplayName = (provider: string) => {
    const connectionData = getConnectionData(provider);
    const accountName = connectionData?.credentials?.accountName;
    
    if (accountName) {
      return (
        <div>
          <h3 className="font-semibold capitalize">{provider}</h3>
          <p className="text-sm text-muted-foreground">{accountName}</p>
        </div>
      );
    }
    
    return <h3 className="font-semibold capitalize">{provider}</h3>;
  };

  return (
    <div className="space-y-6">
      {/* Connection Status Overview */}
      {getConnectedProviders().length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <CardTitle>Status de Conexão e Dados</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSyncData}
                disabled={dataLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${dataLoading ? 'animate-spin' : ''}`} />
                Sincronizar Dados
              </Button>
            </div>
            <CardDescription>
              Dados persistidos no banco de dados e atualizados automaticamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {getConnectedProviders().map(provider => {
                const dataStatus = getDataStatus(provider);
                return (
                  <div key={provider} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      {getProviderDisplayName(provider)}
                      {getStatusBadge(provider)}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-blue-600" />
                          <span>Dados de Custo</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {costLoading ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <span className="font-medium">{dataStatus.costs} registros</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <Database className="h-4 w-4 text-green-600" />
                          <span>Recursos</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {resourcesLoading ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <span className="font-medium">{dataStatus.resources} recursos</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <Activity className="h-4 w-4 text-purple-600" />
                          <span>Orçamentos</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {budgetsLoading ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <span className="font-medium">{dataStatus.budgets} orçamentos</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t">
                      <div className="text-xs text-muted-foreground">
                        {dataLoading ? (
                          <div className="flex items-center space-x-1">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span>Sincronizando dados...</span>
                          </div>
                        ) : (
                          <span>Dados persistidos no banco de dados</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cloud Provider Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Cloud className="h-5 w-5" />
            <CardTitle>Conexões com Provedores de Nuvem</CardTitle>
          </div>
          <CardDescription>
            Configure as credenciais para conectar com AWS, Azure e Google Cloud Platform
          </CardDescription>
          {getConnectedProviders().length > 0 && (
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-sm text-muted-foreground">Provedores conectados:</span>
              {getConnectedProviders().map(provider => (
                <Badge key={provider} variant="outline" className="capitalize">
                  {provider}
                </Badge>
              ))}
            </div>
          )}
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
                <div className="col-span-2">
                  <Label htmlFor="aws-account-name">Nome da Conta</Label>
                  <Input
                    id="aws-account-name"
                    placeholder="Exemplo: Produção AWS, Desenvolvimento AWS"
                    value={awsCredentials.accountName || ''}
                    onChange={(e) => setAwsCredentials({ ...awsCredentials, accountName: e.target.value })}
                  />
                </div>
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
                <div className="col-span-2">
                  <Label htmlFor="azure-account-name">Nome da Conta</Label>
                  <Input
                    id="azure-account-name"
                    placeholder="Exemplo: Produção Azure, Desenvolvimento Azure"
                    value={azureCredentials.accountName || ''}
                    onChange={(e) => setAzureCredentials({ ...azureCredentials, accountName: e.target.value })}
                  />
                </div>
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
                <div className="col-span-2">
                  <Label htmlFor="gcp-account-name">Nome da Conta</Label>
                  <Input
                    id="gcp-account-name"
                    placeholder="Exemplo: Produção GCP, Desenvolvimento GCP"
                    value={gcpCredentials.accountName || ''}
                    onChange={(e) => setGcpCredentials({ ...gcpCredentials, accountName: e.target.value })}
                  />
                </div>
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
    </div>
  );
};
