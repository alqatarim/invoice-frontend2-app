import React from 'react';
import AddProductIndex from '@/views/products/addProduct/index';
import ProtectedComponent from '@/components/ProtectedComponent';
import { getDropdownData } from '@/app/(dashboard)/products/actions';

const AddProductPage = async () => {
  try {
    const dropdownData = await getDropdownData();

    return (
      <ProtectedComponent>
        <AddProductIndex
          initialData={dropdownData.data}
        />
      </ProtectedComponent>
    );
  } catch (error) {
    console.error('Error loading product data:', error);
    return <div>Error loading form data</div>;
  }
};

export default AddProductPage;