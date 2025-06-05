
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, ExternalLink } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { getTypeIcon, getProviderBadgeColor, formatResourceType } from "@/utils/resourceUtils";

interface Resource {
  id: string;
  name: string;
  type: string;
  provider: string;
  region: string;
  status: string;
  cost?: number;
}

interface ResourcesTableProps {
  filteredResources: Resource[];
  isLoading: boolean;
  totalResources: number;
}

export const ResourcesTable = ({ 
  filteredResources, 
  isLoading, 
  totalResources 
}: ResourcesTableProps) => {
  return (
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
              {totalResources === 0 
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
  );
};
