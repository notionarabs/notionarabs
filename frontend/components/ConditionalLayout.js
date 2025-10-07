'use client';

import { useMaintenance } from '../contexts/MaintenanceContext';
import { useAuth } from '../contexts/AuthContext';
import NavigationWrapper from './NavigationWrapper';
import NavigationHandler from './NavigationHandler';
import LoadingIndicator from './LoadingIndicator';

export default function ConditionalLayout({ children }) {
  const { isMaintenanceMode, loading } = useMaintenance();
  const { user, isAuthenticated } = useAuth();

  // Show loading indicator
  const showLoading = loading;

  // Show maintenance page (hide navigation)
  const showMaintenance = isMaintenanceMode && (!isAuthenticated || user?.role !== 'admin');

  // Show normal layout with navigation
  const showNormalLayout = !showLoading && !showMaintenance;

  return (
    <>
      {showLoading && <LoadingIndicator />}
      
      {showMaintenance && (
        <>
          {/* Only show quick toggle for admins during maintenance */}
          {isAuthenticated && user?.role === 'admin' && (
            <div className="fixed bottom-4 right-4 z-50">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
              >
                Refresh Page
              </button>
            </div>
          )}
        </>
      )}

      {showNormalLayout && (
        <>
          <NavigationWrapper />
          <NavigationHandler />
          <LoadingIndicator />
        </>
      )}

      {children}
    </>
  );
}
