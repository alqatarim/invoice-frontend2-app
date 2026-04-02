import { notFound } from 'next/navigation';
import EditUnitIndex from '@/views/units/editUnit/index';
import { getUnitById, getUnitDropdownData } from '@/app/(dashboard)/units/actions';

export const metadata = {
  title: 'Edit Unit | Kanakku',
};

const EditUnitPage = async ({ params }) => {
  const { id } = params;
  let initialUnitData = null;
  let initialDropdownOptions = { units: [] };
  let initialErrorMessage = '';

  try {
    const [unitData, dropdownResponse] = await Promise.all([
      getUnitById(id),
      getUnitDropdownData(),
    ]);

    if (!unitData) {
      notFound();
    }

    initialUnitData = unitData;
    initialDropdownOptions = dropdownResponse?.data || initialDropdownOptions;
  } catch (error) {
    console.error('Error loading unit data:', error);
    initialErrorMessage = error?.message || 'Failed to load unit data.';
  }

  return (
    <EditUnitIndex
      id={id}
      initialUnitData={initialUnitData}
      initialDropdownOptions={initialDropdownOptions}
      initialErrorMessage={initialErrorMessage}
    />
  );
};

export default EditUnitPage;
