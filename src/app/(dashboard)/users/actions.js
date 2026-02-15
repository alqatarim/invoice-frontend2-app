'use server';

import { fetchWithAuth } from '@/Auth/fetchWithAuth';
import { processSignatureImage } from '@/utils/fileUtils';

const ENDPOINTS = {
     USER: {
          LIST: "/manage_users/listUsers",
          VIEW: "/manage_users/viewUser",
          ADD: "/manage_users/create",
          UPDATE: "/manage_users",
          DELETE: "/manage_users",
          DROPDOWN: "/drop_down/role",

     },
};

/**
 * Get user details by ID.
 *
 * @param {string} id - User ID.
 * @returns {Promise<Object>} - User data.
 * @throws {Error} - Throws error with detailed message.
 */
export async function getUserById(id) {
     if (!id || typeof id !== 'string') {
          throw new Error('Invalid user ID');
     }

     try {
          // Add cache: 'no-store' option to disable caching and always fetch fresh data
          const response = await fetchWithAuth(`${ENDPOINTS.USER.VIEW}/${id}`, {
               cache: 'no-store',
               next: { revalidate: 0 } // This ensures data is not cached
          });

          // Assuming a successful response contains a 'data' property
          return response.data?.user_details || {};
     } catch (error) {
          console.error('Error in getUserById:', error);
          throw error; // Propagate the error to be handled by the caller
     }
}

/**
 * Get initial users data with default pagination and sorting.
 *
 * @returns {Promise<Object>} - The initial users data including users and pagination.
 * @throws {Error} - Throws an error with a detailed message if the operation fails.
 */
export async function getInitialUsersData() {
     try {
          const response = await fetchWithAuth(`${ENDPOINTS.USER.LIST}?page=1&pageSize=10&sortBy=&sortDirection=asc`);

          if (response.code === 200) {
               return {
                   users: response.data || [],
                   data: response.data || [],
                    pagination: {
                         current: 1,
                         pageSize: 10,
                         total: response.totalRecords || 0,
                    },
               };
          } else {
               console.error('Failed to fetch initial users data');
               throw new Error('Failed to fetch initial users data');
          }
     } catch (error) {
          console.error('Error in getInitialUsersData:', error.message);
          throw new Error(error.message || 'Failed to fetch initial users data');
     }
}

/**
 * Get filtered users based on provided filters.
 *
 * @param {number} page - Current page number.
 * @param {number} pageSize - Number of items per page.
 * @param {Object} filters - Filter criteria.
 * @param {string} sortBy - Field to sort by.
 * @param {string} sortDirection - Sort direction ('asc' or 'desc').
 * @returns {Promise<Object>} - Filtered users data with pagination.
 * @throws {Error} - Throws an error if the operation fails.
 */
export async function getFilteredUsers(page, pageSize, filters = {}, sortBy = '', sortDirection = 'asc') {
     try {
          let url = `${ENDPOINTS.USER.LIST}?page=${page}&pageSize=${pageSize}`;

          // Apply filters
          if (filters.status && Array.isArray(filters.status) && filters.status.length > 0) {
               url += `&status=${filters.status.join(',')}`;
          }
          if (filters.role && Array.isArray(filters.role) && filters.role.length > 0) {
               url += `&role=${filters.role.join(',')}`;
          }
          if (filters.search) {
               url += `&search=${encodeURIComponent(filters.search)}`;
          }

          // Apply sorting
          if (sortBy) {
               url += `&sortBy=${encodeURIComponent(sortBy)}&sortDirection=${encodeURIComponent(sortDirection)}`;
          }

          const response = await fetchWithAuth(url);

          if (response.code === 200) {
               return {
                    users: response.data || [],
                    pagination: {
                         current: page,
                         pageSize,
                         total: response.totalRecords || 0,
                    },
               };
          } else {
               console.error('Failed to fetch filtered users:', response.message);
               throw new Error(response.message || 'Failed to fetch filtered users');
          }
     } catch (error) {
          console.error('Error in getFilteredUsers:', error);
          throw new Error(error.message || 'Failed to fetch filtered users');
     }
}

/**
 * Add a new user.
 *
 * @param {Object} userData - The user data.
 * @param {string} userData.firstName - The first name.
 * @param {string} userData.lastName - The last name.
 * @param {string} userData.userName - The username.
 * @param {string} userData.email - The email address.
 * @param {string} [userData.mobileNumber] - The mobile number.
 * @param {string} userData.role - The role.
 * @param {string} userData.password - The password.
 * @param {string} userData.status - The status.
 * @param {File} [userData.image] - The profile image file.
 * @returns {Promise<Object>} - The response from the backend.
 * @throws {Error} - Throws an error with a detailed message if the operation fails.
 */
export async function addUser(userData) {
     const { firstName, lastName, userName, email, mobileNumber, role, password, status, image } = userData;

     if (!firstName || typeof firstName !== 'string') {
          throw new Error('Invalid first name');
     }

     if (!lastName || typeof lastName !== 'string') {
          throw new Error('Invalid last name');
     }

     if (!userName || typeof userName !== 'string') {
          throw new Error('Invalid username');
     }

     if (!email || typeof email !== 'string') {
          throw new Error('Invalid email');
     }

     if (!role || typeof role !== 'string') {
          throw new Error('Invalid role');
     }

     if (!password || typeof password !== 'string') {
          throw new Error('Invalid password');
     }

     if (!status || typeof status !== 'string') {
          throw new Error('Invalid status');
     }

     const formData = new FormData();
     formData.append('firstName', firstName);
     formData.append('lastName', lastName);
     formData.append('userName', userName);
     formData.append('email', email);
     formData.append('mobileNumber', mobileNumber || '');
     formData.append('role', role);
     formData.append('password', password);
     formData.append('status', status);

     // Handle image upload
     if (image && image instanceof File) {
          formData.append('image', image);
     }

     try {
          const response = await fetchWithAuth(ENDPOINTS.USER.ADD, {
               method: 'POST',
               body: formData,
          });

          if (response.code !== 200) {
               throw new Error(response.message || 'Failed to add user');
          }

          return { success: true, data: response.data };
     } catch (error) {
          console.error('Error adding user:', error);
          return { success: false, message: error.message || 'Failed to add user' };
     }
}

/**
 * Update an existing user.
 *
 * @param {string} id - The user ID.
 * @param {Object} userData - The updated user data.
 * @param {string} userData.firstName - The first name.
 * @param {string} userData.lastName - The last name.
 * @param {string} userData.userName - The username.
 * @param {string} userData.email - The email address.
 * @param {string} [userData.mobileNumber] - The mobile number.
 * @param {string} userData.role - The role.
 * @param {string} userData.status - The status.
 * @param {File} [userData.image] - The profile image file.
 * @returns {Promise<Object>} - The response from the backend.
 * @throws {Error} - Throws an error with a detailed message if the operation fails.
 */
export async function updateUser(id, userData) {
     if (!id || typeof id !== 'string') {
          throw new Error('Invalid user ID');
     }

     const { firstName, lastName, userName, email, mobileNumber, role, status, image } = userData;

     if (!firstName || typeof firstName !== 'string') {
          throw new Error('Invalid first name');
     }

     if (!lastName || typeof lastName !== 'string') {
          throw new Error('Invalid last name');
     }

     if (!userName || typeof userName !== 'string') {
          throw new Error('Invalid username');
     }

     if (!email || typeof email !== 'string') {
          throw new Error('Invalid email');
     }

     if (!role || typeof role !== 'string') {
          throw new Error('Invalid role');
     }

     if (!status || typeof status !== 'string') {
          throw new Error('Invalid status');
     }

     const formData = new FormData();
     formData.append('firstName', firstName);
     formData.append('lastName', lastName);
     formData.append('userName', userName);
     formData.append('email', email);
     formData.append('mobileNumber', mobileNumber || '');
     formData.append('role', role);
     formData.append('status', status);

     // Handle image upload - if image is provided, append it, otherwise handle removal
     if (image && image instanceof File) {
          formData.append('image', image);
     } else if (image === null || image === undefined) {
          // For image removal, we might need to handle this differently based on backend requirements
          formData.append('image', 'remove');
     }

     try {
          const response = await fetchWithAuth(`${ENDPOINTS.USER.UPDATE}/${id}`, {
               method: 'PUT',
               body: formData,
          });

          if (response.code !== 200) {
               throw new Error(response.message || 'Failed to update user');
          }

          return { success: true, data: response.data };
     } catch (error) {
          console.error('Error updating user:', error);
          return { success: false, message: error.message || 'Failed to update user' };
     }
}

/**
 * Delete a user (soft delete).
 *
 * @param {string} id - The user ID.
 * @returns {Promise<Object>} - The response from the backend.
 * @throws {Error} - Throws an error with a detailed message if the operation fails.
 */
export async function deleteUser(id) {
     if (!id || typeof id !== 'string') {
          throw new Error('Invalid user ID');
     }

     try {
          const response = await fetchWithAuth(`${ENDPOINTS.USER.DELETE}/${id}/softdelete`, {
               method: 'PATCH',
          });

          if (response.code !== 200) {
               throw new Error(response.message || 'Failed to delete user');
          }

          return { success: true, data: response.data };
     } catch (error) {
          console.error('Error deleting user:', error);
          return { success: false, message: error.message || 'Failed to delete user' };
     }
}

/**
 * Get roles for dropdown.
 *
 * @returns {Promise<Array>} - Array of role options.
 * @throws {Error} - Throws an error if the operation fails.
 */
export async function getRoles() {
     try {
          const response = await fetchWithAuth(ENDPOINTS.USER.DROPDOWN);
          if (response.code === 200) {
               // Filter out Super Admin role for security
               const filteredRoles = response.data?.filter((item) =>
                    !(item.roleName?.toLowerCase() === "super admin")
               ) || [];
               return filteredRoles.map((item) => ({
                    value: item.roleName,
                    label: item.roleName,
                    id: item._id,
               }));
          } else {
               console.error('Failed to fetch roles');
               throw new Error(response.message || 'Failed to fetch roles');
          }
     } catch (error) {
          console.error('Error in getRoles:', error);
          throw error;
     }
}
