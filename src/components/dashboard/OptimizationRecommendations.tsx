
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingDown, 
  Server, 
  Database, 
  Zap, 
  Clock, 
  DollarSign,
  ChevronRight 
} from "lucide-react";

const recommendations = [
  {
    id: 1,
    title: "Right-size EC2 Instances",
    description: "15 instances are oversized and can be downgraded",
    potential_savings: 1200,
    effort: "Low",
    impact: "High",
    category: "compute",
    resources: 15,
    provider: "AWS"
  },
  {
    id: 2,
    title: "Reserved Instance Opportunities",
    description: "Purchase RIs for consistent workloads",
    potential_savings: 850,
    effort: "Medium",
    impact: "High", 
    category: "commitment",
    resources: 8,
    provider: "AWS"
  },
  {
    id: 3,
    title: "Unused Storage Volumes",
    description: "Remove 12 unattached EBS volumes",
    potential_savings: 340,
    effort: "Low",
    impact: "Medium",
    category: "storage",
    resources: 12,
    provider: "AWS"
  },
  {
    id: 4,
    title: "Idle Load Balancers",
    description: "4 load balancers with no traffic",
    potential_savings: 180,
    effort: "Low",
    impact: "Low",
    category: "network",
    resources: 4,
    provider: "AWS"
  },
  {
    id: 5,
    title: "Azure VM Optimization",
    description: "Switch to spot instances for dev workloads",
    potential_savings: 920,
    effort: "Medium",
    impact: "High",
    category: "compute",
    resources: 6,
    provider: "Azure"
  }
];

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

export const OptimizationRecommendations = () => {
  const totalSavings = recommendations.reduce((sum, rec) => sum + rec.potential_savings, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Cost Optimization</h2>
          <p className="text-muted-foreground">AI-powered recommendations to reduce your cloud costs</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-600">${totalSavings}</div>
          <p className="text-sm text-muted-foreground">Potential monthly savings</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-4 w-4 text-green-600" />
              <div>
                <div className="font-semibold">{recommendations.length}</div>
                <div className="text-sm text-muted-foreground">Recommendations</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Server className="h-4 w-4 text-blue-600" />
              <div>
                <div className="font-semibold">45</div>
                <div className="text-sm text-muted-foreground">Resources Affected</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <div>
                <div className="font-semibold">3</div>
                <div className="text-sm text-muted-foreground">Quick Wins</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <div className="font-semibold">26%</div>
                <div className="text-sm text-muted-foreground">Potential Reduction</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Recommendations</TabsTrigger>
          <TabsTrigger value="high-impact">High Impact</TabsTrigger>
          <TabsTrigger value="quick-wins">Quick Wins</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {recommendations.map((rec) => (
            <Card key={rec.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      {getCategoryIcon(rec.category)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold">{rec.title}</h3>
                        <Badge variant="outline">{rec.provider}</Badge>
                      </div>
                      
                      <p className="text-muted-foreground mb-3">{rec.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <span className="text-muted-foreground">Resources:</span>
                          <span className="font-medium">{rec.resources}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-muted-foreground">Effort:</span>
                          {getEffortBadge(rec.effort)}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-muted-foreground">Impact:</span>
                          {getImpactBadge(rec.impact)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-green-600">
                      ${rec.potential_savings}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">monthly</p>
                    
                    <Button size="sm" className="w-full">
                      View Details
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="high-impact">
          <div className="space-y-4">
            {recommendations
              .filter(rec => rec.impact === "High")
              .map((rec) => (
                <Card key={rec.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    {/* Same content structure as above */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="p-2 bg-slate-100 rounded-lg">
                          {getCategoryIcon(rec.category)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold">{rec.title}</h3>
                            <Badge variant="outline">{rec.provider}</Badge>
                          </div>
                          
                          <p className="text-muted-foreground mb-3">{rec.description}</p>
                          
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <span className="text-muted-foreground">Resources:</span>
                              <span className="font-medium">{rec.resources}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-muted-foreground">Effort:</span>
                              {getEffortBadge(rec.effort)}
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-muted-foreground">Impact:</span>
                              {getImpactBadge(rec.impact)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-green-600">
                          ${rec.potential_savings}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">monthly</p>
                        
                        <Button size="sm" className="w-full">
                          View Details
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="quick-wins">
          <div className="space-y-4">
            {recommendations
              .filter(rec => rec.effort === "Low")
              .map((rec) => (
                <Card key={rec.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    {/* Same content structure as above */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="p-2 bg-slate-100 rounded-lg">
                          {getCategoryIcon(rec.category)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold">{rec.title}</h3>
                            <Badge variant="outline">{rec.provider}</Badge>
                          </div>
                          
                          <p className="text-muted-foreground mb-3">{rec.description}</p>
                          
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <span className="text-muted-foreground">Resources:</span>
                              <span className="font-medium">{rec.resources}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-muted-foreground">Effort:</span>
                              {getEffortBadge(rec.effort)}
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-muted-foreground">Impact:</span>
                              {getImpactBadge(rec.impact)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-green-600">
                          ${rec.potential_savings}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">monthly</p>
                        
                        <Button size="sm" className="w-full">
                          View Details
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
