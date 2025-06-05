
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

interface CostOverviewProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
}

const dailyCostData = [
  { date: "Jan 1", aws: 450, azure: 200, gcp: 150 },
  { date: "Jan 2", aws: 420, azure: 180, gcp: 160 },
  { date: "Jan 3", aws: 480, azure: 220, gcp: 140 },
  { date: "Jan 4", aws: 390, azure: 190, gcp: 170 },
  { date: "Jan 5", aws: 460, azure: 210, gcp: 150 },
  { date: "Jan 6", aws: 520, azure: 240, gcp: 180 },
  { date: "Jan 7", aws: 410, azure: 200, gcp: 160 },
];

const serviceBreakdown = [
  { service: "EC2", cost: 4200, percentage: 35 },
  { service: "S3", cost: 1800, percentage: 15 },
  { service: "RDS", cost: 2400, percentage: 20 },
  { service: "Lambda", cost: 600, percentage: 5 },
  { service: "Others", cost: 3000, percentage: 25 },
];

const cloudProviderData = [
  { name: "AWS", value: 7200, color: "#FF9500" },
  { name: "Azure", value: 3600, color: "#0078D4" },
  { name: "GCP", value: 1659, color: "#4285F4" },
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
            <CardTitle>Daily Cost Trend</CardTitle>
            <CardDescription>Cost breakdown by cloud provider over time</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant={selectedPeriod === "7d" ? "default" : "outline"} 
              size="sm"
              onClick={() => onPeriodChange("7d")}
            >
              7 Days
            </Button>
            <Button 
              variant={selectedPeriod === "30d" ? "default" : "outline"} 
              size="sm"
              onClick={() => onPeriodChange("30d")}
            >
              30 Days
            </Button>
            <Button 
              variant={selectedPeriod === "90d" ? "default" : "outline"} 
              size="sm"
              onClick={() => onPeriodChange("90d")}
            >
              90 Days
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
          <CardTitle>Top Services by Cost</CardTitle>
          <CardDescription>Current month breakdown</CardDescription>
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
                  <div className="font-semibold">${service.cost}</div>
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
          <CardTitle>Cloud Provider Distribution</CardTitle>
          <CardDescription>Monthly spend by provider</CardDescription>
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
                <span className="font-medium">${provider.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
