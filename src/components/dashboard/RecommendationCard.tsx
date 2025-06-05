
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Server, 
  Database, 
  Zap, 
  Clock, 
  DollarSign,
  ChevronRight
} from "lucide-react";
import { formatCurrency } from "@/utils/currency";

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

interface RecommendationCardProps {
  recommendation: OptimizationRecommendation;
  onViewDetails: (recommendation: OptimizationRecommendation) => void;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "compute":
      return <Server className="h-4 w-4" />;
    case "storage":
      return <Database className="h-4 w-4" />;
    case "network":
      return <Zap className="h-4 w-4" />;
    case "commitment":
      return <Clock className="h-4 w-4" />;
    default:
      return <DollarSign className="h-4 w-4" />;
  }
};

const getEffortBadge = (effort: string) => {
  const colors = {
    Low: "bg-green-100 text-green-700",
    Medium: "bg-yellow-100 text-yellow-700", 
    High: "bg-red-100 text-red-700"
  };
  return <Badge variant="secondary" className={colors[effort as keyof typeof colors]}>{effort}</Badge>;
};

const getImpactBadge = (impact: string) => {
  const colors = {
    Low: "bg-slate-100 text-slate-700",
    Medium: "bg-blue-100 text-blue-700",
    High: "bg-purple-100 text-purple-700"
  };
  return <Badge variant="secondary" className={colors[impact as keyof typeof colors]}>{impact}</Badge>;
};

export const RecommendationCard = ({ recommendation, onViewDetails }: RecommendationCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            <div className="p-2 bg-slate-100 rounded-lg">
              {getCategoryIcon(recommendation.category)}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-semibold">{recommendation.title}</h3>
                <Badge variant="outline">{recommendation.provider}</Badge>
              </div>
              
              <p className="text-muted-foreground mb-3">{recommendation.description}</p>
              
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <span className="text-muted-foreground">Recursos:</span>
                  <span className="font-medium">{recommendation.resources}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-muted-foreground">Esforço:</span>
                  {getEffortBadge(recommendation.effort)}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-muted-foreground">Impacto:</span>
                  {getImpactBadge(recommendation.impact)}
                </div>
              </div>
            </div>
          </div>

          <div className="text-right ml-4">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(recommendation.potential_savings)}
            </div>
            <p className="text-sm text-muted-foreground mb-3">mensais</p>
            
            <Button 
              size="sm" 
              className="w-full"
              onClick={() => onViewDetails(recommendation)}
            >
              Ver Detalhes
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
