
import { useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ResourcesHeader } from "@/components/resources/ResourcesHeader";
import { ResourcesSummaryCards } from "@/components/resources/ResourcesSummaryCards";
import { ResourcesFilters } from "@/components/resources/ResourcesFilters";
import { ResourcesTable } from "@/components/resources/ResourcesTable";
import { useCloudData } from "@/hooks/useCloudData";

const Resources = () => {
  const { resourcesData, isLoading, syncCloudData, connectedProviders, totalResourcesCost } = useCloudData();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [providerFilter, setProviderFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");

  // Get unique values for filters
  const resourceTypes = [...new Set(resourcesData.map(r => r.type))];
  const regions = [...new Set(resourcesData.map(r => r.region).filter(Boolean))];
  const providers = [...new Set(resourcesData.map(r => r.provider))];

  // Filter resources based on search and filters
  const filteredResources = resourcesData.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || resource.type === typeFilter;
    const matchesProvider = providerFilter === "all" || resource.provider === providerFilter;
    const matchesRegion = regionFilter === "all" || resource.region === regionFilter;
    
    return matchesSearch && matchesType && matchesProvider && matchesRegion;
  });

  const handleClearFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
    setProviderFilter("all");
    setRegionFilter("all");
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <DashboardHeader />
        
        <main className="container mx-auto px-4 py-8">
          <ResourcesHeader />

          <ResourcesSummaryCards
            totalResources={resourcesData.length}
            uniqueTypes={resourceTypes.length}
            uniqueRegions={regions.length}
            connectedProviders={connectedProviders.length}
            totalResourcesCost={totalResourcesCost}
          />

          <ResourcesFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            providerFilter={providerFilter}
            setProviderFilter={setProviderFilter}
            regionFilter={regionFilter}
            setRegionFilter={setRegionFilter}
            resourceTypes={resourceTypes}
            providers={providers}
            regions={regions}
            isLoading={isLoading}
            onSync={syncCloudData}
            onClearFilters={handleClearFilters}
          />

          <ResourcesTable
            filteredResources={filteredResources}
            isLoading={isLoading}
            totalResources={resourcesData.length}
          />
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Resources;
