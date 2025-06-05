
import { Card, CardContent } from "@/components/ui/card";
import { Server, Database, HardDrive, Zap, DollarSign } from "lucide-react";
import { formatCurrency } from "@/utils/currency";

interface ResourcesSummaryCardsProps {
  totalResources: number;
  uniqueTypes: number;
  uniqueRegions: number;
  connectedProviders: number;
  totalResourcesCost: number;
}

export const ResourcesSummaryCards = ({
  totalResources,
  uniqueTypes,
  uniqueRegions,
  connectedProviders,
  totalResourcesCost
}: ResourcesSummaryCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Recursos</p>
              <p className="text-2xl font-bold">{totalResources}</p>
            </div>
            <Server className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Valor Total</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalResourcesCost)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tipos Únicos</p>
              <p className="text-2xl font-bold">{uniqueTypes}</p>
            </div>
            <Database className="h-8 w-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Regiões</p>
              <p className="text-2xl font-bold">{uniqueRegions}</p>
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
              <p className="text-2xl font-bold">{connectedProviders}</p>
            </div>
            <Zap className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
