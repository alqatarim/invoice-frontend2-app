'use client';

import React, { useState, useEffect } from "react";
import { List, ListItem, Checkbox, ListItemIcon, ListItemText, Divider, Button, Tabs, Tab, Grid, Box, CardContent, Table, TableHead, TableRow, TableCell, TableBody, TableSortLabel, TablePagination, Typography, IconButton, Card, Drawer, Menu, MenuItem, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import Link from 'next/link';
import { usePermission } from '@/hooks/usePermission';
import { MoreVert as MoreVertIcon, FilterList as FilterListIcon, ViewColumn as ViewColumnIcon, Clear as ClearIcon, Close as CloseIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { getCategoryList, deleteCategory } from '@/app/(dashboard)/products/actions';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CategoryFilter from '@/views/products/listCategory/CategoryFilter';

const ListCategory = ({
  page = 1,
  setPage,
  size = 10,
  setSize,
  initialSortBy = 'name',
  initialSortDirection = 'asc',
  initialCategoryList = [],
  initialTotalCount = 0,
  setTotalCount,
  setCategoryList
}) => {
  const canUpdate = usePermission('category', 'update');
  const canDelete = usePermission('category', 'delete');
  const isAdmin = usePermission('category', 'isAdmin');

  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortDirection, setSortDirection] = useState(initialSortDirection);
  const [tab, setTab] = useState('CATEGORY');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isColumnsDrawerOpen, setIsColumnsDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, categoryId: null });
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Define columns
  const [columns, setColumns] = useState([
    { key: "id", label: "#", visible: true },
    { key: "name", label: "Category Name", visible: true },
    { key: "slug", label: "Slug", visible: true },
    { key: "action", label: "Action", visible: true },
  ]);

  const [tempColumns, setTempColumns] = useState(columns);

  const fetchCategoryList = async (currentPage, currentSize) => {
    const response = await getCategoryList(currentPage, currentSize);
    if (response.success) {
      setCategoryList(response.data || []);
      setTotalCount(response.data.length);
    }
  };

  // Handlers
  const handlePageChange = async (event, newPage) => {
    setPage(newPage + 1);
    await fetchCategoryList(newPage + 1, size);
  };

  const handlePageSizeChange = async (event) => {
    const newSize = parseInt(event.target.value, 10);
    setSize(newSize);
    setPage(1);
    await fetchCategoryList(1, newSize);
  };

  const handleDeleteClick = (id) => {
    setConfirmDialog({ open: true, categoryId: id });
  };

  const handleConfirmDelete = async () => {
    const id = confirmDialog.categoryId;
    setConfirmDialog({ ...confirmDialog, open: false });
    try {
      const response = await deleteCategory(id);
      if (response.success) {
        await fetchCategoryList(1, size);
        setPage(1);
        toast.success("Category deleted successfully");
      } else {
        throw new Error(response.message || "Failed to delete category");
      }
    } catch (err) {
      console.error("Error deleting category:", err);
      toast.error(err.message || "Error deleting category");
    }
  };

  // Column management handlers
  const toggleColumnVisibility = (index) => {
    const newColumns = tempColumns.map((column, idx) => {
      if (idx === index) {
        return { ...column, visible: !column.visible };
      }
      return column;
    });
    setTempColumns(newColumns);
  };

  const handleApplyColumns = () => {
    setColumns(tempColumns);
    setIsColumnsDrawerOpen(false);
  };

  const handleCancelColumns = () => {
    setTempColumns(columns);
    setIsColumnsDrawerOpen(false);
  };

  const handleReset = async () => {
    setPage(1);
    setSize(10);
    setSortBy(initialSortBy);
    setSortDirection(initialSortDirection);
    await fetchCategoryList(1, 10);
  };

  return (
    <Box className="flex flex-col gap-2">
      <ToastContainer />

      {/* Header */}
      <Box display="flex">
        <Typography className="mb-2" variant="h4" color="secondary">Categories</Typography>
      </Box>

      {/* Add Category Button */}
      <Box display="flex" justifyContent="end">
        <Button
          size="medium"
          component={Link}
          href="/products/category-add"
          variant="contained"
          color="primary"
        >
          Add Category
        </Button>
      </Box>

      {/* Tabs and Filters */}
      <Box display="flex" gap={2}>
        <Grid container spacing={2} sx={{ justifyContent: "space-between", alignItems: "center" }}>
          <Grid item xs="auto">
            <Tabs
              value={tab}
              onChange={(e, value) => setTab(value)}
              aria-label="Category Tabs"
            >
              <Tab label="Products" value="PRODUCT" component={Link} href="/products/product-list" />
              <Tab label="Categories" value="CATEGORY" />
              <Tab label="Units" value="UNITS" component={Link} href="/products/unit-list" />
            </Tabs>
          </Grid>

          <Grid item xs="auto">
            <Button
              variant="text"
              startIcon={<ClearIcon />}
              onClick={handleReset}
            >
              Reset
            </Button>
            <Button
              variant="text"
              startIcon={<FilterListIcon />}
              onClick={() => setIsFilterDrawerOpen(true)}
            >
              Filter
            </Button>
            <Button
              variant="text"
              startIcon={<ViewColumnIcon />}
              onClick={() => setIsColumnsDrawerOpen(true)}
            >
              Columns
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Main Content */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHead>
              <TableRow>
                {columns.map((column) =>
                  column.visible && (
                    <TableCell key={column.key}>
                      {column.key !== 'action' && column.key !== 'id' ? (
                        <TableSortLabel
                          active={sortBy === column.key}
                          direction={sortBy === column.key ? sortDirection : 'asc'}
                          onClick={() => handleSortRequest(column.key)}
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
            </TableHead>
            <TableBody>
              {initialCategoryList.map((category, index) => (
                <TableRow key={category._id}>
                  {columns.map(
                    (column) =>
                      column.visible && (
                        <TableCell key={column.key}>
                          {column.key === 'id' && index + 1}
                          {column.key === 'name' && category.name}
                          {column.key === 'slug' && category.slug}
                          {column.key === 'action' && (
                            <IconButton onClick={(event) => {
                              setAnchorEl(event.currentTarget);
                              setSelectedCategory(category);
                            }}>
                              <MoreVertIcon />
                            </IconButton>
                          )}
                        </TableCell>
                      )
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <TablePagination
            component="div"
            count={initialTotalCount}
            page={page - 1}
            onPageChange={handlePageChange}
            rowsPerPage={size}
            onRowsPerPageChange={handlePageSizeChange}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </CardContent>
      </Card>

      {/* Column Management Drawer */}
      <Drawer
        anchor="right"
        open={isColumnsDrawerOpen}
        onClose={() => setIsColumnsDrawerOpen(false)}
      >
        <Box className='flex flex-col w-[250px] gap-2 p-3'>
          <Typography textAlign="center" variant="h5">Manage Columns</Typography>
          <Divider />
          <List>
            {tempColumns.map((column, index) => (
              <ListItem key={index} button onClick={() => toggleColumnVisibility(index)}>
                <ListItemIcon>
                  <Checkbox checked={column.visible} />
                </ListItemIcon>
                <ListItemText primary={column.label} />
              </ListItem>
            ))}
          </List>
          <Box display="flex" justifyContent="space-evenly">
            <Button variant="outlined" onClick={handleApplyColumns}>Apply</Button>
            <Button color="secondary" onClick={handleCancelColumns}>Cancel</Button>
          </Box>
        </Box>
      </Drawer>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {(canUpdate || isAdmin) && (
          <MenuItem
            component={Link}
            href={`/products/category-edit/${selectedCategory?._id}`}
            onClick={() => setAnchorEl(null)}
          >
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Edit" />
          </MenuItem>
        )}
        {(canDelete || isAdmin) && (
          <MenuItem
            onClick={() => {
              handleDeleteClick(selectedCategory?._id);
              setAnchorEl(null);
            }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Delete" />
          </MenuItem>
        )}
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this category?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}>
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="primary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Drawer
        anchor="right"
        open={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
      >
        <CategoryFilter
          onClose={() => setIsFilterDrawerOpen(false)}
          setCategoryList={setCategoryList}
          setTotalCount={setTotalCount}
          setPage={setPage}
          page={page}
          pageSize={size}
        />
      </Drawer>
    </Box>
  );
};

export default ListCategory;
