'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const MaintenanceContext = createContext();

export const useMaintenance = () => {
  const context = useContext(MaintenanceContext);
  if (!context) {
    throw new Error('useMaintenance must be used within a MaintenanceProvider');
  }
  return context;
};

export const MaintenanceProvider = ({ children }) => {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasCheckedMaintenance, setHasCheckedMaintenance] = useState(false);

  const checkMaintenanceMode = async () => {
    try {
      // Skip maintenance mode check in development
      if (process.env.NODE_ENV === 'development') {
        setIsMaintenanceMode(false);
        if (typeof window !== 'undefined') {
          window.isMaintenanceMode = false;
        }
        setLoading(false);
        setHasCheckedMaintenance(true);
        return;
      }

      const response = await api.get('/settings/public');

      if (response.data.success && response.data.settings) {
        const maintenanceMode = response.data.settings.maintenanceMode;
        setIsMaintenanceMode(maintenanceMode);

        // Set global state for API interceptor
        if (typeof window !== 'undefined') {
          window.isMaintenanceMode = maintenanceMode;
        }
      }
    } catch (error) {
      // If we can't check settings, assume not in maintenance mode
      console.error('Could not check maintenance mode:', error);
      setIsMaintenanceMode(false);

      if (typeof window !== 'undefined') {
        window.isMaintenanceMode = false;
      }
    } finally {
      setLoading(false);
      setHasCheckedMaintenance(true);
    }
  };

  useEffect(() => {
    // Check maintenance mode immediately on mount
    checkMaintenanceMode();

    // Check for maintenance mode changes every 30 seconds
    const interval = setInterval(checkMaintenanceMode, 30000);

    return () => clearInterval(interval);
  }, []);

  const value = {
    isMaintenanceMode,
    loading,
    hasCheckedMaintenance,
    checkMaintenanceMode
  };

  return (
    <MaintenanceContext.Provider value={value}>
      {children}
    </MaintenanceContext.Provider>
  );
};
