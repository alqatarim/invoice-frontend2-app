import React from 'react';
import EditUnitComponent from '@/views/units/editUnit/EditUnit';

const EditUnitPage = async ({ params }) => {
  return (
    <EditUnitComponent id={params.id} />
  );
};

export default EditUnitPage;