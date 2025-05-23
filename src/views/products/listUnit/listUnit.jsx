'use client';

import React, { useState } from "react";
import {
  Button,Divider,Tabs, Tab, Grid, Box, CardContent, Table, TableHead, TableRow,
  TableCell, TableBody, TableSortLabel, TablePagination, Typography,
  IconButton, Card, Menu, MenuItem, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, Drawer, List, ListItem, ListItemIcon,
  Checkbox, ListItemText
} from "@mui/material";

import FilterListIcon from '@mui/icons-material/FilterList';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';

import Link from 'next/link';
import { usePermission } from '@/Auth/usePermission';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { getUnitList, deleteUnit } from '@/app/(dashboard)/products/actions';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UnitFilter from '@/views/products/listUnit/UnitFilter';

const ListUnit = ({
  page = 1,
  setPage,
  size = 10,
  setSize,
  initialSortBy = 'name',
  initialSortDirection = 'asc',
  initialUnitList = [],
  initialTotalCount = 0,
  setTotalCount,
  setUnitList
}) => {
  const canUpdate = usePermission('unit', 'update');
  const canDelete = usePermission('unit', 'delete');
  const isAdmin = usePermission('unit', 'isAdmin');

  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortDirection, setSortDirection] = useState(initialSortDirection);
  const [tab, setTab] = useState('UNITS');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, unitId: null });
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isColumnsDrawerOpen, setIsColumnsDrawerOpen] = useState(false);
  const [columns, setColumns] = useState([
    { key: "id", label: "#", visible: true },
    { key: "name", label: "Unit Name", visible: true },
    { key: "symbol", label: "Symbol", visible: true },
    { key: "action", label: "Action", visible: true },
  ]);
  const [tempColumns, setTempColumns] = useState(columns);


  const fetchUnitList = async (currentPage, currentSize) => {
    const response = await getUnitList(currentPage, currentSize);
    if (response.success) {
      setUnitList(response.data || []);
      setTotalCount(response.data.length);
    }
  };

  const handlePageChange = async (event, newPage) => {
    setPage(newPage + 1);
    await fetchUnitList(newPage + 1, size);
  };

  const handlePageSizeChange = async (event) => {
    const newSize = parseInt(event.target.value, 10);
    setSize(newSize);
    setPage(1);
    await fetchUnitList(1, newSize);
  };

  const handleDeleteClick = (id) => {
    setConfirmDialog({ open: true, unitId: id });
  };

  const handleConfirmDelete = async () => {
    const id = confirmDialog.unitId;
    setConfirmDialog({ ...confirmDialog, open: false });
    try {
      const response = await deleteUnit(id);
      if (response.success) {
        await fetchUnitList(1, size);
        setPage(1);
        toast.success("Unit deleted successfully");
      } else {
        throw new Error(response.message || "Failed to delete unit");
      }
    } catch (err) {
      console.error("Error deleting unit:", err);
      toast.error(err.message || "Error deleting unit");
    }
  };

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

  return (
    <Box className="flex flex-col gap-2">
      <ToastContainer />

      <Box display="flex">
        <Typography className="mb-2" variant="h4" color="secondary">Units</Typography>
      </Box>

      <Box display="flex" justifyContent="end">
        <Button
          size="medium"
          component={Link}
          href="/products/unit-add"
          variant="contained"
          color="primary"
        >
          Add Unit
        </Button>
      </Box>

      <Box display="flex" gap={2}>
        <Grid container spacing={2} sx={{ justifyContent: "space-between", alignItems: "center" }}>
          <Grid item xs="auto">
            <Tabs
              value={tab}
              onChange={(event, newValue) => setTab(newValue)}
              aria-label="Unit Tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Products" value="PRODUCTS" component={Link} href="/products/product-list" />
              <Tab label="Categories" value="CATEGORIES" component={Link} href="/products/category-list" />
              <Tab label="Units" value="UNITS" />
            </Tabs>
          </Grid>
          <Grid item xs="auto">
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

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell key={column.key}>
                    {column.sortable ? (
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
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {initialUnitList.map((unit, index) => (
                <TableRow key={unit._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{unit.name}</TableCell>
                  <TableCell>{unit.symbol}</TableCell>
                  <TableCell>
                    <IconButton onClick={(event) => {
                      setAnchorEl(event.currentTarget);
                      setSelectedUnit(unit);
                    }}>
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
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

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {(canUpdate || isAdmin) && (
          <MenuItem
            component={Link}
            href={`/products/unit-edit/${selectedUnit?._id}`}
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
              handleDeleteClick(selectedUnit?._id);
              setAnchorEl(null);
            }}
          >
            <DeleteIcon fontSize="small" style={{ marginRight: '8px' }} />
            Delete
          </MenuItem>
        )}
      </Menu>

      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this unit?
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
        <UnitFilter
          onClose={() => setIsFilterDrawerOpen(false)}
          setUnitList={setUnitList}
          setTotalCount={setTotalCount}
          setPage={setPage}
          page={page}
          pageSize={size}
        />
      </Drawer>

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
    </Box>
  );
};

export default ListUnit;
