// app/(dashboard)/vendors/edit/[id]/page.jsx

import { notFound } from 'next/navigation';
import EditVendorIndex from '@/views/vendors/editVendor/index';
import { getVendorById } from '@/app/(dashboard)/vendors/actions';

export const metadata = {
  title: 'Edit Vendor | Kanakku',
};

const EditVendorPage = async ({ params }) => {
  const { id } = params;
  let initialVendorData = null;
  let initialErrorMessage = '';

  try {
    const vendorData = await getVendorById(id);

    if (!vendorData) {
      notFound();
    }

    initialVendorData = vendorData;
  } catch (error) {
    console.error('Error loading vendor data:', error);
    initialErrorMessage = error?.message || 'Failed to load vendor data.';
  }

  return (
    <EditVendorIndex
      id={id}
      initialVendorData={initialVendorData}
      initialErrorMessage={initialErrorMessage}
    />
  );
};

export default EditVendorPage;