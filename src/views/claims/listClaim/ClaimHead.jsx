'use client';

import { useMemo } from 'react';
import PageIconHeader from '@components/headers/PageIconHeader';
import StatCardGrid from '@/components/shared/StatCardGrid';

const percent = (value, total) => `${Math.round((Number(value || 0) / Math.max(Number(total || 0), 1)) * 100)}%`;

const getClaimCards = summary => {
  const total = Number(summary.totalClaims || 0);

  return [
    {
      title: 'Total Claims',
      value: total,
      icon: 'mdi:hand-extended-outline',
      color: 'primary',
    },
    {
      title: 'Open Claims',
      value: Number(summary.openClaims || 0),
      // subtitle: percent(summary.openClaims, total),
      icon: 'mdi:file-document-alert-outline',
      color: 'info',
    },
    {
      title: 'Resolved',
      value: Number(summary.resolvedClaims || 0),
      icon: 'mdi:hand-coin-outline',
      color: 'success',
    },
    {
      title: 'Rejected / Cancelled',
      value: Number(summary.rejectedClaims || 0),
      icon: 'mdi:file-document-remove-outline',
      color: 'error',
    },
  ];
};

const ClaimHead = ({ summary = {} }) => {
  const statCards = useMemo(() => getClaimCards(summary), [summary]);

  return (
    <>
      <PageIconHeader
        title="Warranty Claims"
        // description="Customer and staff service requests against issued warranties."
        iconSize={30}
        icon="mdi:hand-extended-outline"
      />
      <StatCardGrid cards={statCards} />
    </>
  );
};

export default ClaimHead;
