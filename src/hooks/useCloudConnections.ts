
import { useState, useEffect } from 'react';
import { cloudService } from '@/services/cloud-integration';
import { supabaseCloudService } from '@/services/supabase-cloud-service';
import { CloudCredentials } from '@/types/cloud-providers';
import { useToast } from '@/hooks/use-toast';

interface ConnectionStatus {
  [provider: string]: boolean | null;
}

interface StoredConnection {
  provider: string;
  credentials: any;
  is_active: boolean;
}

export const useCloudConnections = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({});
  const [storedConnections, setStoredConnections] = useState<StoredConnection[]>([]);
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  // Load stored connections on mount
  useEffect(() => {
    loadStoredConnections();
  }, []);

  const loadStoredConnections = async () => {
    try {
      const connections = await supabaseCloudService.getConnections();
      setStoredConnections(connections);
      const status: ConnectionStatus = {};
      
      for (const connection of connections) {
        // Re-add the provider to cloudService with type casting
        const credentials = connection.credentials as unknown as CloudCredentials;
        cloudService.addProvider(connection.provider as 'aws' | 'azure' | 'gcp', credentials);
        status[connection.provider] = connection.is_active;
      }
      
      setConnectionStatus(status);
    } catch (error) {
      console.error('Error loading stored connections:', error);
      toast({
        title: "Erro ao carregar conexões",
        description: "Não foi possível carregar as conexões salvas.",
        variant: "destructive",
      });
    }
  };

  const saveConnection = async (provider: 'aws' | 'azure' | 'gcp', credentials: CloudCredentials, status: boolean) => {
    try {
      await supabaseCloudService.saveConnection(provider, credentials, status);
      setConnectionStatus(prev => ({ ...prev, [provider]: status }));
      
      // Update stored connections
      await loadStoredConnections();
      
      if (status) {
        toast({
          title: "Conexão salva",
          description: `Conexão com ${provider.toUpperCase()} salva com sucesso.`,
        });
      }
    } catch (error) {
      console.error('Error saving connection:', error);
      toast({
        title: "Erro ao salvar conexão",
        description: "Não foi possível salvar a conexão.",
        variant: "destructive",
      });
    }
  };

  const removeConnection = async (provider: string) => {
    try {
      await supabaseCloudService.removeConnection(provider);
      cloudService.removeProvider(provider);
      setConnectionStatus(prev => ({ ...prev, [provider]: null }));
      
      // Update stored connections
      await loadStoredConnections();
      
      toast({
        title: "Conexão removida",
        description: `Conexão com ${provider.toUpperCase()} removida com sucesso.`,
      });
    } catch (error) {
      console.error('Error removing connection:', error);
      toast({
        title: "Erro ao remover conexão",
        description: "Não foi possível remover a conexão.",
        variant: "destructive",
      });
    }
  };

  const getConnectedProviders = (): string[] => {
    return Object.entries(connectionStatus)
      .filter(([_, status]) => status === true)
      .map(([provider, _]) => provider);
  };

  const getConnectionData = (provider: string) => {
    return storedConnections.find(conn => conn.provider === provider);
  };

  return {
    connectionStatus,
    isLoading,
    setIsLoading,
    saveConnection,
    removeConnection,
    getConnectedProviders,
    getConnectionData,
    loadStoredConnections
  };
};
