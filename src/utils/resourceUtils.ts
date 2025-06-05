
import { Server, Database, HardDrive, Zap } from "lucide-react";

export const getTypeIcon = (type: string) => {
  if (type.includes("virtualMachine") || type.includes("compute") || type.includes("server")) {
    return <Server className="h-4 w-4 text-blue-600" />;
  }
  if (type.includes("database") || type.includes("sql") || type.includes("cosmos")) {
    return <Database className="h-4 w-4 text-green-600" />;
  }
  if (type.includes("storage") || type.includes("disk") || type.includes("blob")) {
    return <HardDrive className="h-4 w-4 text-orange-600" />;
  }
  return <Zap className="h-4 w-4 text-purple-600" />;
};

export const getProviderBadgeColor = (provider: string) => {
  switch (provider.toLowerCase()) {
    case 'azure':
      return 'bg-blue-100 text-blue-700';
    case 'aws':
      return 'bg-orange-100 text-orange-700';
    case 'gcp':
      return 'bg-green-100 text-green-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

export const formatResourceType = (type: string) => {
  // Remove Microsoft.* prefix and make it more readable
  return type.replace(/^Microsoft\./, '').replace(/\//g, ' / ');
};
