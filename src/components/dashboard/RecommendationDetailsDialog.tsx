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
  Target,
  ExternalLink,
  Copy
} from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { useCloudData } from "@/hooks/useCloudData";

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

const getAffectedResources = (recommendation: OptimizationRecommendation, resourcesData: any[]) => {
  if (!recommendation || !resourcesData.length) return [];

  const providerResources = resourcesData.filter(
    resource => resource.provider === recommendation.provider.toLowerCase()
  );

  switch (recommendation.category) {
    case "compute":
      return providerResources
        .filter(resource => 
          resource.type.toLowerCase().includes('virtual machine') ||
          resource.type.toLowerCase().includes('compute') ||
          resource.utilization < 30
        )
        .slice(0, recommendation.resources);
    
    case "storage":
      return providerResources
        .filter(resource => 
          resource.type.toLowerCase().includes('storage') ||
          resource.type.toLowerCase().includes('disk') ||
          resource.type.toLowerCase().includes('blob')
        )
        .slice(0, recommendation.resources);
    
    case "network":
      return providerResources
        .filter(resource => 
          resource.type.toLowerCase().includes('load balancer') ||
          resource.type.toLowerCase().includes('gateway') ||
          resource.type.toLowerCase().includes('network')
        )
        .slice(0, recommendation.resources);
    
    case "commitment":
      return providerResources
        .filter(resource => 
          resource.cost > 500 && // High cost resources suitable for reserved instances
          (resource.type.toLowerCase().includes('virtual machine') ||
           resource.type.toLowerCase().includes('database'))
        )
        .slice(0, recommendation.resources);
    
    default:
      return providerResources.slice(0, recommendation.resources);
  }
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

export const RecommendationDetailsDialog = ({ recommendation, isOpen, onClose }: RecommendationDetailsDialogProps) => {
  const { resourcesData } = useCloudData();
  
  if (!recommendation) return null;

  const monthlyROI = recommendation.potential_savings > 0 ? (recommendation.potential_savings * 12) : 0;
  const steps = getDetailedSteps(recommendation);
  const affectedResources = getAffectedResources(recommendation, resourcesData);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
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

          {/* Recursos Afetados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Server className="h-5 w-5" />
                <span>Recursos Afetados ({affectedResources.length})</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Compare estes recursos com o portal {recommendation.provider} para validar as oportunidades
              </p>
            </CardHeader>
            <CardContent>
              {affectedResources.length > 0 ? (
                <div className="space-y-3">
                  {affectedResources.map((resource, index) => (
                    <div key={resource.id} className="border rounded-lg p-4 bg-slate-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium text-sm">{resource.name}</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(resource.id)}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-muted-foreground">
                            <div>
                              <span className="font-medium">Tipo:</span> {resource.type}
                            </div>
                            <div>
                              <span className="font-medium">Região:</span> {resource.region}
                            </div>
                            <div>
                              <span className="font-medium">Status:</span> 
                              <Badge variant="outline" className="ml-1 text-xs">
                                {resource.status}
                              </Badge>
                            </div>
                          </div>
                          
                          {resource.utilization && (
                            <div className="mt-2 text-xs">
                              <span className="font-medium">Utilização:</span> {resource.utilization}%
                            </div>
                          )}
                          
                          <div className="mt-2 text-xs text-muted-foreground font-mono bg-white p-2 rounded border">
                            <span className="font-medium">Resource ID:</span> {resource.id}
                          </div>
                        </div>
                        
                        <div className="text-right ml-4">
                          <div className="text-lg font-bold text-blue-600">
                            {formatCurrency(resource.cost)}
                          </div>
                          <div className="text-xs text-muted-foreground">por mês</div>
                        </div>
                      </div>
                      
                      {resource.tags && Object.keys(resource.tags).length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="text-xs font-medium mb-1">Tags:</div>
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(resource.tags).map(([key, value]) => (
                              <Badge key={key} variant="secondary" className="text-xs">
                                {key}: {value}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <ExternalLink className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-800 mb-1">Validação no Portal {recommendation.provider}</p>
                        <p className="text-blue-700">
                          Use os Resource IDs acima para localizar e validar estes recursos no portal do {recommendation.provider}. 
                          Clique no ícone de cópia para copiar o ID de cada recurso.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Server className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhum recurso específico encontrado</p>
                  <p className="text-xs mt-1">Esta recomendação é baseada em análise geral de custos</p>
                </div>
              )}
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
