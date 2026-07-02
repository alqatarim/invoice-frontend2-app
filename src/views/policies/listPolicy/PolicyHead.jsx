'use client';

import { useMemo } from 'react';
import PageIconHeader from '@components/headers/PageIconHeader';
import StatCardGrid from '@/components/shared/StatCardGrid';

const percent = (value, total) => `${Math.round((Number(value || 0) / Math.max(Number(total || 0), 1)) * 100)}%`;

const getPolicyCards = summary => {
  const total = Number(summary.totalPolicies || 0);

  return [
    {
      title: 'Total Policies',
      value: total,
      icon: 'mdi:shield-edit-outline',
      color: 'primary',
    },
    {
      title: 'Active',
      value: Number(summary.activePolicies || 0),
      // subtitle: percent(summary.activePolicies, total),
      icon: 'mdi:shield-check-outline',
      color: 'success',
    },
    {
      title: 'Extensions',
      value: Number(summary.extensionAllowed || 0),
      icon: 'mdi:shield-plus-outline',
      color: 'info',
    },
    {
      title: 'Serial Required',
      value: Number(summary.serialRequired || 0),
      icon: 'mdi:barcode-scan',
      color: 'warning',
    },
  ];
};

const PolicyHead = ({ summary = {} }) => {
  const statCards = useMemo(() => getPolicyCards(summary), [summary]);

  return (
    <>
      <PageIconHeader
        title="Warranty Policies"
        // description="Reusable warranty terms linked to products at the time of sale."
        iconSize={30}
        icon="mdi:shield-edit-outline"
      />
      <StatCardGrid cards={statCards} />
    </>
  );
};

export default PolicyHead;
