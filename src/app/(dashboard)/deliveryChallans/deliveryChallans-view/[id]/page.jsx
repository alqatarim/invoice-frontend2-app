import React from 'react';
import DeliveryChallanView from '@/views/deliveryChallans/viewDeliveryChallans/index';
import { getDeliveryChallanById } from '@/app/(dashboard)/deliveryChallans/actions';

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
  const initialDeliveryChallanData = await getDeliveryChallanById(id);

  return (
    <DeliveryChallanView id={id} initialDeliveryChallanData={initialDeliveryChallanData} />
  );
}

export default DeliveryChallanViewPage;