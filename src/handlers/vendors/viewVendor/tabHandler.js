import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export function useTabHandler() {
  const searchParams = useSearchParams();
  const [currentTab, setCurrentTab] = useState('details');

  // Initialize tab from URL
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['details', 'ledger'].includes(tab)) {
      setCurrentTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = useCallback((event, newValue) => {
    const tabName = typeof newValue === 'number'
      ? (newValue === 0 ? 'details' : 'ledger')
      : newValue;

    setCurrentTab(tabName);
    const url = new URL(window.location);
    url.searchParams.set('tab', tabName);
    window.history.replaceState({}, '', url.toString());
  }, []);

  return {
    currentTab,
    handleTabChange
  };
}