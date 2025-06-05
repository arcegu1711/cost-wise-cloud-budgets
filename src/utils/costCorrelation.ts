
import { CostData, ResourceData } from '@/types/cloud-providers';

interface ServiceMappings {
  [key: string]: string[];
}

export const getServiceMappings = (resourceType: string): string[] => {
  const type = resourceType.toLowerCase();
  const mappings = [];
  
  // More comprehensive mappings based on Azure resource types
  if (type.includes('microsoft.compute') || type.includes('virtualmachines') || type.includes('compute')) {
    mappings.push('microsoft.compute', 'compute', 'virtual machines', 'vm');
  }
  if (type.includes('microsoft.storage') || type.includes('storage') || type.includes('disk') || type.includes('blob')) {
    mappings.push('microsoft.storage', 'storage', 'disk', 'blob');
  }
  if (type.includes('microsoft.network') || type.includes('network') || type.includes('loadbalancer')) {
    mappings.push('microsoft.network', 'network', 'load balancer', 'networking');
  }
  if (type.includes('microsoft.sql') || type.includes('microsoft.dbfor') || type.includes('database') || type.includes('sql')) {
    mappings.push('microsoft.dbformysql', 'microsoft.dbforpostgresql', 'microsoft.sql', 'database', 'sql', 'mysql', 'postgresql');
  }
  if (type.includes('microsoft.cache') || type.includes('cache') || type.includes('redis')) {
    mappings.push('microsoft.cache', 'cache', 'redis');
  }
  if (type.includes('microsoft.eventhub') || type.includes('eventhub')) {
    mappings.push('microsoft.eventhub', 'event hub', 'eventhub');
  }
  if (type.includes('microsoft.logic') || type.includes('logic')) {
    mappings.push('microsoft.logic', 'logic app', 'logic');
  }
  if (type.includes('microsoft.web') || type.includes('web') || type.includes('app')) {
    mappings.push('microsoft.web', 'app service', 'web app', 'web');
  }
  if (type.includes('microsoft.containerservice') || type.includes('kubernetes') || type.includes('aks')) {
    mappings.push('kubernetes', 'aks', 'container');
  }
  if (type.includes('microsoft.security')) {
    mappings.push('microsoft.security', 'security');
  }
  if (type.includes('microsoft.operationalinsights')) {
    mappings.push('microsoft.operationalinsights', 'operational insights', 'log analytics');
  }
  
  return mappings;
};

export const correlateResourceCosts = (
  rawResourcesData: ResourceData[],
  costData: Record<string, CostData[]>
): ResourceData[] => {
  if (!rawResourcesData) return [];

  return rawResourcesData.map(resource => {
    let resourceCost = 0;
    
    if (costData) {
      // Get all cost entries for this provider
      const providerCosts = costData[resource.provider] || [];
      
      // Strategy 1: Direct service name matching
      const serviceMappings = getServiceMappings(resource.type);
      
      // Find matching costs
      const matchingCosts = providerCosts.filter(cost => {
        const costService = cost.service.toLowerCase();
        
        // Check for direct service match (case insensitive)
        const isServiceMatch = serviceMappings.some(mapping => 
          costService.includes(mapping.toLowerCase()) || mapping.toLowerCase().includes(costService)
        );
        
        // Region matching (more flexible - just check if regions contain each other)
        const isRegionMatch = !cost.region || !resource.region || 
          cost.region.toLowerCase().includes(resource.region.toLowerCase()) ||
          resource.region.toLowerCase().includes(cost.region.toLowerCase()) ||
          cost.region.toLowerCase() === 'all regions'; // Azure global services
        
        return isServiceMatch && isRegionMatch;
      });

      // Sum up all matching costs
      resourceCost = matchingCosts.reduce((sum, cost) => sum + cost.amount, 0);
      
      // If no direct match found, try fallback strategies
      if (resourceCost === 0 && providerCosts.length > 0) {
        // Strategy 2: Try partial matching on resource name or type
        const partialMatches = providerCosts.filter(cost => {
          const costService = cost.service.toLowerCase();
          const resourceName = resource.name.toLowerCase();
          const resourceType = resource.type.toLowerCase();
          
          // Check if cost service appears in resource type or name
          return resourceType.includes(costService.replace('microsoft.', '')) ||
                 resourceName.includes(costService.replace('microsoft.', '')) ||
                 costService.includes(resourceType.replace('microsoft.', ''));
        });
        
        if (partialMatches.length > 0) {
          resourceCost = partialMatches.reduce((sum, cost) => sum + cost.amount, 0) / partialMatches.length;
        }
      }
      
      // Strategy 3: For unmatched resources, assign a small portion of total unassigned costs
      if (resourceCost === 0 && providerCosts.length > 0) {
        const totalCosts = providerCosts.reduce((sum, cost) => sum + cost.amount, 0);
        const averageCost = totalCosts / Math.max(rawResourcesData.length, 10); // Distribute among resources
        resourceCost = averageCost * 0.1; // Assign 10% of average as estimate
      }
    }
    
    return {
      ...resource,
      cost: resourceCost > 0 ? Number(resourceCost.toFixed(2)) : 0
    };
  });
};
