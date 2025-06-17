import React from 'react';
import DeliveryChallanView from '@/views/deliveryChallans/viewDeliveryChallans/index';
import ProtectedComponent from '@/components/ProtectedComponent';

/**
 * DeliveryChallanViewPage Component
 * Server-side component to fetch delivery challan data and render the ViewDeliveryChallan client component.
 *
 * @param {Object} params - Dynamic route parameters.
 * @param {string} params.id - Delivery challan ID from the URL.
 * @returns JSX.Element
 */
const DeliveryChallanViewPage = async ({ params }) => {
  const { id } = params;

  return (
    <ProtectedComponent>
      <DeliveryChallanView id={params.id} />
    </ProtectedComponent>
  );
}

export default DeliveryChallanViewPage;