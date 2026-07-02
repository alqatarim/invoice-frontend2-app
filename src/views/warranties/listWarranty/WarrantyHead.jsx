'use client';

import { useMemo } from 'react';
import PageIconHeader from '@components/headers/PageIconHeader';
import StatCardGrid from '@/components/shared/StatCardGrid';

const percent = (value, total) => `${Math.round((Number(value || 0) / Math.max(Number(total || 0), 1)) * 100)}%`;

const getWarrantyCards = summary => {
  const total = Number(summary.totalWarranties || 0);

  return [
    {
      title: 'Total Warranties',
      value: total,
      icon: 'mdi:shield-star-outline',
      color: 'primary',
    },
    {
      title: 'Active',
      value: Number(summary.activeWarranties || 0),
      // subtitle: percent(summary.activeWarranties, total),
      icon: 'mdi:shield-check-outline',
      color: 'success',
    },
    {
      title: 'Open Claims',
      value: Number(summary.openClaims || 0),
      icon: 'mdi:shield-alert-outline',
      color: 'info',
    },
    {
      title: 'Expiring Soon',
      value: Number(summary.expiringSoon || 0),
      icon: 'mdi:shield-off-outline',
      color: 'warning',
    },
  ];
};

const WarrantyHead = ({ summary = {} }) => {
  const statCards = useMemo(() => getWarrantyCards(summary), [summary]);

  return (
    <>
      <PageIconHeader
        title="Warranties"
        // description="Issued customer coverage, lifecycle status, returns, and claim eligibility."
        iconSize={30}
        icon="mdi:shield-star-outline"
      />
      <StatCardGrid cards={statCards} />
    </>
  );
};

export default WarrantyHead;
