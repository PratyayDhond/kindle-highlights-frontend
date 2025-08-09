// Create src/components/RefreshButton.tsx
import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface CacheRefreshConfig {
  cacheKey: string;
  apiUrl: string;
  dataPath?: string;
  transform?: (data: any) => any;
}

interface RefreshButtonProps {
  configs: CacheRefreshConfig[];
  onRefreshComplete?: (results: { success: boolean; data?: any; error?: string }[]) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  position?: 'left' | 'right';
  showLabel?: boolean;
}

const RefreshButton: React.FC<RefreshButtonProps> = ({
  configs,
  onRefreshComplete,
  className = '',
  size = 'md',
  position = 'left',
  showLabel = true
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Match CoinsDashboard exact height and styling
  const sizeClasses = {
    sm: 'p-3 h-8',
    md: 'p-4 h-10', // Match CoinsDashboard height
    lg: 'p-5 h-12'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const results: { success: boolean; data?: any; error?: string }[] = [];
    
    try {
      // Clear specified caches
      configs.forEach(config => {
        localStorage.removeItem(config.cacheKey);
      });

      // Handle special cache patterns
      const cacheKeys = configs.map(c => c.cacheKey);
      
      // Clear scroll position caches if requested
      if (cacheKeys.includes('scroll_positions')) {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('book_scroll_position_')) {
            localStorage.removeItem(key);
          }
        });
      }

      // Clear staging area caches if requested
      if (cacheKeys.includes('staging_areas')) {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('staging_')) {
            localStorage.removeItem(key);
          }
        });
      }

      // Fetch fresh data from APIs
      for (const config of configs) {
        if (config.apiUrl) {
          try {
            const response = await fetch(config.apiUrl, {
              credentials: 'include',
              method: 'GET',
            });

            if (!response.ok) {
              throw new Error(`Failed to fetch data from ${config.apiUrl}`);
            }

            const responseData = await response.json();
            
            let dataToCache = responseData;
            if (config.dataPath) {
              dataToCache = responseData[config.dataPath];
            }

            if (config.transform) {
              dataToCache = config.transform(dataToCache);
            }

            if (config.cacheKey !== 'scroll_positions' && config.cacheKey !== 'staging_areas') {
              if (config.cacheKey === 'dashboard_stats') {
                localStorage.setItem(config.cacheKey, JSON.stringify({
                  stats: dataToCache,
                  cachedAt: new Date().toISOString()
                }));
              } else {
                localStorage.setItem(config.cacheKey, JSON.stringify(dataToCache));
              }
            }

            results.push({ success: true, data: dataToCache });
          } catch (error) {
            console.error(`Failed to refresh ${config.cacheKey}:`, error);
            results.push({ 
              success: false, 
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        } else {
          results.push({ success: true });
        }
      }

      if (onRefreshComplete) {
        await onRefreshComplete(results);
      }

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;

      if (failureCount === 0) {
        toast.success(`Successfully refreshed ${successCount} cache${successCount > 1 ? 's' : ''}!`);
      } else if (successCount > 0) {
        toast.warning(`Refreshed ${successCount}/${configs.length} caches. ${failureCount} failed.`);
      } else {
        toast.error('Failed to refresh data. Please try again.');
      }

    } catch (error) {
      console.error('Refresh failed:', error);
      toast.error('Failed to refresh data. Please try again.');
      results.push({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className={`
        flex items-center justify-center gap-2 bg-white/80 shadow rounded font-semibold
        text-royal-700 hover:bg-gray-100 transition-all duration-200
        ${sizeClasses[size]}
        ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      title="Refresh cached data"
    >
      <RefreshCw 
        className={`${iconSizes[size]} ${isRefreshing ? 'animate-spin' : ''}`} 
      />
    </button>
  );
};

export default RefreshButton;