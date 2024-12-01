// app/invoices/page.jsx

import React from 'react';
import UnitListComponent from '@/views/products/listUnit/index';
import ProtectedComponent from '@/components/ProtectedComponent';

const UnitsPage = async () => {
  return (
    <ProtectedComponent>
      <UnitListComponent />
    </ProtectedComponent>
  );
};

export default UnitsPage
