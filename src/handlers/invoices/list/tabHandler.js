import { useState } from 'react';

/**
 * tabHandler
 * Manages tab state for invoice list.
 * @param {Object} options - Options object
 * @param {string} options.initialTab - Initial tab value
 * @returns {Object} - { tab, setTab, handleTabChange }
 */
export function tabHandler({ initialTab = 'ALL' } = {}) {
  const [tab, setTab] = useState(initialTab);

  /**
   * Handle tab change event.
   * @param {object} event - The event object.
   * @param {string} newTab - The new tab value.
   */
  const handleTabChange = (event, newTab) => {
    setTab(newTab);
  };

  return {
    tab,
    setTab,
    handleTabChange,
  };
}