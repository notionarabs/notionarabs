'use client';

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';

export default function QuickMaintenanceToggle() {
  const [loading, setLoading] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Only show for admins
  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  const toggleMaintenance = async () => {
    try {
      setLoading(true);
      const response = await api.post('/admin/toggle-maintenance');

      if (response.data.success) {
        setMaintenanceMode(response.data.maintenanceMode);
        alert(`Maintenance mode ${response.data.maintenanceMode ? 'enabled' : 'disabled'}`);
      }
    } catch (error) {
      console.error('Error toggling maintenance mode:', error);
      alert('Error toggling maintenance mode');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={toggleMaintenance}
        disabled={loading}
        className={`px-4 py-2 rounded-lg text-white font-medium ${maintenanceMode
          ? 'bg-red-600 hover:bg-red-700'
          : 'bg-green-600 hover:bg-green-700'
          } disabled:opacity-50`}
      >
        {loading ? 'Loading...' :
          maintenanceMode ? 'Disable Maintenance' : 'Enable Maintenance'}
      </button>
    </div>
  );
}
