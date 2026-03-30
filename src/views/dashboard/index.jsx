'use client';

import React from 'react';
import { Button, Paper, Stack, Typography } from '@mui/material';
import AppSnackbar from '@/components/shared/AppSnackbar';
import Dashboard from './Dashboard';
import { useDashboardHandler } from './handler';

const DashboardIndex = ({
  initialDashboardData = null,
  initialBranchId = '',
}) => {
  const handler = useDashboardHandler({
    initialDashboardData,
    initialBranchId,
  });

  if (!handler.hasDashboardData) {
    return (
      <>
        <Paper className='flex flex-col items-center gap-4 p-8 text-center'>
          <Stack spacing={1}>
            <Typography variant='h6'>Unable to load dashboard data.</Typography>
            <Typography variant='body2' color='text.secondary'>
              Refresh to retry the initial dashboard request.
            </Typography>
          </Stack>

          <Button
            variant='contained'
            onClick={handler.handleRefresh}
            disabled={handler.isRefreshing}
          >
            {handler.isRefreshing ? 'Retrying...' : 'Retry'}
          </Button>
        </Paper>

        <AppSnackbar
          open={handler.snackbar.open}
          message={handler.snackbar.message}
          severity={handler.snackbar.severity}
          onClose={handler.closeSnackbar}
          autoHideDuration={6000}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
      </>
    );
  }

  return (
    <>
      <Dashboard
        dashboardData={handler.dashboardData}
        dashboardFilters={handler.dashboardFilters}
        filterValue={handler.filterValue}
        selectedBranchId={handler.selectedBranchId}
        productsTab={handler.productsTab}
        customersTab={handler.customersTab}
        financeTab={handler.financeTab}
        isRefreshing={handler.isRefreshing}
        isGeneratingAIForecast={handler.isGeneratingAIForecast}
        aiInsightCards={handler.aiInsightCards}
        currencyData={handler.currencyData}
        storeBranches={handler.storeBranches}
        hasStoreScope={handler.hasStoreScope}
        isRestrictedToAssignedStores={handler.isRestrictedToAssignedStores}
        selectedStore={handler.selectedStore}
        activeFilterLabel={handler.activeFilterLabel}
        storeScopeLabel={handler.storeScopeLabel}
        storeScopeHelperText={handler.storeScopeHelperText}
        heroSummary={handler.heroSummary}
        metricCards={handler.metricCards}
        topProducts={handler.topProducts}
        topCustomers={handler.topCustomers}
        inventoryAlerts={handler.inventoryAlerts}
        financeTrendData={handler.financeTrendData}
        handleFilterChange={handler.handleFilterChange}
        handleStoreScopeChange={handler.handleStoreScopeChange}
        handleProductsTabChange={handler.handleProductsTabChange}
        handleCustomersTabChange={handler.handleCustomersTabChange}
        handleFinanceTabChange={handler.handleFinanceTabChange}
        handleRefresh={handler.handleRefresh}
      />

      <AppSnackbar
        open={handler.snackbar.open}
        message={handler.snackbar.message}
        severity={handler.snackbar.severity}
        onClose={handler.closeSnackbar}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
};

export default DashboardIndex;
