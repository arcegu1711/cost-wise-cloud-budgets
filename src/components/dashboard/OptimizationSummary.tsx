
import { Card, CardContent } from "@/components/ui/card";
import { 
  TrendingDown, 
  Server, 
  Clock, 
  DollarSign
} from "lucide-react";

interface OptimizationSummaryProps {
  totalRecommendations: number;
  totalResources: number;
  quickWins: number;
  potentialReduction: number;
}

export const OptimizationSummary = ({ 
  totalRecommendations, 
  totalResources, 
  quickWins, 
  potentialReduction 
}: OptimizationSummaryProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <TrendingDown className="h-4 w-4 text-green-600" />
            <div>
              <div className="font-semibold">{totalRecommendations}</div>
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
  );
};
