
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Server, Database, Zap, HardDrive, Activity } from "lucide-react";

const utilizationData = [
  { hour: "00:00", cpu: 45, memory: 62, storage: 78 },
  { hour: "04:00", cpu: 32, memory: 58, storage: 78 },
  { hour: "08:00", cpu: 78, memory: 84, storage: 79 },
  { hour: "12:00", cpu: 89, memory: 92, storage: 80 },
  { hour: "16:00", cpu: 94, memory: 89, storage: 81 },
  { hour: "20:00", cpu: 67, memory: 74, storage: 81 },
];

const resourcesByType = [
  { type: "Compute", count: 45, cost: 8200, utilization: 72 },
  { type: "Storage", count: 120, cost: 2400, utilization: 84 },
  { type: "Network", count: 15, cost: 1200, utilization: 56 },
  { type: "Database", count: 8, cost: 3600, utilization: 89 },
];

const topResources = [
  {
    name: "prod-web-server-01",
    type: "EC2 Instance",
    provider: "AWS",
    cost: 240,
    utilization: 45,
    status: "underutilized"
  },
  {
    name: "analytics-db-cluster",
    type: "RDS Instance", 
    provider: "AWS",
    cost: 680,
    utilization: 92,
    status: "optimized"
  },
  {
    name: "backup-storage-eu",
    type: "S3 Bucket",
    provider: "AWS", 
    cost: 180,
    utilization: 23,
    status: "underutilized"
  },
  {
    name: "dev-kubernetes-cluster",
    type: "AKS Cluster",
    provider: "Azure",
    cost: 420,
    utilization: 78,
    status: "good"
  },
  {
    name: "ml-training-vm",
    type: "Compute Engine",
    provider: "GCP",
    cost: 890,
    utilization: 96,
    status: "optimized"
  }
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "optimized":
      return <Badge className="bg-green-100 text-green-700">Optimized</Badge>;
    case "good":
      return <Badge variant="secondary" className="bg-blue-100 text-blue-700">Good</Badge>;
    case "underutilized":
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Underutilized</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getTypeIcon = (type: string) => {
  if (type.includes("Instance") || type.includes("Server") || type.includes("Cluster")) {
    return <Server className="h-4 w-4" />;
  }
  if (type.includes("Database") || type.includes("RDS")) {
    return <Database className="h-4 w-4" />;
  }
  if (type.includes("Storage") || type.includes("S3")) {
    return <HardDrive className="h-4 w-4" />;
  }
  return <Zap className="h-4 w-4" />;
};

const chartConfig = {
  cpu: { label: "CPU", color: "#3B82F6" },
  memory: { label: "Memory", color: "#10B981" },
  storage: { label: "Storage", color: "#F59E0B" },
};

export const ResourceUsage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Resource Usage</h2>
        <p className="text-muted-foreground">Monitor utilization and performance across your infrastructure</p>
      </div>

      {/* Resource Type Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {resourcesByType.map((resource) => (
          <Card key={resource.type}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {resource.type === "Compute" && <Server className="h-4 w-4 text-blue-600" />}
                  {resource.type === "Storage" && <HardDrive className="h-4 w-4 text-green-600" />}
                  {resource.type === "Network" && <Zap className="h-4 w-4 text-yellow-600" />}
                  {resource.type === "Database" && <Database className="h-4 w-4 text-purple-600" />}
                  <span className="font-medium">{resource.type}</span>
                </div>
                <Badge variant="outline">{resource.count}</Badge>
              </div>
              <div className="space-y-1">
                <div className="text-lg font-semibold">${resource.cost}</div>
                <div className="text-sm text-muted-foreground">
                  {resource.utilization}% utilized
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
            <CardTitle>Resource Utilization Trend</CardTitle>
            <CardDescription>Average utilization over the last 24 hours</CardDescription>
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
                  name="Memory"
                />
                <Line 
                  type="monotone" 
                  dataKey="storage" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  name="Storage"
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Resource Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Cost by Resource Type</CardTitle>
            <CardDescription>Monthly spending breakdown</CardDescription>
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
          <CardTitle>Top Cost Resources</CardTitle>
          <CardDescription>Resources consuming the most budget</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resource</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Monthly Cost</TableHead>
                <TableHead>Utilization</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
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
                  <TableCell className="font-medium">${resource.cost}</TableCell>
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
                      Details
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
