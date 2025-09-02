import React from 'react';
import AddUnitIndex from '@/views/units/addUnit/index';
import ProtectedComponent from '@/components/ProtectedComponent';

export const metadata = {
  title: 'Add Unit | Kanakku',
};

const AddUnitPage = async () => {
  try {
    return (
      <ProtectedComponent>
        <AddUnitIndex />
      </ProtectedComponent>
    );
  } catch (error) {
    console.error('Error loading add unit data:', error);
    return <div className="text-red-600 p-8">Failed to load data for Add Unit.</div>;
  }
};

export default AddUnitPage;
