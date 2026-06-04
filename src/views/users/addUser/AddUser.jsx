'use client';

import React from 'react';
import User from '@/views/users/user';

const AddUser = ({ controller }) => (
  <User
    controller={controller}
    title="Add Team Member"
    submitLabel="Create User"
  />
);

export default AddUser;
