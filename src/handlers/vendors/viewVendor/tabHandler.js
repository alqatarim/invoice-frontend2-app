import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export function useTabHandler(defaultTab = 'details', isDialog = false) {
  const searchParams = useSearchParams();
  const [currentTab, setCurrentTab] = useState(defaultTab);

  // Initialize tab from URL or use default (only for non-dialog mode)
  useEffect(() => {
    if (!isDialog) {
      const tab = searchParams.get('tab');
      if (tab && ['details', 'ledger'].includes(tab)) {
        setCurrentTab(tab);
      } else if (defaultTab && ['details', 'ledger'].includes(defaultTab)) {
        setCurrentTab(defaultTab);
      }
    } else {
      // For dialog mode, just use the defaultTab
      setCurrentTab(defaultTab);
    }
  }, [searchParams, defaultTab, isDialog]);

  const handleTabChange = useCallback((event, newValue) => {
    const tabName = typeof newValue === 'number'
      ? (newValue === 0 ? 'details' : 'ledger')
      : newValue;

    setCurrentTab(tabName);
    
    // Only update URL for non-dialog mode
    if (!isDialog) {
      const url = new URL(window.location);
      url.searchParams.set('tab', tabName);
      window.history.replaceState({}, '', url.toString());
    }
  }, [isDialog]);

  return {
    currentTab,
    handleTabChange
  };
}