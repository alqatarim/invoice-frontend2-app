'use server'

import { fetchWithAuth } from '@/Auth/fetchWithAuth'
import { rolesApi, dropdown_api } from '@/core/end_points/end_points'

const PERMISSION_API = {
  VIEW: '/permission/viewPermission',
  UPDATE: '/permission/updatePermissions'
}

// Helper function to validate role data
function validateRoleData(result) {
  try {
    // Handle different response structures
    if (result?.data && Array.isArray(result.data)) {
      return result.data
    }
    
    if (Array.isArray(result)) {
      return result
    }
    
    console.warn('Unexpected role data structure:', result)
    return []
  } catch (error) {
    console.error('Error validating role data:', error)
    return []
  }
}

// Get initial roles data for list page
export async function getInitialRolesData() {
  try {
    const result = await fetchWithAuth(rolesApi.Get, {
      cache: 'no-store'
    })

    if (result.code !== 200) {
      throw new Error('Failed to fetch roles')
    }

  
    
    if (result.code === 200 && result.data) { 
      // Calculate card counts
      const cardCounts = {
        totalRoles: result.data.length,
        activeRoles: result.data.filter(role => !role.isDeleted).length,
        superAdminRole: result.data.filter(role => 
          role.roleName === 'Super Admin' && !role.isDeleted
        ).length
      }

      return {
        roles: result.data,
        cardCounts
      }
    } else {
      console.error('Failed to fetch roles:', result);
      throw new Error(result.message || 'Failed to fetch roles');
    }
  } catch (error) {
    console.error('Error fetching initial roles data:', error)
    return {
      roles: [],
      cardCounts: {
        totalRoles: 0,
        activeRoles: 0,
        superAdminRole: 0
      }
    }
  }
}

// Get filtered roles (for pagination/search)
export async function getFilteredRoles(searchQuery = '', page = 1, rowsPerPage = 10) {
  try {
    // fetchWithAuth returns the JSON object directly, not a Response object
    const result = await fetchWithAuth(rolesApi.Get, {
      method: 'GET',
      cache: 'no-store'
    })
    
    // Validate and extract data using helper function
    let roles = validateRoleData(result)
    
    // Filter out deleted roles for display
    roles = roles.filter(role => !role.isDeleted)

    // Apply search filter
    if (searchQuery.trim()) {
      roles = roles.filter(role => 
        role.roleName?.toLowerCase().includes(searchQuery.toLowerCase().trim())
      )
    }

    // Apply pagination
    const startIndex = (page - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    const paginatedRoles = roles.slice(startIndex, endIndex)

    return {
      roles: paginatedRoles,
      totalCount: roles.length
    }
  } catch (error) {
    console.error('Error fetching filtered roles:', error)
    return {
      roles: [],
      totalCount: 0
    }
  }
}

// Add new role
export async function addRole(formData) {
  try {
    const roleName = formData.get('roleName')?.trim()
    const roleIcon = formData.get('roleIcon')

    if (!roleName) {
      return {
        success: false,
        error: 'Role name is required'
      }
    }

    // Prepare request body
    const requestBody = { roleName }
    
    // Add roleIcon if provided, otherwise backend will use default
    if (roleIcon) {
      requestBody.roleIcon = roleIcon
    }

    // fetchWithAuth returns the JSON object directly, not a Response object
    const result = await fetchWithAuth(rolesApi.Add, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    return {
      success: true,
      message: result.data?.message || result.message || 'Role added successfully'
    }
  } catch (error) {
    console.error('Error adding role:', error)
    return {
      success: false,
      error: error.message || 'Failed to add role'
    }
  }
}

// Update role
export async function updateRole(formData) {
  try {
    const roleId = formData.get('_id')
    const roleName = formData.get('roleName')?.trim()
    const roleIcon = formData.get('roleIcon')

    if (!roleId || !roleName) {
      return {
        success: false,
        error: 'Role ID and name are required'
      }
    }

    // Prepare request body
    const requestBody = { roleName }
    
    // Add roleIcon (including empty string check)
    if (roleIcon !== undefined && roleIcon !== null) {
      requestBody.roleIcon = roleIcon
    }

    // Debug logging
    console.log('Frontend updateRole - FormData received:', {
      roleId,
      roleName,
      roleIcon
    })
    console.log('Frontend updateRole - Request body:', requestBody)

    // fetchWithAuth returns the JSON object directly, not a Response object
    const result = await fetchWithAuth(`${rolesApi.Update}/${roleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    return {
      success: true,
      message: result.data?.message || result.message || 'Role updated successfully'
    }
  } catch (error) {
    console.error('Error updating role:', error)
    return {
      success: false,
      error: error.message || 'Failed to update role'
    }
  }
}

// Get role by ID (for edit)
export async function getRoleById(roleId) {
  try {
    // fetchWithAuth returns the JSON object directly, not a Response object
    const result = await fetchWithAuth(rolesApi.Get, {
      method: 'GET',
      cache: 'no-store'
    })

    const role = result.data?.find(r => r._id === roleId)

    if (!role) {
      throw new Error('Role not found')
    }

    return role
  } catch (error) {
    console.error('Error fetching role by ID:', error)
    return null
  }
}

// Get permissions for a role
export async function getPermissionsByRoleId(roleId) {
  try {
    // fetchWithAuth returns the JSON object directly, not a Response object
    const result = await fetchWithAuth(`${PERMISSION_API.VIEW}/${roleId}`, {
      method: 'GET',
      cache: 'no-store'
    })

    console.log('Permissions Response:', result)

    // Check if the response is successful
    if (result.code === 200 && result.data) {
      // Get role details
      const rolesResult = await fetchWithAuth(rolesApi.Get, {
        method: 'GET',
        cache: 'no-store'
      })

      let role = null;
      
      if (rolesResult.code === 200 && rolesResult.data) {
        role = rolesResult.data.find(r => r._id === roleId)
      }

      return {
        permissions: result.data,
        roleName: role?.roleName || result.data.roleName || 'Unknown Role'
      }
    } else {
      throw new Error(result.message || 'Failed to fetch permissions')
    }
  } catch (error) {
    console.error('Error fetching permissions:', error)
    throw error // Re-throw the error so it can be handled by the calling function
  }
}

// Update permissions for a role
export async function updatePermissions(formData) {
  try {
    const permissionId = formData.get('permissionId')
    const allModules = formData.get('allModules') === 'true'
    const modulesJson = formData.get('modules')
    const modules = JSON.parse(modulesJson)

    // fetchWithAuth returns the JSON object directly, not a Response object
    const result = await fetchWithAuth(`${PERMISSION_API.UPDATE}/${permissionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        allModules,
        modules
      })
    })

    return {
      success: true,
      message: result.message || 'Permissions updated successfully'
    }
  } catch (error) {
    console.error('Error updating permissions:', error)
    return {
      success: false,
      error: error.message || 'Failed to update permissions'
    }
  }
}

// Get roles for dropdown
export async function getRolesForDropdown() {
  try {
    // fetchWithAuth returns the JSON object directly, not a Response object
    const result = await fetchWithAuth(dropdown_api.role_api, {
      method: 'GET',
      cache: 'no-store'
    })

    return result.data || []
  } catch (error) {
    console.error('Error fetching roles for dropdown:', error)
    return []
  }
}