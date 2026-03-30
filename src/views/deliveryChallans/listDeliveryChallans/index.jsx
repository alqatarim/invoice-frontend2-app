'use client';

import React from "react";
import ListDeliveryChallans from "@/views/deliveryChallans/listDeliveryChallans/listDeliveryChallans";

const DeliveryChallanListIndex = ({
     initialDeliveryChallans = [],
     initialPagination,
     initialErrorMessage = '',
}) => {
     return (
          <ListDeliveryChallans
               initialDeliveryChallans={initialDeliveryChallans}
               initialPagination={initialPagination}
               initialErrorMessage={initialErrorMessage}
          />
     );
};

export default DeliveryChallanListIndex;