import React from 'react';
import AddUnitComponent from '@/views/units/addUnit/index';
import { getUnitDropdownData } from '@/app/(dashboard)/units/actions';

const AddUnitPage = async () => {
  let initialDropdownOptions = { units: [] };
  let initialErrorMessage = '';

  try {
    const response = await getUnitDropdownData();
    initialDropdownOptions = response?.data || initialDropdownOptions;
  } catch (error) {
    console.error('Error loading product-segment unit add data:', error);
    initialErrorMessage = error?.message || 'Failed to load data for Add Unit.';
  }

  return (
    <AddUnitComponent
      initialDropdownOptions={initialDropdownOptions}
      initialErrorMessage={initialErrorMessage}
    />
  );
};

export default AddUnitPage;