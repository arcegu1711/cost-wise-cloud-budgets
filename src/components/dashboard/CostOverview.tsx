
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { formatCurrency } from "@/utils/currency";

interface CostOverviewProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
}

const dailyCostData = [
  { date: "Jan 1", aws: 2250, azure: 1000, gcp: 750 },
  { date: "Jan 2", aws: 2100, azure: 900, gcp: 800 },
  { date: "Jan 3", aws: 2400, azure: 1100, gcp: 700 },
  { date: "Jan 4", aws: 1950, azure: 950, gcp: 850 },
  { date: "Jan 5", aws: 2300, azure: 1050, gcp: 750 },
  { date: "Jan 6", aws: 2600, azure: 1200, gcp: 900 },
  { date: "Jan 7", aws: 2050, azure: 1000, gcp: 800 },
];

const serviceBreakdown = [
  { service: "EC2", cost: 21000, percentage: 35 },
  { service: "S3", cost: 9000, percentage: 15 },
  { service: "RDS", cost: 12000, percentage: 20 },
  { service: "Lambda", cost: 3000, percentage: 5 },
  { service: "Outros", cost: 15000, percentage: 25 },
];

const cloudProviderData = [
  { name: "AWS", value: 36000, color: "#FF9500" },
  { name: "Azure", value: 18000, color: "#0078D4" },
  { name: "GCP", value: 8295, color: "#4285F4" },
];

const chartConfig = {
  aws: { label: "AWS", color: "#FF9500" },
  azure: { label: "Azure", color: "#0078D4" },
  gcp: { label: "GCP", color: "#4285F4" },
};

export const CostOverview = ({ selectedPeriod, onPeriodChange }: CostOverviewProps) => {
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
          <ChartContainer config={chartConfig} className="h-[300px]">
            <AreaChart data={dailyCostData}>
              <XAxis dataKey="date" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area 
                type="monotone" 
                dataKey="aws" 
                stackId="1" 
                stroke="#FF9500" 
                fill="#FF9500" 
                fillOpacity={0.6}
              />
              <Area 
                type="monotone" 
                dataKey="azure" 
                stackId="1" 
                stroke="#0078D4" 
                fill="#0078D4" 
                fillOpacity={0.6}
              />
              <Area 
                type="monotone" 
                dataKey="gcp" 
                stackId="1" 
                stroke="#4285F4" 
                fill="#4285F4" 
                fillOpacity={0.6}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Service Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Principais Serviços por Custo</CardTitle>
          <CardDescription>Distribuição do mês atual</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {serviceBreakdown.map((service) => (
              <div key={service.service} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <span className="font-medium">{service.service}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatCurrency(service.cost)}</div>
                  <div className="text-sm text-muted-foreground">{service.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cloud Provider Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Provedor de Nuvem</CardTitle>
          <CardDescription>Gastos mensais por provedor</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
};
