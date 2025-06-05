
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, RefreshCw } from "lucide-react";
import { formatResourceType } from "@/utils/resourceUtils";

interface ResourcesFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  typeFilter: string;
  setTypeFilter: (value: string) => void;
  providerFilter: string;
  setProviderFilter: (value: string) => void;
  regionFilter: string;
  setRegionFilter: (value: string) => void;
  resourceTypes: string[];
  providers: string[];
  regions: string[];
  isLoading: boolean;
  onSync: () => void;
  onClearFilters: () => void;
}

export const ResourcesFilters = ({
  searchTerm,
  setSearchTerm,
  typeFilter,
  setTypeFilter,
  providerFilter,
  setProviderFilter,
  regionFilter,
  setRegionFilter,
  resourceTypes,
  providers,
  regions,
  isLoading,
  onSync,
  onClearFilters
}: ResourcesFiltersProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Filtros de Recursos</CardTitle>
            <CardDescription>
              Filtre e pesquise recursos por nome, tipo, provedor ou região
            </CardDescription>
          </div>
          <Button 
            onClick={onSync} 
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Sincronizar Recursos
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar recursos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {resourceTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {formatResourceType(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={providerFilter} onValueChange={setProviderFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por provedor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os provedores</SelectItem>
              {providers.map(provider => (
                <SelectItem key={provider} value={provider}>
                  {provider.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por região" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as regiões</SelectItem>
              {regions.map(region => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            onClick={onClearFilters}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Limpar Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
