import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingDown, 
  Server, 
  Database, 
  Zap, 
  Clock, 
  DollarSign,
  ChevronRight,
  Loader2
} from "lucide-react";
import { useCloudData } from "@/hooks/useCloudData";
import { formatCurrency } from "@/utils/currency";
import { RecommendationDetailsDialog } from "./RecommendationDetailsDialog";

interface OptimizationRecommendation {
  id: number;
  title: string;
  description: string;
  potential_savings: number;
  effort: "Low" | "Medium" | "High";
  impact: "Low" | "Medium" | "High";
  category: "compute" | "storage" | "network" | "commitment";
  resources: number;
  provider: string;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "compute":
      return <Server className="h-4 w-4" />;
    case "storage":
      return <Database className="h-4 w-4" />;
    case "network":
      return <Zap className="h-4 w-4" />;
    case "commitment":
      return <Clock className="h-4 w-4" />;
    default:
      return <DollarSign className="h-4 w-4" />;
  }
};

const getEffortBadge = (effort: string) => {
  const colors = {
    Low: "bg-green-100 text-green-700",
    Medium: "bg-yellow-100 text-yellow-700", 
    High: "bg-red-100 text-red-700"
  };
  return <Badge variant="secondary" className={colors[effort as keyof typeof colors]}>{effort}</Badge>;
};

const getImpactBadge = (impact: string) => {
  const colors = {
    Low: "bg-slate-100 text-slate-700",
    Medium: "bg-blue-100 text-blue-700",
    High: "bg-purple-100 text-purple-700"
  };
  return <Badge variant="secondary" className={colors[impact as keyof typeof colors]}>{impact}</Badge>;
};

const generateRecommendationsFromData = (costData: any, resourcesData: any[], connectedProviders: string[]): OptimizationRecommendation[] => {
  const recommendations: OptimizationRecommendation[] = [];
  let id = 1;

  connectedProviders.forEach(provider => {
    const providerCosts = costData[provider] || [];
    const totalCost = providerCosts.reduce((sum: number, cost: any) => sum + cost.amount, 0);
    
    if (totalCost > 0) {
      // Recomendação de redimensionamento baseada no custo
      if (totalCost > 5000) {
        recommendations.push({
          id: id++,
          title: `Redimensionar Instâncias ${provider.toUpperCase()}`,
          description: `${Math.floor(totalCost / 1000)} instâncias podem estar superdimensionadas`,
          potential_savings: totalCost * 0.15,
          effort: "Low",
          impact: "High",
          category: "compute",
          resources: Math.floor(totalCost / 1000),
          provider: provider.toUpperCase()
        });
      }

      // Recomendação de instâncias reservadas
      if (totalCost > 3000) {
        recommendations.push({
          id: id++,
          title: `Oportunidades de Instâncias Reservadas ${provider.toUpperCase()}`,
          description: "Comprar instâncias reservadas para cargas de trabalho consistentes",
          potential_savings: totalCost * 0.12,
          effort: "Medium",
          impact: "High",
          category: "commitment",
          resources: Math.floor(totalCost / 500),
          provider: provider.toUpperCase()
        });
      }

      // Recomendação de armazenamento não utilizado
      const storageServices = providerCosts.filter((cost: any) => 
        cost.service.toLowerCase().includes('storage') || 
        cost.service.toLowerCase().includes('disk') ||
        cost.service.toLowerCase().includes('blob')
      );
      
      if (storageServices.length > 0) {
        const storageCost = storageServices.reduce((sum: number, cost: any) => sum + cost.amount, 0);
        recommendations.push({
          id: id++,
          title: `Volumes de Armazenamento Não Utilizados ${provider.toUpperCase()}`,
          description: `${storageServices.length} volumes podem estar desanexados`,
          potential_savings: storageCost * 0.8,
          effort: "Low",
          impact: "Medium",
          category: "storage",
          resources: storageServices.length,
          provider: provider.toUpperCase()
        });
      }

      // Recomendação de balanceadores de carga ociosos
      if (totalCost > 2000) {
        recommendations.push({
          id: id++,
          title: `Balanceadores de Carga Ociosos ${provider.toUpperCase()}`,
          description: `${Math.floor(totalCost / 2000)} balanceadores sem tráfego`,
          potential_savings: Math.floor(totalCost / 2000) * 180,
          effort: "Low",
          impact: "Low",
          category: "network",
          resources: Math.floor(totalCost / 2000),
          provider: provider.toUpperCase()
        });
      }
    }
  });

  return recommendations;
};

export const OptimizationRecommendations = () => {
  const [selectedRecommendation, setSelectedRecommendation] = useState<OptimizationRecommendation | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { 
    costData, 
    resourcesData, 
    connectedProviders, 
    isLoading,
    costLoading 
  } = useCloudData();

  const recommendations = generateRecommendationsFromData(costData, resourcesData, connectedProviders);
  const totalSavings = recommendations.reduce((sum, rec) => sum + rec.potential_savings, 0);
  const totalResources = recommendations.reduce((sum, rec) => sum + rec.resources, 0);
  const quickWins = recommendations.filter(rec => rec.effort === "Low").length;
  const potentialReduction = totalSavings > 0 ? Math.round((totalSavings / (costData ? Object.values(costData).flat().reduce((sum: number, cost: any) => sum + cost.amount, 0) : 1)) * 100) : 0;

  const handleViewDetails = (recommendation: OptimizationRecommendation) => {
    setSelectedRecommendation(recommendation);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedRecommendation(null);
  };

  if (connectedProviders.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Otimização de Custos</h2>
            <p className="text-muted-foreground">Recomendações baseadas em IA para reduzir seus custos de nuvem</p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-semibold mb-2">Nenhum Provedor Conectado</h3>
              <p className="text-muted-foreground mb-4">
                Conecte seus provedores de nuvem na aba "Conexões Cloud" para visualizar recomendações de otimização personalizadas.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (costLoading || isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Otimização de Custos</h2>
            <p className="text-muted-foreground">Recomendações baseadas em IA para reduzir seus custos de nuvem</p>
          </div>
        </div>

        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Analisando dados e gerando recomendações...</span>
          </div>
        </div>
      </div>
    );
  }

  const RecommendationCard = ({ rec }: { rec: OptimizationRecommendation }) => (
    <Card key={rec.id} className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            <div className="p-2 bg-slate-100 rounded-lg">
              {getCategoryIcon(rec.category)}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-semibold">{rec.title}</h3>
                <Badge variant="outline">{rec.provider}</Badge>
              </div>
              
              <p className="text-muted-foreground mb-3">{rec.description}</p>
              
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <span className="text-muted-foreground">Recursos:</span>
                  <span className="font-medium">{rec.resources}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-muted-foreground">Esforço:</span>
                  {getEffortBadge(rec.effort)}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-muted-foreground">Impacto:</span>
                  {getImpactBadge(rec.impact)}
                </div>
              </div>
            </div>
          </div>

          <div className="text-right ml-4">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(rec.potential_savings)}
            </div>
            <p className="text-sm text-muted-foreground mb-3">mensais</p>
            
            <Button 
              size="sm" 
              className="w-full"
              onClick={() => handleViewDetails(rec)}
            >
              Ver Detalhes
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Otimização de Custos</h2>
          <p className="text-muted-foreground">Recomendações baseadas em IA para reduzir seus custos de nuvem</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-600">{formatCurrency(totalSavings)}</div>
          <p className="text-sm text-muted-foreground">Economia potencial mensal</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-4 w-4 text-green-600" />
              <div>
                <div className="font-semibold">{recommendations.length}</div>
                <div className="text-sm text-muted-foreground">Recomendações</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Server className="h-4 w-4 text-blue-600" />
              <div>
                <div className="font-semibold">{totalResources}</div>
                <div className="text-sm text-muted-foreground">Recursos Afetados</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <div>
                <div className="font-semibold">{quickWins}</div>
                <div className="text-sm text-muted-foreground">Vitórias Rápidas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <div className="font-semibold">{potentialReduction}%</div>
                <div className="text-sm text-muted-foreground">Redução Potencial</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations List */}
      {recommendations.length > 0 ? (
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">Todas as Recomendações</TabsTrigger>
            <TabsTrigger value="high-impact">Alto Impacto</TabsTrigger>
            <TabsTrigger value="quick-wins">Vitórias Rápidas</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {recommendations.map((rec) => (
              <RecommendationCard key={rec.id} rec={rec} />
            ))}
          </TabsContent>

          <TabsContent value="high-impact">
            <div className="space-y-4">
              {recommendations
                .filter(rec => rec.impact === "High")
                .map((rec) => (
                  <RecommendationCard key={rec.id} rec={rec} />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="quick-wins">
            <div className="space-y-4">
              {recommendations
                .filter(rec => rec.effort === "Low")
                .map((rec) => (
                  <RecommendationCard key={rec.id} rec={rec} />
                ))}
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-semibold mb-2">Nenhuma Recomendação Disponível</h3>
              <p className="text-muted-foreground">
                Não foram encontradas oportunidades de otimização com base nos dados atuais.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog de Detalhes */}
      <RecommendationDetailsDialog 
        recommendation={selectedRecommendation}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
      />
    </div>
  );
};
