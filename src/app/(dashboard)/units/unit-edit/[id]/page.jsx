import { notFound } from 'next/navigation';
import EditUnitIndex from '@/views/units/editUnit/index';
import { getUnitById } from '@/app/(dashboard)/units/actions';
import ProtectedComponent from '@/components/ProtectedComponent';

export const metadata = {
  title: 'Edit Unit | Kanakku',
};

const EditUnitPage = async ({ params }) => {
  const { id } = params;

  try {
    const unitData = await getUnitById(id);

    if (!unitData) {
      notFound();
    }

    return (
      <ProtectedComponent>
        <EditUnitIndex
          id={id}
          unitData={unitData}
        />
      </ProtectedComponent>
    );
  } catch (error) {
    console.error('Error loading unit data:', error);
    notFound();
  }
};

export default EditUnitPage;
