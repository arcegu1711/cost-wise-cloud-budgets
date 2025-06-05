
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
    const providerResources = resourcesData.filter(resource => resource.provider === provider);
    const providerCosts = costData[provider] || [];
    
    if (providerResources.length === 0) return;

    // 1. Recomendação baseada em recursos com baixa utilização (dados reais)
    const underutilizedResources = providerResources.filter(resource => 
      resource.utilization && resource.utilization < 30 && 
      (resource.type.toLowerCase().includes('virtual machine') || 
       resource.type.toLowerCase().includes('compute'))
    );

    if (underutilizedResources.length > 0) {
      const totalSavings = underutilizedResources.reduce((sum, resource) => sum + (resource.cost * 0.4), 0);
      recommendations.push({
        id: id++,
        title: `Redimensionar Instâncias Subutilizadas ${provider.toUpperCase()}`,
        description: `${underutilizedResources.length} instâncias com utilização abaixo de 30% identificadas`,
        potential_savings: totalSavings,
        effort: "Medium",
        impact: "High",
        category: "compute",
        resources: underutilizedResources.length,
        provider: provider.toUpperCase()
      });
    }

    // 2. Recomendação para recursos de armazenamento (baseado em tipos reais)
    const storageResources = providerResources.filter(resource => 
      resource.type.toLowerCase().includes('storage') ||
      resource.type.toLowerCase().includes('disk') ||
      resource.type.toLowerCase().includes('blob')
    );

    if (storageResources.length > 0) {
      // Assume que 20% do armazenamento pode estar não utilizado
      const totalStorageSavings = storageResources.reduce((sum, resource) => sum + (resource.cost * 0.2), 0);
      recommendations.push({
        id: id++,
        title: `Otimizar Armazenamento ${provider.toUpperCase()}`,
        description: `${storageResources.length} recursos de armazenamento podem ser otimizados`,
        potential_savings: totalStorageSavings,
        effort: "Low",
        impact: "Medium",
        category: "storage",
        resources: storageResources.length,
        provider: provider.toUpperCase()
      });
    }

    // 3. Recomendação para recursos caros que podem usar instâncias reservadas
    const expensiveResources = providerResources.filter(resource => 
      resource.cost > 1000 && 
      (resource.type.toLowerCase().includes('virtual machine') ||
       resource.type.toLowerCase().includes('database') ||
       resource.type.toLowerCase().includes('sql'))
    );

    if (expensiveResources.length > 0) {
      const reservedInstanceSavings = expensiveResources.reduce((sum, resource) => sum + (resource.cost * 0.15), 0);
      recommendations.push({
        id: id++,
        title: `Instâncias Reservadas ${provider.toUpperCase()}`,
        description: `${expensiveResources.length} recursos de alto custo ideais para instâncias reservadas`,
        potential_savings: reservedInstanceSavings,
        effort: "Medium",
        impact: "High",
        category: "commitment",
        resources: expensiveResources.length,
        provider: provider.toUpperCase()
      });
    }

    // 4. Recomendação para recursos de rede (baseado em tipos reais)
    const networkResources = providerResources.filter(resource => 
      resource.type.toLowerCase().includes('gateway') ||
      resource.type.toLowerCase().includes('load balancer') ||
      resource.type.toLowerCase().includes('application gateway')
    );

    if (networkResources.length > 0) {
      // Assume economia menor para recursos de rede
      const networkSavings = networkResources.reduce((sum, resource) => sum + (resource.cost * 0.1), 0);
      if (networkSavings > 100) { // Só recomenda se a economia for significativa
        recommendations.push({
          id: id++,
          title: `Otimizar Recursos de Rede ${provider.toUpperCase()}`,
          description: `${networkResources.length} recursos de rede podem ser revisados`,
          potential_savings: networkSavings,
          effort: "Low",
          impact: "Low",
          category: "network",
          resources: networkResources.length,
          provider: provider.toUpperCase()
        });
      }
    }

    // 5. Recomendação baseada em recursos em ambiente de desenvolvimento
    const devResources = providerResources.filter(resource => 
      resource.tags && (
        resource.tags.Environment?.toLowerCase().includes('dev') ||
        resource.tags.Environment?.toLowerCase().includes('development') ||
        resource.tags.Environment?.toLowerCase().includes('test')
      )
    );

    if (devResources.length > 0) {
      const devSavings = devResources.reduce((sum, resource) => sum + (resource.cost * 0.3), 0);
      if (devSavings > 200) {
        recommendations.push({
          id: id++,
          title: `Otimizar Ambientes de Desenvolvimento ${provider.toUpperCase()}`,
          description: `${devResources.length} recursos em ambientes dev/test podem ser redimensionados`,
          potential_savings: devSavings,
          effort: "Low",
          impact: "Medium",
          category: "compute",
          resources: devResources.length,
          provider: provider.toUpperCase()
        });
      }
    }
  });

  // Ordena por economia potencial (maior primeiro)
  return recommendations.sort((a, b) => b.potential_savings - a.potential_savings);
};
