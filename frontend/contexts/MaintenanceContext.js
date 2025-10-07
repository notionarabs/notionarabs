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
  const [loading, setLoading] = useState(false); // Start as false to prevent initial loading state
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

        // Only update state if value has changed
        setIsMaintenanceMode(prevMode => {
          if (prevMode !== maintenanceMode) {
            // Set global state for API interceptor
            if (typeof window !== 'undefined') {
              window.isMaintenanceMode = maintenanceMode;
            }
            return maintenanceMode;
          }
          return prevMode;
        });
      }
    } catch (error) {
      // If we can't check settings, assume not in maintenance mode
      console.error('Could not check maintenance mode:', error);

      // Only update state if value has changed
      setIsMaintenanceMode(prevMode => {
        if (prevMode !== false) {
          if (typeof window !== 'undefined') {
            window.isMaintenanceMode = false;
          }
          return false;
        }
        return prevMode;
      });
    } finally {
      setLoading(false);
      setHasCheckedMaintenance(true);
    }
  };

  useEffect(() => {
    // Delay initial check slightly to prevent double load
    const timeoutId = setTimeout(() => {
      checkMaintenanceMode();
    }, 100);

    // Only set up interval in production
    if (process.env.NODE_ENV === 'production') {
      const interval = setInterval(checkMaintenanceMode, 60000);
      return () => {
        clearTimeout(timeoutId);
        clearInterval(interval);
      };
    }

    return () => clearTimeout(timeoutId);
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
