
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CostOverview } from "@/components/dashboard/CostOverview";
import { BudgetManagement } from "@/components/dashboard/BudgetManagement";
import { OptimizationRecommendations } from "@/components/dashboard/OptimizationRecommendations";
import { ResourceUsage } from "@/components/dashboard/ResourceUsage";
import { AlertTriangle, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

const Index = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("30d");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-8">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$12,459</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-red-500 inline-flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12.5%
                </span>
                from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">78%</div>
              <p className="text-xs text-muted-foreground">
                $2,200 remaining this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cost Optimization</CardTitle>
              <TrendingDown className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">$3,247</div>
              <p className="text-xs text-muted-foreground">
                Potential monthly savings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Resources</CardTitle>
              <div className="h-4 w-4 bg-blue-600 rounded-full" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">
                Across 3 cloud providers
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Cost Overview</TabsTrigger>
            <TabsTrigger value="budgets">Budget Management</TabsTrigger>
            <TabsTrigger value="optimization">Optimization</TabsTrigger>
            <TabsTrigger value="resources">Resource Usage</TabsTrigger>
            <TabsTrigger value="connections">Cloud Connections</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <CostOverview selectedPeriod={selectedPeriod} onPeriodChange={setSelectedPeriod} />
          </TabsContent>

          <TabsContent value="budgets" className="space-y-6">
            <BudgetManagement />
          </TabsContent>

          <TabsContent value="optimization" className="space-y-6">
            <OptimizationRecommendations />
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <ResourceUsage />
          </TabsContent>

          <TabsContent value="connections" className="space-y-6">
            <CloudConnectionManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
