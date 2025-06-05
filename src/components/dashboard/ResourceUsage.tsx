
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Server, Database, Zap, HardDrive, Activity } from "lucide-react";
import { formatCurrency } from "@/utils/currency";

const utilizationData = [
  { hour: "00:00", cpu: 45, memory: 62, storage: 78 },
  { hour: "04:00", cpu: 32, memory: 58, storage: 78 },
  { hour: "08:00", cpu: 78, memory: 84, storage: 79 },
  { hour: "12:00", cpu: 89, memory: 92, storage: 80 },
  { hour: "16:00", cpu: 94, memory: 89, storage: 81 },
  { hour: "20:00", cpu: 67, memory: 74, storage: 81 },
];

const resourcesByType = [
  { type: "Computação", count: 45, cost: 41000, utilization: 72 },
  { type: "Armazenamento", count: 120, cost: 12000, utilization: 84 },
  { type: "Rede", count: 15, cost: 6000, utilization: 56 },
  { type: "Base de Dados", count: 8, cost: 18000, utilization: 89 },
];

const topResources = [
  {
    name: "prod-web-server-01",
    type: "Instância EC2",
    provider: "AWS",
    cost: 1200,
    utilization: 45,
    status: "subutilizado"
  },
  {
    name: "analytics-db-cluster",
    type: "Instância RDS", 
    provider: "AWS",
    cost: 3400,
    utilization: 92,
    status: "otimizado"
  },
  {
    name: "backup-storage-eu",
    type: "Bucket S3",
    provider: "AWS", 
    cost: 900,
    utilization: 23,
    status: "subutilizado"
  },
  {
    name: "dev-kubernetes-cluster",
    type: "Cluster AKS",
    provider: "Azure",
    cost: 2100,
    utilization: 78,
    status: "bom"
  },
  {
    name: "ml-training-vm",
    type: "Compute Engine",
    provider: "GCP",
    cost: 4450,
    utilization: 96,
    status: "otimizado"
  }
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "otimizado":
      return <Badge className="bg-green-100 text-green-700">Otimizado</Badge>;
    case "bom":
      return <Badge variant="secondary" className="bg-blue-100 text-blue-700">Bom</Badge>;
    case "subutilizado":
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Subutilizado</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getTypeIcon = (type: string) => {
  if (type.includes("Instância") || type.includes("Server") || type.includes("Cluster")) {
    return <Server className="h-4 w-4" />;
  }
  if (type.includes("Database") || type.includes("RDS")) {
    return <Database className="h-4 w-4" />;
  }
  if (type.includes("Storage") || type.includes("S3") || type.includes("Bucket")) {
    return <HardDrive className="h-4 w-4" />;
  }
  return <Zap className="h-4 w-4" />;
};

const chartConfig = {
  cpu: { label: "CPU", color: "#3B82F6" },
  memory: { label: "Memória", color: "#10B981" },
  storage: { label: "Armazenamento", color: "#F59E0B" },
};

export const ResourceUsage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Uso de Recursos</h2>
        <p className="text-muted-foreground">Monitore a utilização e desempenho da sua infraestrutura</p>
      </div>

      {/* Resource Type Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {resourcesByType.map((resource) => (
          <Card key={resource.type}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {resource.type === "Computação" && <Server className="h-4 w-4 text-blue-600" />}
                  {resource.type === "Armazenamento" && <HardDrive className="h-4 w-4 text-green-600" />}
                  {resource.type === "Rede" && <Zap className="h-4 w-4 text-yellow-600" />}
                  {resource.type === "Base de Dados" && <Database className="h-4 w-4 text-purple-600" />}
                  <span className="font-medium">{resource.type}</span>
                </div>
                <Badge variant="outline">{resource.count}</Badge>
              </div>
              <div className="space-y-1">
                <div className="text-lg font-semibold">{formatCurrency(resource.cost)}</div>
                <div className="text-sm text-muted-foreground">
                  {resource.utilization}% utilizado
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Utilization Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Tendência de Utilização de Recursos</CardTitle>
            <CardDescription>Utilização média nas últimas 24 horas</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <LineChart data={utilizationData}>
                <XAxis dataKey="hour" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="cpu" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="CPU"
                />
                <Line 
                  type="monotone" 
                  dataKey="memory" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Memória"
                />
                <Line 
                  type="monotone" 
                  dataKey="storage" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  name="Armazenamento"
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Resource Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Custo por Tipo de Recurso</CardTitle>
            <CardDescription>Distribuição de gastos mensais</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={resourcesByType}>
                <XAxis dataKey="type" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="cost" fill="#3B82F6" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Resources Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recursos com Maior Custo</CardTitle>
          <CardDescription>Recursos que consomem mais orçamento</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recurso</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Provedor</TableHead>
                <TableHead>Custo Mensal</TableHead>
                <TableHead>Utilização</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topResources.map((resource) => (
                <TableRow key={resource.name}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(resource.type)}
                      <span className="font-medium">{resource.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{resource.type}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{resource.provider}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{formatCurrency(resource.cost)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${resource.utilization}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">{resource.utilization}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(resource.status)}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      <Activity className="h-3 w-3 mr-1" />
                      Detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
