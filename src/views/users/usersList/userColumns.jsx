import { Icon } from '@iconify/react';
import { Typography, Avatar, Chip, Box } from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import moment from 'moment';
import { orgRoleOptions, userStatusOptions, actionButtons } from '@/data/dataSets';
import OptionMenu from '@core/components/option-menu';
import { CustomChip } from '@/components/chips';

/** Chip colors for platform / auto-provisioned permission names only (not company-custom roles). */
const getPermissionRoleChipColor = (roleName = '') => {
     const normalized = String(roleName).trim().toLowerCase();
     if (normalized === 'super admin') return 'primary';
     if (normalized === 'admin') return 'info';
     return 'default';
};




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
                              data-user-id={row._id}
                              onError={handleImageError}
                              sx={{
                                   width: 36,
                                   height: 36,
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
                              {/* <Typography variant="caption" color="text.secondary">
                                   {row.email || 'N/A'}
                              </Typography> */}
                         </Box>
                    </Box>
               );
          },
     },
     // {
     //      key: 'email',
     //      visible: true,
     //      label: 'Email',
     //      sortable: true,
     //      align: 'left',
     //      renderCell: (row) => (
     //           <Typography variant="body2" color="text.primary">
     //                {row.email || 'N/A'}
     //           </Typography>
     //      ),
     // },
     {
          key: 'phone',
          visible: true,
          label: 'Phone',
          sortable: false,
          align: 'left',
          renderCell: (row) => (
               <Typography variant="body1" color='text.primary' className='text-[0.9rem] whitespace-nowrap'>
                    {row.mobileNumber || ''}
               </Typography>
          ),
     },

     {
          key: 'organizationalRole',
          visible: true,
          label: 'Org Role',
          sortable: true,
          align: 'center',
          renderCell: (row) => {
               const orgRole = row.organizationalRole || row.orgRole || '';
               return (
                    <CustomChip
                         size="small"
                         variant="tonal"
                         corners="corner"
                         skin='lighter'
                         fontSkin='dark'
                         color={orgRoleOptions.find(opt => opt.value === orgRole)?.color || 'default'}
                         label={orgRoleOptions.find(opt => opt.value === orgRole)?.label || ''}
                         icon={<Icon icon={orgRoleOptions.find(opt => opt.value === orgRole)?.icon || ''} />}
                         sx={{
                              textTransform: 'capitalize',
                              fontSize: '0.75rem',
                         }}
                    />
               );
          },
     },
     {
          key: 'permissionRole',
          visible: true,
          label: 'Permission',
          sortable: true,
          align: 'center',
          renderCell: (row) => (
               <CustomChip
                    size="small"
                    variant="outlined"
                    color={getPermissionRoleChipColor(row.role)}
                    corners="corner"
                    label={row.role || 'N/A'}
                    sx={{
                         textTransform: 'capitalize',
                         fontSize: '0.75rem',
                    }}
               />
          ),
     },

     {
          key: 'primaryBranchName',
          visible: true,
          label: 'Primary Store',
          sortable: false,
          align: 'left',
          renderCell: (row) => (
               <Typography variant="body1.5" color="text.primary">
                    {row.primaryBranchName || 'Company-wide'}
               </Typography>
          ),
     },
     // {
     //      key: 'assignedBranches',
     //      visible: true,
     //      label: 'Stores',
     //      sortable: false,
     //      align: 'left',
     //      renderCell: (row) => {
     //           const assignedBranches = Array.isArray(row.assignedBranches) ? row.assignedBranches : [];
     //           const storeNames = assignedBranches.map(branch => branch.name).filter(Boolean);

     //           if (!storeNames.length) {
     //                return (
     //                     <Typography variant="body2" color="text.secondary">
     //                          Company-wide access
     //                     </Typography>
     //                );
     //           }

     //           const previewLabel = storeNames.slice(0, 2).join(', ');
     //           const overflowCount = storeNames.length - 2;

     //           return (
     //                <Box className="flex flex-col gap-1">
     //                     <Typography variant="body2" color="text.primary">
     //                          {previewLabel}
     //                          {overflowCount > 0 ? ` +${overflowCount}` : ''}
     //                     </Typography>
     //                     <Typography variant="caption" color="text.secondary">
     //                          {storeNames.length} assigned store{storeNames.length > 1 ? 's' : ''}
     //                     </Typography>
     //                </Box>
     //           );
     //      },
     // },
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
     // {
     //      key: 'createdAt',
     //      visible: false,
     //      label: 'Created Date',
     //      sortable: true,
     //      align: 'center',
     //      renderCell: (row) => (
     //           <Typography variant="body2" color="text.secondary">
     //                {row.createdAt ? moment(row.createdAt).format('DD MMM YYYY') : 'N/A'}
     //           </Typography>
     //      ),
     // },
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
               if (
                    permissions.canDelete &&
                    row.role !== 'Super Admin' &&
                    (row.organizationalRole || row.orgRole) !== 'OWNER'
               ) {
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
