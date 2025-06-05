
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { formatCurrency } from "@/utils/currency";
import { useCloudData } from "@/hooks/useCloudData";
import { Loader2 } from "lucide-react";

interface CostOverviewProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
}

const chartConfig = {
  aws: { label: "AWS", color: "#FF9500" },
  azure: { label: "Azure", color: "#0078D4" },
  gcp: { label: "GCP", color: "#4285F4" },
};

export const CostOverview = ({ selectedPeriod, onPeriodChange }: CostOverviewProps) => {
  const { 
    costData, 
    connectedProviders, 
    isLoading,
    costLoading 
  } = useCloudData();

  // Process cost data for daily trend chart
  const processDailyCostData = () => {
    if (!costData || Object.keys(costData).length === 0) {
      return [];
    }

    const dateMap = new Map();
    
    Object.entries(costData).forEach(([provider, costs]) => {
      costs.forEach(cost => {
        const dateKey = cost.date;
        if (!dateMap.has(dateKey)) {
          dateMap.set(dateKey, { date: dateKey });
        }
        const existing = dateMap.get(dateKey);
        existing[provider] = (existing[provider] || 0) + cost.amount;
      });
    });

    return Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  };

  // Process service breakdown data
  const processServiceBreakdown = () => {
    if (!costData || Object.keys(costData).length === 0) {
      return [];
    }

    const serviceMap = new Map();
    let totalCost = 0;

    Object.values(costData).flat().forEach(cost => {
      const service = cost.service;
      serviceMap.set(service, (serviceMap.get(service) || 0) + cost.amount);
      totalCost += cost.amount;
    });

    return Array.from(serviceMap.entries())
      .map(([service, cost]) => ({
        service,
        cost,
        percentage: Math.round((cost / totalCost) * 100)
      }))
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 5); // Top 5 services
  };

  // Process cloud provider distribution
  const processCloudProviderData = () => {
    if (!costData || Object.keys(costData).length === 0) {
      return [];
    }

    return Object.entries(costData).map(([provider, costs]) => {
      const totalValue = costs.reduce((sum, cost) => sum + cost.amount, 0);
      return {
        name: provider.toUpperCase(),
        value: totalValue,
        color: chartConfig[provider as keyof typeof chartConfig]?.color || "#666666"
      };
    }).filter(item => item.value > 0);
  };

  const dailyCostData = processDailyCostData();
  const serviceBreakdown = processServiceBreakdown();
  const cloudProviderData = processCloudProviderData();

  if (connectedProviders.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-semibold mb-2">Nenhum Provedor Conectado</h3>
              <p className="text-muted-foreground mb-4">
                Conecte seus provedores de nuvem na aba "Conexões Cloud" para visualizar os dados de custo.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Daily Cost Trend */}
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Tendência de Custos Diários</CardTitle>
            <CardDescription>Distribuição de custos por provedor de nuvem ao longo do tempo</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant={selectedPeriod === "7d" ? "default" : "outline"} 
              size="sm"
              onClick={() => onPeriodChange("7d")}
            >
              7 Dias
            </Button>
            <Button 
              variant={selectedPeriod === "30d" ? "default" : "outline"} 
              size="sm"
              onClick={() => onPeriodChange("30d")}
            >
              30 Dias
            </Button>
            <Button 
              variant={selectedPeriod === "90d" ? "default" : "outline"} 
              size="sm"
              onClick={() => onPeriodChange("90d")}
            >
              90 Dias
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {costLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Carregando dados de custo...</span>
              </div>
            </div>
          ) : dailyCostData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[300px]">
              <AreaChart data={dailyCostData}>
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                {connectedProviders.map(provider => (
                  <Area 
                    key={provider}
                    type="monotone" 
                    dataKey={provider} 
                    stackId="1" 
                    stroke={chartConfig[provider as keyof typeof chartConfig]?.color} 
                    fill={chartConfig[provider as keyof typeof chartConfig]?.color} 
                    fillOpacity={0.6}
                  />
                ))}
              </AreaChart>
            </ChartContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center">
              <span className="text-muted-foreground">Nenhum dado de custo disponível</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Principais Serviços por Custo</CardTitle>
          <CardDescription>Distribuição do período selecionado</CardDescription>
        </CardHeader>
        <CardContent>
          {costLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Carregando...</span>
              </div>
            </div>
          ) : serviceBreakdown.length > 0 ? (
            <div className="space-y-4">
              {serviceBreakdown.map((service, index) => (
                <div key={service.service} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}
                    ></div>
                    <span className="font-medium">{service.service}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(service.cost)}</div>
                    <div className="text-sm text-muted-foreground">{service.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="text-muted-foreground">Nenhum dado de serviço disponível</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cloud Provider Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Provedor de Nuvem</CardTitle>
          <CardDescription>Gastos por provedor conectado</CardDescription>
        </CardHeader>
        <CardContent>
          {costLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Carregando...</span>
              </div>
            </div>
          ) : cloudProviderData.length > 0 ? (
            <>
              <ChartContainer config={chartConfig} className="h-[200px]">
                <PieChart>
                  <Pie
                    data={cloudProviderData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {cloudProviderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
              <div className="mt-4 space-y-2">
                {cloudProviderData.map((provider) => (
                  <div key={provider.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: provider.color }}
                      ></div>
                      <span>{provider.name}</span>
                    </div>
                    <span className="font-medium">{formatCurrency(provider.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <span className="text-muted-foreground">Nenhum dado de provedor disponível</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
