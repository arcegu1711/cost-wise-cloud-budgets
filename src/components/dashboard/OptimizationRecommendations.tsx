
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { useCloudData } from "@/hooks/useCloudData";
import { formatCurrency } from "@/utils/currency";
import { RecommendationDetailsDialog } from "./RecommendationDetailsDialog";
import { RecommendationCard } from "./RecommendationCard";
import { OptimizationSummary } from "./OptimizationSummary";
import { generateRecommendationsFromData } from "@/utils/recommendationGenerator";

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
      <OptimizationSummary 
        totalRecommendations={recommendations.length}
        totalResources={totalResources}
        quickWins={quickWins}
        potentialReduction={potentialReduction}
      />

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
              <RecommendationCard 
                key={rec.id} 
                recommendation={rec} 
                onViewDetails={handleViewDetails}
              />
            ))}
          </TabsContent>

          <TabsContent value="high-impact">
            <div className="space-y-4">
              {recommendations
                .filter(rec => rec.impact === "High")
                .map((rec) => (
                  <RecommendationCard 
                    key={rec.id} 
                    recommendation={rec} 
                    onViewDetails={handleViewDetails}
                  />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="quick-wins">
            <div className="space-y-4">
              {recommendations
                .filter(rec => rec.effort === "Low")
                .map((rec) => (
                  <RecommendationCard 
                    key={rec.id} 
                    recommendation={rec} 
                    onViewDetails={handleViewDetails}
                  />
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
