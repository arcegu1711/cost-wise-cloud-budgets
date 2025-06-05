
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CostOverview } from "@/components/dashboard/CostOverview";
import { BudgetManagement } from "@/components/dashboard/BudgetManagement";
import { OptimizationRecommendations } from "@/components/dashboard/OptimizationRecommendations";
import { ResourceUsage } from "@/components/dashboard/ResourceUsage";
import { CloudConnectionManager } from "@/components/dashboard/CloudConnectionManager";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AlertTriangle, TrendingUp, TrendingDown, DollarSign, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCloudData } from "@/hooks/useCloudData";
import { formatCurrency, formatCurrencyCompact } from "@/utils/currency";

const Index = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const { profile } = useAuth();
  const { 
    totalSpend, 
    budgetUtilization, 
    totalBudgetSpent, 
    totalBudget, 
    totalResources, 
    connectedProviders,
    isLoading 
  } = useCloudData();

  // Calculate potential savings (15% of total spend)
  const potentialSavings = totalSpend * 0.15;
  const remainingBudget = totalBudget - totalBudgetSpent;

  console.log('=== INDEX PAGE DEBUG ===');
  console.log('Total spend from useCloudData:', totalSpend);
  console.log('Connected providers:', connectedProviders);
  console.log('Is loading:', isLoading);
  console.log('=== END INDEX DEBUG ===');

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <DashboardHeader />
        
        <main className="container mx-auto px-4 py-8">
          {/* Welcome Message */}
          {profile && (
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-slate-900">
                Bem-vindo, {profile.full_name}!
              </h2>
              <p className="text-slate-600">
                Aqui está um resumo dos seus custos de nuvem.
              </p>
              {connectedProviders.length === 0 && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800">
                    <strong>Dica:</strong> Conecte seus provedores de nuvem na aba "Cloud Connections" para ver dados reais aqui.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gasto Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Carregando...</span>
                  </div>
                ) : connectedProviders.length > 0 ? (
                  <>
                    <div className="text-2xl font-bold">
                      {formatCurrency(totalSpend)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {totalSpend > 0 ? (
                        <span className="text-red-500 inline-flex items-center">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Dados reais do Azure
                        </span>
                      ) : (
                        'Nenhum custo encontrado'
                      )}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-gray-400">
                      --
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Conecte um provedor para ver dados
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Utilização do Orçamento</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Carregando...</span>
                  </div>
                ) : connectedProviders.length > 0 && totalBudget > 0 ? (
                  <>
                    <div className="text-2xl font-bold">
                      {budgetUtilization.toFixed(0)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrencyCompact(remainingBudget)} restantes
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-gray-400">
                      --
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {connectedProviders.length === 0 ? 'Conecte um provedor' : 'Nenhum orçamento configurado'}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Otimização de Custos</CardTitle>
                <TrendingDown className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Carregando...</span>
                  </div>
                ) : connectedProviders.length > 0 && totalSpend > 0 ? (
                  <>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(potentialSavings)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Economia potencial mensal
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-gray-400">
                      --
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Conecte um provedor para ver economia
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recursos Ativos</CardTitle>
                <div className="h-4 w-4 bg-blue-600 rounded-full" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Carregando...</span>
                  </div>
                ) : connectedProviders.length > 0 ? (
                  <>
                    <div className="text-2xl font-bold">
                      {totalResources.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Em {connectedProviders.length} {connectedProviders.length === 1 ? 'provedor' : 'provedores'}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-gray-400">
                      --
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Conecte um provedor para ver recursos
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Connected Providers Status */}
          {connectedProviders.length > 0 && (
            <div className="mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Provedores Conectados</h3>
                      <p className="text-sm text-muted-foreground">
                        Dados sendo coletados em tempo real do Azure
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {connectedProviders.map(provider => (
                        <Badge key={provider} className="capitalize">
                          {provider}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Visão Geral de Custos</TabsTrigger>
              <TabsTrigger value="budgets">Gestão de Orçamentos</TabsTrigger>
              <TabsTrigger value="optimization">Otimização</TabsTrigger>
              <TabsTrigger value="resources">Uso de Recursos</TabsTrigger>
              <TabsTrigger value="connections">Conexões Cloud</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <CostOverview selectedPeriod={selectedPeriod} onPeriodChange={setSelectedPeriod} />
            </TabsContent>

            <TabsContent value="budgets" className="space-y-6">
              <BudgetManagement />
            </TabsContent>

            <TabsContent value="optimization" className="space-y-6">
              <OptimizationRecommendations />
            </TabsContent>

            <TabsContent value="resources" className="space-y-6">
              <ResourceUsage />
            </TabsContent>

            <TabsContent value="connections" className="space-y-6">
              <CloudConnectionManager />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Index;
