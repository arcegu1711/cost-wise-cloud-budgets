
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Server, 
  Database, 
  Zap, 
  Clock, 
  DollarSign,
  CheckCircle,
  AlertTriangle,
  TrendingDown,
  Calendar,
  Target
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

interface RecommendationDetailsDialogProps {
  recommendation: OptimizationRecommendation | null;
  isOpen: boolean;
  onClose: () => void;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "compute":
      return <Server className="h-5 w-5" />;
    case "storage":
      return <Database className="h-5 w-5" />;
    case "network":
      return <Zap className="h-5 w-5" />;
    case "commitment":
      return <Clock className="h-5 w-5" />;
    default:
      return <DollarSign className="h-5 w-5" />;
  }
};

const getEffortColor = (effort: string) => {
  switch (effort) {
    case "Low":
      return "text-green-600 bg-green-50 border-green-200";
    case "Medium":
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    case "High":
      return "text-red-600 bg-red-50 border-red-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
};

const getImpactColor = (impact: string) => {
  switch (impact) {
    case "Low":
      return "text-slate-600 bg-slate-50 border-slate-200";
    case "Medium":
      return "text-blue-600 bg-blue-50 border-blue-200";
    case "High":
      return "text-purple-600 bg-purple-50 border-purple-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
};

const getDetailedSteps = (recommendation: OptimizationRecommendation) => {
  switch (recommendation.category) {
    case "compute":
      return [
        "Analise o uso atual de CPU e memória das instâncias",
        "Identifique instâncias com baixa utilização (< 20%)",
        "Teste o redimensionamento em ambiente de desenvolvimento",
        "Execute o redimensionamento em horário de menor tráfego",
        "Monitore o desempenho após a alteração"
      ];
    case "storage":
      return [
        "Liste todos os volumes de armazenamento",
        "Identifique volumes desanexados ou não utilizados",
        "Verifique se há snapshots desnecessários",
        "Crie backup dos dados importantes",
        "Remova volumes não utilizados"
      ];
    case "network":
      return [
        "Analise o tráfego dos balanceadores de carga",
        "Identifique balanceadores sem tráfego nos últimos 30 dias",
        "Verifique dependências de aplicações",
        "Documente a remoção planejada",
        "Execute a remoção em horário programado"
      ];
    case "commitment":
      return [
        "Analise o padrão de uso das instâncias",
        "Calcule o ROI das instâncias reservadas",
        "Compare preços on-demand vs reservadas",
        "Selecione o termo mais adequado (1 ou 3 anos)",
        "Execute a compra das instâncias reservadas"
      ];
    default:
      return ["Revise a configuração atual", "Implemente as otimizações recomendadas"];
  }
};

export const RecommendationDetailsDialog = ({ recommendation, isOpen, onClose }: RecommendationDetailsDialogProps) => {
  if (!recommendation) return null;

  const monthlyROI = recommendation.potential_savings > 0 ? (recommendation.potential_savings * 12) : 0;
  const steps = getDetailedSteps(recommendation);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              {getCategoryIcon(recommendation.category)}
            </div>
            <div>
              <DialogTitle className="text-xl">{recommendation.title}</DialogTitle>
              <DialogDescription className="mt-1">
                Detalhes da oportunidade de otimização no {recommendation.provider}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumo da Oportunidade */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Resumo da Oportunidade</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{recommendation.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(recommendation.potential_savings)}
                  </div>
                  <div className="text-sm text-muted-foreground">Economia Mensal</div>
                </div>
                
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(monthlyROI)}
                  </div>
                  <div className="text-sm text-muted-foreground">Economia Anual</div>
                </div>
                
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {recommendation.resources}
                  </div>
                  <div className="text-sm text-muted-foreground">Recursos Afetados</div>
                </div>
                
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {recommendation.effort === "Low" ? "1-2" : recommendation.effort === "Medium" ? "3-5" : "5+"}
                  </div>
                  <div className="text-sm text-muted-foreground">Dias para Implementar</div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Esforço:</span>
                  <Badge className={`${getEffortColor(recommendation.effort)} border`}>
                    {recommendation.effort}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Impacto:</span>
                  <Badge className={`${getImpactColor(recommendation.impact)} border`}>
                    {recommendation.impact}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plano de Implementação */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>Plano de Implementação</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <p className="text-sm text-muted-foreground">{step}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Riscos e Considerações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Riscos e Considerações</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">Atenção</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {recommendation.category === "compute" && (
                    <>
                      <li>• Teste o redimensionamento em ambiente não-produtivo primeiro</li>
                      <li>• Monitore métricas de performance após a alteração</li>
                      <li>• Tenha um plano de rollback pronto</li>
                    </>
                  )}
                  {recommendation.category === "storage" && (
                    <>
                      <li>• Certifique-se de que os volumes não contêm dados importantes</li>
                      <li>• Verifique dependências antes da remoção</li>
                      <li>• Mantenha backups atualizados</li>
                    </>
                  )}
                  {recommendation.category === "network" && (
                    <>
                      <li>• Confirme que não há aplicações dependentes</li>
                      <li>• Documente as alterações para a equipe</li>
                      <li>• Execute em horário de baixo tráfego</li>
                    </>
                  )}
                  {recommendation.category === "commitment" && (
                    <>
                      <li>• Analise tendências de crescimento futuro</li>
                      <li>• Considere flexibilidade vs economia</li>
                      <li>• Revise termos e condições do contrato</li>
                    </>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Separator />

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
              <TrendingDown className="h-4 w-4 mr-2" />
              Implementar Otimização
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
