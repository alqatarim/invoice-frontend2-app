import { Icon } from '@iconify/react';
import { Typography, Avatar, Chip, Box } from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import moment from 'moment';
import { userStatusOptions, actionButtons } from '@/data/dataSets';
import OptionMenu from '@core/components/option-menu';

/**
 * User table column definitions
 */
export const getUserColumns = ({ theme, permissions, handleEdit, handleDelete, handleView, handleImageError }) => [
     {
          key: 'name',
          visible: true,
          label: 'User Name',
          sortable: true,
          align: 'left',
          renderCell: (row) => {
               // Use fullname if available, otherwise construct from firstName and lastName
               const displayName = row.fullname || `${row.firstName || ''} ${row.lastName || ''}`.trim() || row.userName || 'N/A';
               return (
                    <Box className="flex items-center gap-3">
                         <Avatar
                              src={row.image}
                              alt={displayName}
                              onError={handleImageError}
                              sx={{
                                   width: 40,
                                   height: 40,
                                   backgroundColor: theme.palette.primary.main,
                                   color: theme.palette.primary.contrastText,
                              }}
                         >
                              {displayName.charAt(0).toUpperCase()}
                         </Avatar>
                         <Box className="flex flex-col">
                              <Typography
                                   onClick={() => handleView(row._id)}
                                   className="text-primary hover:underline font-medium cursor-pointer"
                                   sx={{ '&:hover': { textDecoration: 'underline' } }}
                              >
                                   {displayName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                   {row.email || 'N/A'}
                              </Typography>
                         </Box>
                    </Box>
               );
          },
     },
     {
          key: 'email',
          visible: true,
          label: 'Email',
          sortable: true,
          align: 'left',
          renderCell: (row) => (
               <Typography variant="body2" color="text.primary">
                    {row.email || 'N/A'}
               </Typography>
          ),
     },
     {
          key: 'phone',
          visible: true,
          label: 'Phone',
          sortable: false,
          align: 'left',
          renderCell: (row) => (
               <Typography variant="body2" color="text.secondary">
                    {row.mobileNumber || 'N/A'}
               </Typography>
          ),
     },
     {
          key: 'role',
          visible: true,
          label: 'Role',
          sortable: true,
          align: 'center',
          renderCell: (row) => (
               <Chip
                    size="small"
                    variant="tonal"
                    color="primary"
                    label={row.role || 'N/A'}
                    sx={{
                         textTransform: 'capitalize',
                         fontSize: '0.75rem',
                    }}
               />
          ),
     },
     {
          key: 'status',
          visible: true,
          label: 'Status',
          sortable: true,
          align: 'center',
          renderCell: (row) => {
               const statusOption = userStatusOptions.find(opt => opt.value === row.status);
               return (
                    <Chip
                         size="small"
                         variant="tonal"
                         label={statusOption?.label || row.status || 'N/A'}
                         color={statusOption?.color || 'default'}
                         sx={{
                              fontSize: '0.75rem',
                         }}
                    />
               );
          },
     },
     {
          key: 'createdAt',
          visible: false,
          label: 'Created Date',
          sortable: true,
          align: 'center',
          renderCell: (row) => (
               <Typography variant="body2" color="text.secondary">
                    {row.createdAt ? moment(row.createdAt).format('DD MMM YYYY') : 'N/A'}
               </Typography>
          ),
     },
     {
          key: 'actions',
          visible: true,
          label: '',
          sortable: false,
          align: 'right',
          renderCell: (row, handlers) => {
               const menuOptions = [];

               // Add view action
               if (permissions.canView) {
                    menuOptions.push({
                         text: 'View',
                         icon: <Icon icon={actionButtons.find(action => action.id === 'view').icon} />,
                         menuItemProps: {
                              className: 'flex items-center gap-2 text-textSecondary',
                              onClick: () => handleView(row._id),
                         }
                    });
               }

               // Add edit action
               if (permissions.canUpdate) {
                    menuOptions.push({
                         text: 'Edit',
                         icon: <Icon icon={actionButtons.find(action => action.id === 'edit').icon} />,
                         menuItemProps: {
                              className: 'flex items-center gap-2 text-textSecondary',
                              onClick: () => handleEdit(row),
                         }
                    });
               }

               // Add delete action (not for Super Admin)
               if (permissions.canDelete && row.role !== 'Super Admin') {
                    menuOptions.push({
                         text: 'Delete',
                         icon: <Icon icon={actionButtons.find(action => action.id === 'delete').icon} />,
                         menuItemProps: {
                              className: 'flex items-center gap-2 text-textSecondary',
                              onClick: () => handleDelete(row),
                         }
                    });
               }

               if (menuOptions.length === 0) return null;

               return (
                    <Box className='flex items-center justify-end'>
                         <OptionMenu
                              icon={<MoreVertIcon />}
                              iconButtonProps={{ size: 'small', 'aria-label': 'user actions' }}
                              options={menuOptions}
                         />
                    </Box>
               );
          },
     },
];
