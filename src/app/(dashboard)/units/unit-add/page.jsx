import React from 'react';
import AddUnitIndex from '@/views/units/addUnit/index';
import { getUnitDropdownData } from '@/app/(dashboard)/units/actions';

export const metadata = {
  title: 'Add Unit | Kanakku',
};

const AddUnitPage = async () => {
  let initialDropdownOptions = { units: [] };
  let initialErrorMessage = '';

  try {
    const response = await getUnitDropdownData();
    initialDropdownOptions = response?.data || initialDropdownOptions;
  } catch (error) {
    console.error('Error loading add unit data:', error);
    initialErrorMessage = error?.message || 'Failed to load data for Add Unit.';
  }

  return (
    <AddUnitIndex
      initialDropdownOptions={initialDropdownOptions}
      initialErrorMessage={initialErrorMessage}
    />
  );
};

export default AddUnitPage;
