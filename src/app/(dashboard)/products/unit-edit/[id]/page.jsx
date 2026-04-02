import React from 'react';
import EditUnitComponent from '@/views/units/editUnit/index';
import { getUnitById, getUnitDropdownData } from '@/app/(dashboard)/units/actions';

const EditUnitPage = async ({ params }) => {
  let initialUnitData = null;
  let initialDropdownOptions = { units: [] };
  let initialErrorMessage = '';

  try {
    const [unitData, dropdownResponse] = await Promise.all([
      getUnitById(params.id),
      getUnitDropdownData(),
    ]);

    initialUnitData = unitData;
    initialDropdownOptions = dropdownResponse?.data || initialDropdownOptions;
  } catch (error) {
    console.error('Error loading product-segment unit edit data:', error);
    initialErrorMessage = error?.message || 'Failed to load unit data.';
  }

  return (
    <EditUnitComponent
      id={params.id}
      initialUnitData={initialUnitData}
      initialDropdownOptions={initialDropdownOptions}
      initialErrorMessage={initialErrorMessage}
    />
  );
};

export default EditUnitPage;