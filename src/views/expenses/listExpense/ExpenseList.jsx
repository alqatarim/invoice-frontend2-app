import React from 'react';
import { Icon } from '@iconify/react';
import { Button, Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ExpenseHead from '@/views/expenses/listExpense/expenseHead';
import CustomListTable from '@/components/custom-components/CustomListTable';
import { getExpenseColumns } from './expenseColumns';
const ExpenseList = ({
     expenses = [],
     pagination = { current: 1, pageSize: 10, total: 0 },
     loading = false,
     permissions = {},
     searchTerm = '',
     sortBy = '',
     sortDirection = 'asc',
     onOpenAddDialog,
     onPageChange,
     onPageSizeChange,
     onSortRequest,
     onSearchInputChange,
     onDelete,
     onView,
     onEdit,
}) => {
     const theme = useTheme();

     const tableColumns = getExpenseColumns({
          theme,
          permissions,
          onDelete,
          onView,
          onEdit,
     });

     return (
          <div className='flex flex-col gap-5'>
               <ExpenseHead expenseListData={expenses} />

               <Grid container spacing={3}>
                    <Grid size={{ xs: 12 }}>
                         <CustomListTable
                              addRowButton={
                                   permissions.canCreate ? (
                                        <Button
                                             onClick={onOpenAddDialog}
                                             variant='contained'
                                             startIcon={<Icon icon='tabler:plus' />}
                                        >
                                             Add Expense
                                        </Button>
                                   ) : null
                              }
                              columns={tableColumns}
                              rows={expenses}
                              loading={loading}
                              pagination={{
                                   page: pagination.current - 1,
                                   pageSize: pagination.pageSize,
                                   total: pagination.total,
                              }}
                              onPageChange={onPageChange}
                              onRowsPerPageChange={onPageSizeChange}
                              onSort={onSortRequest}
                              sortBy={sortBy}
                              sortDirection={sortDirection}
                              noDataText={
                                   searchTerm
                                        ? 'No expenses match the current page search.'
                                        : 'No expenses found.'
                              }
                              rowKey={(row) => row._id || row.id}
                              showSearch
                              searchValue={searchTerm}
                              onSearchChange={onSearchInputChange}
                              searchPlaceholder='Search current page...'
                              onRowClick={
                                   permissions.canView ? (row) => onView(row._id) : undefined
                              }
                              enableHover
                         />
                    </Grid>
               </Grid>
          </div>
     );
};

export default ExpenseList;