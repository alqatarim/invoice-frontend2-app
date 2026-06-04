'use client';

import React from 'react';
import User from '@/views/users/user';

const ViewUser = ({ controller }) => (
  <User
    controller={controller}
    title="Team Member Details"
    closeLabel="Close"
  />
);

export default ViewUser;
