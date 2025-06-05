
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useCloudData } from "@/hooks/useCloudData";
import { Search, Filter, RefreshCw, Server, Database, HardDrive, Zap, ExternalLink } from "lucide-react";
import { formatCurrency } from "@/utils/currency";

const Resources = () => {
  const { resourcesData, isLoading, syncCloudData, connectedProviders } = useCloudData();
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

  const getTypeIcon = (type: string) => {
    if (type.includes("virtualMachine") || type.includes("compute") || type.includes("server")) {
      return <Server className="h-4 w-4 text-blue-600" />;
    }
    if (type.includes("database") || type.includes("sql") || type.includes("cosmos")) {
      return <Database className="h-4 w-4 text-green-600" />;
    }
    if (type.includes("storage") || type.includes("disk") || type.includes("blob")) {
      return <HardDrive className="h-4 w-4 text-orange-600" />;
    }
    return <Zap className="h-4 w-4 text-purple-600" />;
  };

  const getProviderBadgeColor = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'azure':
        return 'bg-blue-100 text-blue-700';
      case 'aws':
        return 'bg-orange-100 text-orange-700';
      case 'gcp':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatResourceType = (type: string) => {
    // Remove Microsoft.* prefix and make it more readable
    return type.replace(/^Microsoft\./, '').replace(/\//g, ' / ');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <DashboardHeader />
        
        <main className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Recursos da Nuvem</h1>
            <p className="text-slate-600">
              Visualize e gerencie todos os recursos dos seus provedores conectados
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Recursos</p>
                    <p className="text-2xl font-bold">{resourcesData.length}</p>
                  </div>
                  <Server className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Tipos Únicos</p>
                    <p className="text-2xl font-bold">{resourceTypes.length}</p>
                  </div>
                  <Database className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Regiões</p>
                    <p className="text-2xl font-bold">{regions.length}</p>
                  </div>
                  <HardDrive className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Provedores</p>
                    <p className="text-2xl font-bold">{connectedProviders.length}</p>
                  </div>
                  <Zap className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Actions */}
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
                  onClick={syncCloudData} 
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
                  onClick={() => {
                    setSearchTerm("");
                    setTypeFilter("all");
                    setProviderFilter("all");
                    setRegionFilter("all");
                  }}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Limpar Filtros
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Resources Table */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Recursos ({filteredResources.length})</CardTitle>
                  <CardDescription>
                    Lista detalhada de todos os recursos encontrados
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                  <span>Carregando recursos...</span>
                </div>
              ) : filteredResources.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {resourcesData.length === 0 
                      ? "Nenhum recurso encontrado. Conecte um provedor para ver recursos."
                      : "Nenhum recurso corresponde aos filtros aplicados."
                    }
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome do Recurso</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Provedor</TableHead>
                        <TableHead>Região</TableHead>
                        <TableHead>Custo</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredResources.map((resource) => (
                        <TableRow key={resource.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              {getTypeIcon(resource.type)}
                              <div>
                                <div className="font-medium">{resource.name}</div>
                                <div className="text-sm text-muted-foreground truncate max-w-xs">
                                  {resource.id}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              <div className="font-medium text-sm">
                                {formatResourceType(resource.type)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getProviderBadgeColor(resource.provider)}>
                              {resource.provider.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{resource.region || 'N/A'}</span>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {resource.cost ? formatCurrency(resource.cost) : 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={resource.status === 'running' ? 'default' : 'secondary'}
                            >
                              {resource.status || 'unknown'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" className="h-8">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Detalhes
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Resources;
