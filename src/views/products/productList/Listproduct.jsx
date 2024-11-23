'use client'

import React, { useState, useEffect } from "react";
import { List, ListItem, Checkbox, ListItemIcon, ListItemText, Divider, Button, Tabs, Tab, Grid, Box, CardContent, Table, TableHead, TableRow, TableCell, TableBody, TableSortLabel, TablePagination, Typography, IconButton, Card, Drawer, Menu, MenuItem, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar, Alert } from "@mui/material";
import Link from 'next/link';
import { usePermission } from '@/hooks/usePermission';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import moment from "moment"; // Import moment for date formatting
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import ProductFilter from './ProductFilter'; // Import the new ProductFilter component
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image'; // Add this import

import { getProductList, deleteProduct } from '@/app/(dashboard)/products/actions';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const Listproduct = ({ initialProductListData = [], initialPage = 1, initialSize = 10, initialSortBy = 'name', initialSortDirection = 'asc' }) => {
  const canUpdate = usePermission('product', 'update');
  const canDelete = usePermission('product', 'delete');
  const isAdmin = usePermission('product', 'isAdmin'); // Check if the user is an admin

  // Define the state for productList and totalCount
  const [productList, setProductList] = useState(initialProductListData); // Initialize with initialProductListData
  const [totalCount, setTotalCount] = useState(0); // Initialize totalCount as needed
  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortDirection, setSortDirection] = useState(initialSortDirection);

  const [tab, setTab] = useState('PRODUCT');



  // State to control the drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Function to toggle drawer
  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  // State to control the visibility of the manage columns drawer
  const [isColumnsDrawerOpen, setIsColumnsDrawerOpen] = useState(false);

  // Function to toggle the manage columns drawer
  const handleManageColumnsOpen = () => {
    setIsColumnsDrawerOpen(!isColumnsDrawerOpen);
  };

  const handleSortRequest = (columnKey) => {
    let newDirection = 'asc';
    if (sortBy === columnKey) {
      newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      setSortDirection(newDirection);
    } else {
      setSortBy(columnKey);
      setSortDirection('asc');
    }
  };

  const handlePageChange = async (event, newPage) => {
    setPage(newPage + 1);
    await fetchProductList(newPage + 1, size);
  };

  const handlePageSizeChange = async (event) => {
    const newSize = parseInt(event.target.value, 10);
    setSize(newSize);
    setPage(1);
    await fetchProductList(1, newSize);
  };

  const fetchProductList = async (currentPage, currentSize) => {
    const response = await getProductList(currentPage, currentSize);
     setProductList(response || []); // Ensure productList is always an array
    setTotalCount(response.length || 0); // Ensure totalCount is a number
  };

  const handleDeleteClick = (id) => {
    setConfirmDialog({ open: true, productId: id });
  };

  const handleConfirmDelete = async () => {
    const id = confirmDialog.productId;
    setConfirmDialog({ ...confirmDialog, open: false });
    try {
      const response = await deleteProduct(id);
      if (response.success) {
        await fetchProductList(1, size); // Reset to first page
        setPage(1); // Update page state
        toast.success("Product deleted successfully", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        throw new Error(response.message || "Failed to delete product");
      }
    } catch (err) {
      console.error("Error deleting product:", err);
      toast.error(err.message || "Error deleting product", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialog({ ...confirmDialog, open: false });
  };


  // Define the initial columns and their visibility
  const [columns, setColumns] = useState([
    { key: "id", label: "#", visible: true },
    { key: "image", label: "Image", visible: true }, // Add this line
    { key: "name", label: "Item", visible: true },
    { key: "alertQuantity", label: "Alert Quantity", visible: true },
    { key: "sellingPrice", label: "Sales Price", visible: true },
    { key: "purchasePrice", label: "Purchase Price", visible: true },
    { key: "action", label: "Action", visible: true },
  ]);

  // Function to toggle the visibility of a specific column
  const toggleColumnVisibility = (index) => {
    const newColumns = columns.map((column, idx) => {
      if (idx === index) {
        return { ...column, visible: !column.visible };
      }
      return column;
    });
    setColumns(newColumns);
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleMenuOpen = (event, product) => {
    setAnchorEl(event.currentTarget);
    setSelectedProduct(product);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProduct(null);
  };

  const [confirmDialog, setConfirmDialog] = useState({ open: false, productId: null });


  // useEffect(() => {
  //   fetchProductList(page, size);
  // }, [page, size]);

  return (
    <Box className="flex flex-col gap-2">
      <ToastContainer />
      <Box display="flex">
        <Typography className="mb-2" variant="h4" color="secondary">Products / Services</Typography>
      </Box>

      <Box display="flex" justifyContent="end">
        <Button
          size="medium"
          component={Link}
          href={`/products/add-product/`}
          variant="contained"
          color="primary"
          passHref
        >
          Add Product
        </Button>
      </Box>

      <Box display="flex" gap={2}>
        <Grid container spacing={2} sx={{ justifyContent: "space-between", alignItems: "center" }}>
          <Grid item xs="auto">
            <Tabs
              value={tab}
              onChange={(e, value) => setTab(value)}
              aria-label="Invoice Tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Product" value="PRODUCT" />
              <Tab label="Category" value="CATEGORY" />
              <Tab label="Units" value="UNITS" />
            </Tabs>
          </Grid>

          {/* Button to open the drawer */}
          <Grid item xs="auto">
            <Button onClick={toggleDrawer} startIcon={<FilterListIcon />} variant="text">Filter</Button>
            <Button
              variant="text"
              startIcon={<ViewColumnIcon />}
              onClick={handleManageColumnsOpen}
            >
              Columns
            </Button>
          </Grid>
        </Grid>

        {/* Drawer for Product Filter */}
        <Drawer
          anchor="right"
          open={isDrawerOpen}
          onClose={toggleDrawer}
        >
          <Box sx={{ width: 300, padding: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Filter Products</Typography>
              <IconButton onClick={toggleDrawer}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Divider sx={{ marginY: 2 }} />
            <ProductFilter
             setProductList={setProductList}
              setTotalCount={setTotalCount}
              setPage={setPage}
              page={page}
              pagesize={size}
            />
          </Box>
        </Drawer>

        {/* Drawer for managing column visibility */}
        <Drawer
          anchor="right"
          open={isColumnsDrawerOpen}
          onClose={() => setIsColumnsDrawerOpen(false)}
        >
          <Box sx={{ width: 300, padding: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Manage Columns</Typography>
              <IconButton onClick={() => setIsColumnsDrawerOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Divider sx={{ marginY: 2 }} />
            <List>
              {columns.map((column, index) => (
                <ListItem key={index} button onClick={() => toggleColumnVisibility(index)}>
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={column.visible}
                      tabIndex={-1}
                      disableRipple
                    />
                  </ListItemIcon>
                  <ListItemText primary={column.label} />
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>
      </Box>

      {/* Card */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHead>
              <TableRow>
                {columns.map(
                  (column) =>
                    column.visible && (
                      <TableCell
                        key={column.key}
                        sortDirection={sortBy === column.key ? sortDirection : false}
                      >
                        {column.key !== 'action' ? (
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
              {productList.map((product, index) => (
                <TableRow key={product._id}>
                  {columns.map(
                    (column) =>
                      column.visible && (
                        <TableCell key={column.key}>
                          {column.key === 'id' && index + 1}
                          {column.key === 'image' && (
                            <Box sx={{ width: 50, height: 50, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                              {product.images ? (
                                <img src={product.images} alt={product.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                              ) : (
                                <ImageIcon color="disabled" />
                              )}
                            </Box>
                          )}
                          {column.key === 'name' && (
                            <Typography>{product.name || 'N/A'}</Typography>
                          )}
                          {column.key === 'alertQuantity' && (
                            <Typography>{product.alertQuantity || 'N/A'}</Typography>
                          )}
                          {column.key === 'sellingPrice' && (
                            <Typography>{product.sellingPrice || 'N/A'}</Typography>
                          )}
                          {column.key === 'purchasePrice' && (
                            <Typography>{product.purchasePrice || 'N/A'}</Typography>
                          )}
                          {column.key === 'action' && (
                            <div>
                              <IconButton onClick={(event) => handleMenuOpen(event, product)}>
                                <MoreVertIcon />
                              </IconButton>
                            </div>
                          )}
                        </TableCell>
                      )
                  )}
                </TableRow>
              ))}
              {productList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center">
                    No products found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={totalCount}
            page={page - 1}
            onPageChange={handlePageChange}
            rowsPerPage={size}
            onRowsPerPageChange={handlePageSizeChange}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
          <Menu
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            {(canUpdate || isAdmin) && selectedProduct && (
              <MenuItem
                component={Link}
                href={`/products/product-edit/${selectedProduct._id}`}
                onClick={handleMenuClose}
                sx={{ display: 'flex', alignItems: 'center', width: '100%' }}
              >
                <ListItemIcon>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Edit" />
              </MenuItem>
            )}
            {(canDelete || isAdmin) && selectedProduct && (
              <MenuItem
                onClick={() => {
                  handleDeleteClick(selectedProduct._id);
                  handleMenuClose();
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
        open={confirmDialog.open}
        onClose={handleCloseConfirmDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Delete"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this product?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} color="primary">
            No
          </Button>
          <Button onClick={handleConfirmDelete} color="primary" autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Listproduct;
