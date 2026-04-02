import React from 'react';
import AddVendorIndex from '@/views/vendors/addVendor/index';

export const metadata = {
  title: 'Add Vendor | Kanakku',
};

const AddVendorPage = async () => {
  try {
    return (
      <AddVendorIndex />
    );
  } catch (error) {
    console.error('Error loading add vendor data:', error);
    return <AddVendorIndex initialErrorMessage={error?.message || 'Failed to load data for Add Vendor.'} />;
  }
};

export default AddVendorPage;