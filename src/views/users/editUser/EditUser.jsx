'use client';

import React from 'react';
import User from '@/views/users/user';

const EditUser = ({ controller }) => (
  <User
    controller={controller}
    title="Edit Team Member"
    submitLabel="Update User"
  />
);

export default EditUser;
