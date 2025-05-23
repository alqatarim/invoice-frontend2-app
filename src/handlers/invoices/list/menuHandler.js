import { useState } from 'react';

export default function menuHandler() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  const handleMenuOpen = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  return {
    anchorEl,
    selectedRow,
    handleMenuOpen,
    handleMenuClose,
  };
}