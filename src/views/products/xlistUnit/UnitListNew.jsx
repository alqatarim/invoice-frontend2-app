'use client'

import React from "react"
import { 
  Box, Typography, Button, Tabs, Tab, Grid, Card, CardContent,
  Table, TableHead, TableRow, TableCell, TableBody, TableSortLabel, 
  TablePagination, IconButton, Drawer, Menu, MenuItem, Dialog,
  DialogActions, DialogContent, DialogContentText, DialogTitle,
  Divider, List, ListItem, Checkbox, ListItemIcon, ListItemText,
  Skeleton
} from "@mui/material"
import Link from 'next/link'
import { usePermission } from '@/Auth/usePermission'
import { 
  MoreVert as MoreVertIcon, Clear as ClearIcon, FilterList as FilterListIcon,
  ViewColumn as ViewColumnIcon, Close as CloseIcon, Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material'
import UnitFilter from '@/views/products/listUnit/UnitFilter'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useUnitListHandlers } from '@/handlers/products/unit/useUnitListHandlers'
import moment from 'moment'

const TableRowSkeleton = ({ columns }) => (
  <TableRow>
    {columns.filter(col => col.visible).map((column) => (
      <TableCell key={column.key}>
        {column.key === 'action' ? (
          <Box display="flex" gap={1}>
            <Skeleton variant="circular" width={32} height={32} />
          </Box>
        ) : column.key === 'unit' ? (
          <Skeleton variant="text" width={200} />
        ) : (
          <Skeleton variant="text" width={80} />
        )}
      </TableCell>
    ))}
  </TableRow>
)

const TableHeadSkeleton = ({ columns }) => (
  <TableRow>
    <TableCell colSpan={columns.filter(col => col.visible).length}>
      <Skeleton
        variant="rectangular"
        width="100%"
        height={24}
        sx={{
          borderRadius: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.08)'
        }}
      />
    </TableCell>
  </TableRow>
)

const UnitListNew = () => {
  const canUpdate = usePermission('product', 'update')
  const canDelete = usePermission('product', 'delete')
  const isAdmin = usePermission('product', 'isAdmin')

  const handlers = useUnitListHandlers()

  return (
    <Box className="flex flex-col gap-2">
      <ToastContainer />
      
      <Box display="flex">
        <Typography className="mb-2" variant="h4" color="secondary">
          Units
        </Typography>
      </Box>

      <Box display="flex" justifyContent="end">
        <Button
          size="medium"
          component={Link}
          href="/products/unit-add/"
          variant="contained"
          color="primary"
          passHref
        >
          Add Unit
        </Button>
      </Box>

      <Box display="flex" gap={2}>
        <Grid container spacing={2} sx={{ justifyContent: "space-between", alignItems: "center" }}>
          <Grid item xs="auto">
            <Tabs
              value={handlers.tab}
              onChange={handlers.handleTabChange}
              aria-label="Product Tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Products" value="PRODUCT" component={Link} href="/products/product-list" />
              <Tab label="Categories" value="CATEGORY" component={Link} href="/products/category-list" />
              <Tab label="Units" value="UNITS" />
            </Tabs>
          </Grid>

          <Grid item xs="auto">
            <Button
              variant="text"
              startIcon={<ClearIcon />}
              onClick={handlers.handleReset}
            >
              Reset
            </Button>
            <Button onClick={handlers.toggleDrawer} startIcon={<FilterListIcon />} variant="text">
              Filter
            </Button>
            <Button
              variant="text"
              startIcon={<ViewColumnIcon />}
              onClick={handlers.handleManageColumnsOpen}
            >
              Columns
            </Button>
          </Grid>
        </Grid>

        {/* Filter Drawer */}
        <Drawer
          anchor="right"
          open={handlers.isDrawerOpen}
          onClose={handlers.handleDrawerClose}
        >
          <Box sx={{ width: 300, padding: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Filter Units</Typography>
              <IconButton onClick={handlers.toggleDrawer}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Divider sx={{ marginY: 2 }} />
            <UnitFilter
              setUnitList={handlers.setUnitList}
              setTotalCount={handlers.setTotalCount}
              setPage={handlers.setPage}
              page={handlers.page}
              pageSize={handlers.size}
              onClose={handlers.handleDrawerClose}
            />
          </Box>
        </Drawer>

        {/* Columns Drawer */}
        <Drawer
          anchor="right"
          open={handlers.isColumnsDrawerOpen}
          onClose={() => handlers.handleManageColumnsOpen()}
        >
          <Box className='flex flex-col w-[250px] gap-2 p-3'>
            <Typography textAlign="center" variant="h5">Manage Columns</Typography>
            <Divider sx={{ marginX: 3, marginY: 1 }} />
            <List className="p-1">
              {handlers.tempColumns.map((column, index) => (
                <ListItem className="p-1" key={index} button onClick={() => handlers.toggleColumnVisibility(index)}>
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={column.visible}
                      tabIndex={-1}
                      disableRipple
                    />
                  </ListItemIcon>
                  <Typography variant="h6">{column.label}</Typography>
                </ListItem>
              ))}
            </List>
            <Box display="flex" width="100%" justifyContent="space-evenly" alignItems="center">
              <Button className="pl-[10%] pr-[10%]" variant="outlined" onClick={handlers.handleApplyColumns}>
                Apply
              </Button>
              <Button className="pl-[10%] pr-[10%]" color="secondary" onClick={handlers.handleCancelColumns}>
                Cancel
              </Button>
            </Box>
          </Box>
        </Drawer>
      </Box>

      {/* Units Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHead>
              {handlers.loading ? (
                <TableHeadSkeleton columns={handlers.columns} />
              ) : (
                <TableRow>
                  {handlers.columns.map(
                    (column) =>
                      column.visible && (
                        <TableCell
                          key={column.key}
                          sortDirection={handlers.sortBy === column.key ? handlers.sortDirection : false}
                        >
                          {column.key !== 'action' && column.key !== 'id' ? (
                            <TableSortLabel
                              active={handlers.sortBy === column.key}
                              direction={handlers.sortBy === column.key ? handlers.sortDirection : 'asc'}
                              onClick={() => handlers.handleSortRequest(column.key)}
                            >
                              {column.label}
                            </TableSortLabel>
                          ) : (
                            column.label
                          )}
                        </TableCell>
                      )
                  )}
                </TableRow>
              )}
            </TableHead>
            <TableBody>
              {handlers.loading ? (
                [...Array(handlers.size || 5)].map((_, index) => (
                  <TableRowSkeleton key={`skeleton-${index}`} columns={handlers.columns} />
                ))
              ) : Array.isArray(handlers.unitList) && handlers.unitList.length > 0 ? (
                handlers.unitList.map((unit, index) => (
                  <TableRow key={unit?._id || index}>
                    {handlers.columns.map(
                      (column) =>
                        column.visible && (
                          <TableCell size="small" key={column.key}>
                            {column.key === 'id' && ((handlers.page - 1) * handlers.size + index + 1)}
                            {column.key === 'unit' && (
                              <Typography>{unit?.unit || 'N/A'}</Typography>
                            )}
                            {column.key === 'createdAt' && (
                              <Typography>
                                {unit?.createdAt ? moment(unit.createdAt).format('MMM DD, YYYY') : 'N/A'}
                              </Typography>
                            )}
                            {column.key === 'action' && (
                              <div>
                                <IconButton
                                  onClick={(event) => handlers.handleMenuOpen(event, unit)}
                                  disabled={!unit}
                                >
                                  <MoreVertIcon />
                                </IconButton>
                              </div>
                            )}
                          </TableCell>
                        )
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={handlers.columns.filter(col => col.visible).length} align="center">
                    <Typography variant="body1" color="textSecondary">
                      No units found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          {handlers.loading ? (
            <Box sx={{ p: 2 }}>
              <Skeleton variant="rectangular" height={52} />
            </Box>
          ) : (
            <TablePagination
              component="div"
              count={handlers.totalCount}
              page={handlers.page - 1}
              onPageChange={handlers.handlePageChange}
              rowsPerPage={handlers.size}
              onRowsPerPageChange={handlers.handlePageSizeChange}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          )}
          
          <Menu
            anchorEl={handlers.anchorEl}
            keepMounted
            open={Boolean(handlers.anchorEl)}
            onClose={handlers.handleMenuClose}
          >
            {(canUpdate || isAdmin) && handlers.selectedUnit?._id && (
              <MenuItem
                component={Link}
                href={`/products/unit-edit/${handlers.selectedUnit._id}`}
                onClick={handlers.handleMenuClose}
                sx={{ display: 'flex', alignItems: 'center', width: '100%' }}
              >
                <ListItemIcon>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Edit" />
              </MenuItem>
            )}
            {(canDelete || isAdmin) && handlers.selectedUnit?._id && (
              <MenuItem
                onClick={() => {
                  handlers.handleDeleteClick(handlers.selectedUnit._id)
                  handlers.handleMenuClose()
                }}
                sx={{ display: 'flex', alignItems: 'center', width: '100%' }}
              >
                <ListItemIcon>
                  <DeleteIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Delete" />
              </MenuItem>
            )}
          </Menu>
        </CardContent>
      </Card>

      <Dialog
        open={handlers.confirmDialog.open}
        onClose={handlers.handleCloseConfirmDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Delete"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this unit?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlers.handleCloseConfirmDialog} color="primary">
            No
          </Button>
          <Button onClick={handlers.handleConfirmDelete} color="primary" autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default UnitListNew