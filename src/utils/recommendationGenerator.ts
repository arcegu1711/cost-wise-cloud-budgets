
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

export const generateRecommendationsFromData = (costData: any, resourcesData: any[], connectedProviders: string[]): OptimizationRecommendation[] => {
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
