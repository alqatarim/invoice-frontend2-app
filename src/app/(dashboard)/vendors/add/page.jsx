import React from 'react';
import AddVendorIndex from '@/views/vendors/addVendor/index';
import ProtectedComponent from '@/components/ProtectedComponent';

export const metadata = {
  title: 'Add Vendor | Kanakku',
};

const AddVendorPage = async () => {
  try {
    return (
      <ProtectedComponent>
        <AddVendorIndex />
      </ProtectedComponent>
    );
  } catch (error) {
    console.error('Error loading add vendor data:', error);
    return <div className="text-red-600 p-8">Failed to load data for Add Vendor.</div>;
  }
};

export default AddVendorPage;