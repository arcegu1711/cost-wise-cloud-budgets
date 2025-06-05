
import { useState, useEffect } from 'react';
import { cloudService } from '@/services/cloud-integration';
import { CloudCredentials } from '@/types/cloud-providers';

interface ConnectionStatus {
  [provider: string]: boolean | null;
}

interface StoredConnection {
  provider: 'aws' | 'azure' | 'gcp';
  credentials: CloudCredentials;
  status: boolean;
  connectedAt: string;
}

export const useCloudConnections = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({});
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});

  // Load stored connections on mount
  useEffect(() => {
    loadStoredConnections();
  }, []);

  const loadStoredConnections = async () => {
    try {
      const stored = localStorage.getItem('cloudConnections');
      if (stored) {
        const connections: StoredConnection[] = JSON.parse(stored);
        const status: ConnectionStatus = {};
        
        for (const connection of connections) {
          // Re-add the provider to cloudService
          cloudService.addProvider(connection.provider, connection.credentials);
          status[connection.provider] = connection.status;
        }
        
        setConnectionStatus(status);
      }
    } catch (error) {
      console.error('Error loading stored connections:', error);
    }
  };

  const saveConnection = (provider: 'aws' | 'azure' | 'gcp', credentials: CloudCredentials, status: boolean) => {
    try {
      const stored = localStorage.getItem('cloudConnections');
      let connections: StoredConnection[] = stored ? JSON.parse(stored) : [];
      
      // Remove existing connection for this provider
      connections = connections.filter(conn => conn.provider !== provider);
      
      if (status) {
        // Add new connection
        connections.push({
          provider,
          credentials,
          status,
          connectedAt: new Date().toISOString()
        });
      }
      
      localStorage.setItem('cloudConnections', JSON.stringify(connections));
      setConnectionStatus(prev => ({ ...prev, [provider]: status }));
    } catch (error) {
      console.error('Error saving connection:', error);
    }
  };

  const removeConnection = (provider: string) => {
    try {
      const stored = localStorage.getItem('cloudConnections');
      if (stored) {
        let connections: StoredConnection[] = JSON.parse(stored);
        connections = connections.filter(conn => conn.provider !== provider);
        localStorage.setItem('cloudConnections', JSON.stringify(connections));
      }
      
      cloudService.removeProvider(provider);
      setConnectionStatus(prev => ({ ...prev, [provider]: null }));
    } catch (error) {
      console.error('Error removing connection:', error);
    }
  };

  const getConnectedProviders = (): string[] => {
    return Object.entries(connectionStatus)
      .filter(([_, status]) => status === true)
      .map(([provider, _]) => provider);
  };

  return {
    connectionStatus,
    isLoading,
    setIsLoading,
    saveConnection,
    removeConnection,
    getConnectedProviders,
    loadStoredConnections
  };
};
