import React from 'react';
import EditUnitComponent from '@/views/products/editUnit/index';
import ProtectedComponent from '@/components/ProtectedComponent';

const EditUnitPage = async ({ params }) => {
  return (
    <ProtectedComponent>
      <EditUnitComponent id={params.id} />
    </ProtectedComponent>
  );
};

export default EditUnitPage;