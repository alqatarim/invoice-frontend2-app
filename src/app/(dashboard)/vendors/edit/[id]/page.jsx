// app/(dashboard)/vendors/edit/[id]/page.jsx

import { notFound } from 'next/navigation';
import EditVendorIndex from '@/views/vendors/editVendor/index';
import { getVendorById } from '@/app/(dashboard)/vendors/actions';
import ProtectedComponent from '@/components/ProtectedComponent';

export const metadata = {
  title: 'Edit Vendor | Kanakku',
};

const EditVendorPage = async ({ params }) => {
  const { id } = params;

  try {
    const vendorData = await getVendorById(id);

    if (!vendorData) {
      notFound();
    }

    return (
      <ProtectedComponent>
        <EditVendorIndex
          id={id}
          vendorData={vendorData}
        />
      </ProtectedComponent>
    );
  } catch (error) {
    console.error('Error loading vendor data:', error);
    notFound();
  }
};

export default EditVendorPage;