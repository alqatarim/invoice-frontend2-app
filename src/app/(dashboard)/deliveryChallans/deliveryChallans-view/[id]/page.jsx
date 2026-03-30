import React from 'react';
import DeliveryChallanView from '@/views/deliveryChallans/viewDeliveryChallans/index';
import { getDeliveryChallanById } from '../../actions';

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
  let initialDeliveryChallanData = null;
  let initialErrorMessage = '';

  try {
    initialDeliveryChallanData = await getDeliveryChallanById(id);
  } catch (error) {
    initialErrorMessage = error?.message || 'Failed to load delivery challan data.';
  }

  return (
    <DeliveryChallanView
      initialDeliveryChallanData={initialDeliveryChallanData}
      initialErrorMessage={initialErrorMessage}
    />
  );
}

export default DeliveryChallanViewPage;