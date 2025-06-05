
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Plus, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

const budgets = [
  {
    id: 1,
    name: "Production Environment",
    allocated: 15000,
    spent: 11700,
    period: "Monthly",
    status: "warning",
    daysLeft: 8,
  },
  {
    id: 2,
    name: "Development & Testing",
    allocated: 5000,
    spent: 3200,
    period: "Monthly",
    status: "good",
    daysLeft: 8,
  },
  {
    id: 3,
    name: "Data Storage & Analytics",
    allocated: 8000,
    spent: 8150,
    period: "Monthly",
    status: "exceeded",
    daysLeft: 8,
  },
  {
    id: 4,
    name: "Security & Compliance",
    allocated: 3000,
    spent: 1800,
    period: "Monthly",
    status: "good",
    daysLeft: 8,
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "good":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case "exceeded":
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return null;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "good":
      return <Badge variant="secondary" className="bg-green-100 text-green-700">On Track</Badge>;
    case "warning":
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">At Risk</Badge>;
    case "exceeded":
      return <Badge variant="destructive">Exceeded</Badge>;
    default:
      return null;
  }
};

export const BudgetManagement = () => {
  return (
    <div className="space-y-6">
      {/* Budget Overview */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Budget Management</h2>
          <p className="text-muted-foreground">Monitor and control your cloud spending</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Budget
        </Button>
      </div>

      {/* Budget Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Budgets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$31,000</div>
            <p className="text-sm text-muted-foreground">Allocated this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$24,850</div>
            <p className="text-sm text-muted-foreground">80.2% of budget used</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">$6,150</div>
            <p className="text-sm text-muted-foreground">8 days left in period</p>
          </CardContent>
        </Card>
      </div>

      {/* Individual Budget Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {budgets.map((budget) => {
          const percentage = (budget.spent / budget.allocated) * 100;
          const isExceeded = percentage > 100;
          
          return (
            <Card key={budget.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{budget.name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(budget.status)}
                    {getStatusBadge(budget.status)}
                  </div>
                </div>
                <CardDescription>{budget.period} Budget</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Spent: ${budget.spent.toLocaleString()}</span>
                    <span>Budget: ${budget.allocated.toLocaleString()}</span>
                  </div>
                  <Progress 
                    value={Math.min(percentage, 100)} 
                    className={`h-2 ${isExceeded ? '[&>div]:bg-red-500' : ''}`}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{percentage.toFixed(1)}% used</span>
                    <span>{budget.daysLeft} days left</span>
                  </div>
                </div>

                {isExceeded && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">
                      Budget exceeded by ${(budget.spent - budget.allocated).toLocaleString()}
                    </p>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Edit Budget
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
