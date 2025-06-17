import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Typography, Chip } from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import moment from 'moment';
import { vendorStatusOptions } from '@/data/dataSets';
import OptionMenu from '@core/components/option-menu';

/**
 * Vendor table column definitions
 */
export const getVendorColumns = ({ theme = {}, permissions = {}, ledgerPermissions = {} } = {}) => [
  {
    key: 'serial',
    visible: true,
    label: '#',
    align: 'center',
    renderCell: (row, handlers, index) => {
      // Add proper fallbacks and validation
      const currentPage = Number(handlers?.pagination?.current || handlers?.pagination?.page || 1);
      const pageSize = Number(handlers?.pagination?.pageSize || handlers?.pagination?.limit || 10);
      const rowIndex = Number(index >= 0 ? index : 0);

      // Calculate serial number with proper validation
      const serialNumber = (currentPage - 1) * pageSize + rowIndex + 1;

      return (
        <Typography variant="body1" color='text.primary' className='text-[0.9rem] font-medium'>
          {!isNaN(serialNumber) ? serialNumber : rowIndex + 1}
        </Typography>
      );
    },
  },
  {
    key: 'vendor_name',
    visible: true,
    label: 'Name',
    sortable: true,
    renderCell: (row) => (

        <Link href={`/vendors/vendor-view/${row._id}`} passHref>
          <Typography
            className="cursor-pointer text-primary hover:underline font-medium"

          >
            {row.vendor_name || 'N/A'}
          </Typography>
        </Link>

    ),
  },

  {
    key: 'vendor_phone',
    visible: true,
    label: 'Phone',
    sortable: true,
    renderCell: (row) => (
      <Typography variant="body1" color='text.primary' className='text-[0.9rem]'>
        {row.vendor_phone || 'N/A'}
      </Typography>
    ),
  },

   {
    key: 'vendor_email',
    visible: true,
    label: 'Email',
    sortable: true,
    renderCell: (row) => (
      <Typography variant="body1" color='text.primary' className='text-[0.9rem]'>
        {row.vendor_email || 'N/A'}
      </Typography>
    ),
  },
  {
    key: 'balance',
    label: 'Closing Balance',
    visible: true,
    align: 'center',
    sortable: true,
    renderCell: (row) => {
      // Ensure proper number handling and fallback
      const balance = parseFloat(row.balance) || 0;
      const balanceType = row.balanceType || (balance >= 0 ? 'Credit' : 'Debit');
      const displayBalance = Math.abs(balance);

      // Format balance with locale (Indian number format like old frontend)
      let formattedBalance = '0.00';
      try {
        formattedBalance = displayBalance.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
      } catch (e) {
        // Fallback to simple formatting if locale fails
        formattedBalance = displayBalance.toFixed(2);
      }

      return (
        <div className="flex items-center justify-center gap-1">
          <Icon
            icon="lucide:saudi-riyal"
            width="1rem"
            // color={balanceType === 'Credit' ? (theme?.palette?.success?.main) : (theme?.palette?.warning?.main)}
            color={theme.palette.secondary.light}
          />
          <Typography
            color={balanceType === 'Credit' ? 'success.main' : 'error.main'}
            className='text-[0.9rem] font-medium'
          >
            {balance < 0 ? '-' : ''}{formattedBalance}
          </Typography>
          {balance > 0 && (
            <Typography
              color="text.secondary"
              className='text-[0.8rem] ml-1'
            >
              ({balanceType})
            </Typography>
          )}
        </div>
      );
    },
  },
  {
    key: 'created_at',
    label: 'Created On',
    visible: true,
    align: 'center',
    sortable: true,
    renderCell: (row) => {
      // Ensure proper date parsing and validation
      const createdDate = row.created_at;
      let formattedDate = 'N/A';

      if (createdDate) {
        const momentDate = moment(createdDate, 'DD-MM-YYYY', true); // strict parsing for DD-MM-YYYY
        if (momentDate.isValid()) {
          formattedDate = momentDate.format('DD MMM YYYY');
        }
      }

      return (
        <Typography variant="body1" color='text.primary' className='text-[0.9rem] whitespace-nowrap'>
          {formattedDate}
        </Typography>
      );
    },
  },
  {
    key: 'status',
    label: 'Status',
    visible: true,
    align: 'center',
    sortable: true,
    renderCell: (row) => {
      const statusOption = vendorStatusOptions.find(opt => opt.value === row.status);
      return (
        <Chip
          className='mx-0'
          size='small'
          variant='tonal'
          label={statusOption?.label || 'Unknown'}
          color={statusOption?.color || 'default'}
        />
      );
    },
  },
  {
    key: 'action',
    label: '',
    visible: true,
    align: 'right',
    renderCell: (row, handlers) => {
      const options = [];
      const { permissions, ledgerPermissions } = handlers;

      if (permissions?.canView) {
        options.push({
          text: 'View',
          icon: <Icon icon="mdi:eye-outline" />,
          href: `/vendors/vendor-view/${row._id}`,
          linkProps: {
            className: 'flex items-center is-full plb-2 pli-4 gap-2 text-textSecondary'
          }
        });
      }

      if (permissions?.canUpdate) {
        options.push({
          text: 'Edit',
          icon: <Icon icon="mdi:edit-outline" />,
          href: `/vendors/edit/${row._id}`,
          linkProps: {
            className: 'flex items-center is-full plb-2 pli-4 gap-2 text-textSecondary'
          }
        });
      }

      if (ledgerPermissions?.canCreate) {
        options.push({
          text: 'Ledger',
          icon: <Icon icon="mdi:book-outline" />,
          href: `/vendors/vendor-view/${row._id}?tab=ledger`,
          linkProps: {
            className: 'flex items-center is-full plb-2 pli-4 gap-2 text-textSecondary'
          }
        });
      }

      if (permissions?.canDelete) {
        options.push({
          text: 'Delete',
          icon: <Icon icon="mdi:delete-outline" />,
          menuItemProps: {
            className: 'flex items-center gap-2 text-error',
            onClick: () => handlers.handleDelete(row._id)
          }
        });
      }


      return (
        <OptionMenu
          icon={<MoreVertIcon />}
          iconButtonProps={{ size: 'small', 'aria-label': 'more actions' }}
          options={options}
        />
      );
    },
  },
];