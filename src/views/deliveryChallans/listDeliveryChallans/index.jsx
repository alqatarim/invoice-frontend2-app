'use client';

import React from "react";
import ListDeliveryChallans from "@/views/deliveryChallans/listDeliveryChallans/listDeliveryChallans";

const DeliveryChallanListIndex = ({ initialData, customers }) => {
     return (
          <ListDeliveryChallans
               initialData={initialData}
               customers={customers}
          />
     );
};

export default DeliveryChallanListIndex;