/**
 * Performance Monitoring Dashboard
 * Provides real-time performance metrics and optimization recommendations
 */

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

const PerformanceDashboard = () => {
  const [metrics, setMetrics] = useState({
    apiResponseTime: 0,
    databaseQueryTime: 0,
    cacheHitRate: 0,
    memoryUsage: 0,
    activeConnections: 0,
  });

  const [recommendations, setRecommendations] = useState([]);

  // Fetch performance stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ['performance-stats'],
    queryFn: async () => {
      const response = await api.get('/admin/performance-stats');
      return response.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000,
  });

  useEffect(() => {
    if (stats) {
      setMetrics({
        apiResponseTime: stats.avgResponseTime || 0,
        databaseQueryTime: stats.avgQueryTime || 0,
        cacheHitRate: stats.cacheHitRate || 0,
        memoryUsage: stats.memoryUsage || 0,
        activeConnections: stats.activeConnections || 0,
      });

      // Generate recommendations based on metrics
      const newRecommendations = [];

      if (stats.avgResponseTime > 1000) {
        newRecommendations.push({
          type: 'warning',
          title: 'Slow API Response',
          message: 'Average API response time is above 1 second. Consider optimizing database queries and enabling caching.',
          action: 'Enable Redis caching and optimize database indexes'
        });
      }

      if (stats.avgQueryTime > 500) {
        newRecommendations.push({
          type: 'error',
          title: 'Slow Database Queries',
          message: 'Database queries are taking too long. Check if indexes are properly configured.',
          action: 'Run database optimization script'
        });
      }

      if (stats.cacheHitRate < 0.7) {
        newRecommendations.push({
          type: 'info',
          title: 'Low Cache Hit Rate',
          message: 'Cache hit rate is below 70%. Consider adjusting cache strategies.',
          action: 'Review cache configuration and TTL settings'
        });
      }

      if (stats.memoryUsage > 0.8) {
        newRecommendations.push({
          type: 'warning',
          title: 'High Memory Usage',
          message: 'Memory usage is above 80%. Consider optimizing memory usage.',
          action: 'Review memory leaks and optimize data structures'
        });
      }

      if (stats.activeConnections > 4) {
        newRecommendations.push({
          type: 'info',
          title: 'High Connection Count',
          message: 'Active database connections are high. Monitor connection pool usage.',
          action: 'Consider adjusting connection pool settings'
        });
      }

      setRecommendations(newRecommendations);
    }
  }, [stats]);

  const getStatusColor = (value, thresholds) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (value, thresholds) => {
    if (value <= thresholds.good) return '✅';
    if (value <= thresholds.warning) return '⚠️';
    return '❌';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading performance metrics...</span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Performance Dashboard</h2>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">API Response Time</p>
              <p className={`text-2xl font-bold ${getStatusColor(metrics.apiResponseTime, { good: 200, warning: 500 })}`}>
                {metrics.apiResponseTime.toFixed(0)}ms
              </p>
            </div>
            <span className="text-2xl">
              {getStatusIcon(metrics.apiResponseTime, { good: 200, warning: 500 })}
            </span>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Database Query Time</p>
              <p className={`text-2xl font-bold ${getStatusColor(metrics.databaseQueryTime, { good: 100, warning: 300 })}`}>
                {metrics.databaseQueryTime.toFixed(0)}ms
              </p>
            </div>
            <span className="text-2xl">
              {getStatusIcon(metrics.databaseQueryTime, { good: 100, warning: 300 })}
            </span>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cache Hit Rate</p>
              <p className={`text-2xl font-bold ${getStatusColor(metrics.cacheHitRate, { good: 0.8, warning: 0.6 })}`}>
                {(metrics.cacheHitRate * 100).toFixed(1)}%
              </p>
            </div>
            <span className="text-2xl">
              {getStatusIcon(metrics.cacheHitRate, { good: 0.8, warning: 0.6 })}
            </span>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Memory Usage</p>
              <p className={`text-2xl font-bold ${getStatusColor(metrics.memoryUsage, { good: 0.6, warning: 0.8 })}`}>
                {(metrics.memoryUsage * 100).toFixed(1)}%
              </p>
            </div>
            <span className="text-2xl">
              {getStatusIcon(metrics.memoryUsage, { good: 0.6, warning: 0.8 })}
            </span>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Connections</p>
              <p className={`text-2xl font-bold ${getStatusColor(metrics.activeConnections, { good: 2, warning: 4 })}`}>
                {metrics.activeConnections}
              </p>
            </div>
            <span className="text-2xl">
              {getStatusIcon(metrics.activeConnections, { good: 2, warning: 4 })}
            </span>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Performance Recommendations</h3>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${rec.type === 'error'
                    ? 'bg-red-50 border-red-400'
                    : rec.type === 'warning'
                      ? 'bg-yellow-50 border-yellow-400'
                      : 'bg-blue-50 border-blue-400'
                  }`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <span className="text-lg">
                      {rec.type === 'error' ? '🚨' : rec.type === 'warning' ? '⚠️' : 'ℹ️'}
                    </span>
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium text-gray-900">{rec.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{rec.message}</p>
                    <p className="text-sm font-medium text-gray-800 mt-2">
                      Action: {rec.action}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Tips */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-blue-900">Performance Tips</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Use Redis caching for frequently accessed data</li>
          <li>• Optimize database queries with proper indexes</li>
          <li>• Implement pagination for large datasets</li>
          <li>• Use lean() queries when you don't need Mongoose documents</li>
          <li>• Enable compression middleware</li>
          <li>• Monitor memory usage and connection pool size</li>
          <li>• Use CDN for static assets</li>
          <li>• Implement proper error handling</li>
        </ul>
      </div>

      {/* Last Updated */}
      <div className="mt-6 text-sm text-gray-500 text-center">
        Last updated: {new Date().toLocaleString()}
      </div>
    </div>
  );
};

export default PerformanceDashboard;
