'use server';

import { fetchWithAuth } from '@/Auth/fetchWithAuth';
import { dataURLtoBlob } from '@/utils/fileUtils';

import dayjs from 'dayjs';




const ENDPOINTS = {
  EXPENSE: {
    LIST: '/expense/listExpenses',
    ADD: '/expense/addExpense',
    VIEW: '/expense/viewExpense',
    UPDATE: '/expense/updateExpense',
    DELETE: '/expense/deleteExpense',
    GET_NUMBER: '/expense/getExpenseNumber',
    SET_AS_PENDING: '/expense/setAsPending',
    SET_AS_PAID: '/expense/setAsPaid',
  }
};

export async function getExpensesList(page = 1, pageSize = 10, search = '') {
  try {
    const skipSize = page === 1 ? 0 : (page - 1) * pageSize;
    const queryParams = [`limit=${pageSize}`, `skip=${skipSize}`];

    if (search) {
      queryParams.push(`search=${encodeURIComponent(search)}`);
    }

    const response = await fetchWithAuth(
      `${ENDPOINTS.EXPENSE.LIST}?${queryParams.join('&')}`
    );

    if (response.code !== 200) {
      throw new Error(response?.message || 'Failed to fetch expenses');
    }

    return {
      success: true,
      data: response.data || [],
      totalRecords: response.totalRecords || 0,
      summary: response.summary || {},
    };
  } catch (error) {
    console.error('Error fetching expenses list:', error);
    return { success: false, message: error.message };
  }
}

export async function deleteExpense(id) {
  try {
    const response = await fetchWithAuth(ENDPOINTS.EXPENSE.DELETE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ _id: id })
    });

    if (response.code === 200) {
      return {
        success: true,
        message: 'Expense deleted successfully'
      };
    }

    throw new Error(response?.message || 'Failed to delete expense');
  } catch (error) {
    console.error('Error deleting expense:', error);
    return { success: false, message: error.message };
  }
}

export async function getExpenseNumber() {
  try {
    const response = await fetchWithAuth(ENDPOINTS.EXPENSE.GET_NUMBER);
    return {
      success: response.code === 200,
      data: response.data
    };
  } catch (error) {
    console.error('Error getting expense number:', error);
    return { success: false, message: error.message };
  }
}

const formatExpenseData = (data) => {
  const formData = new FormData();

  // Handle expenseDate
  if (data.expenseDate) {
    formData.append('expenseDate', dayjs(data.expenseDate).toISOString());
  }

  // Handle amount
  if (data.amount !== undefined && data.amount !== null) {
    formData.append('amount', Number(data.amount).toString());
  }

  // Handle attachment
  if (data.attachment?.base64) {
    // Convert base64 back to file
    const blob = dataURLtoBlob(data.attachment.base64);
    const file = new File([blob], data.attachment.name, { type: data.attachment.type });
    formData.append('attachment', file);
  } else {
    formData.append('attachment', '');
  }

  // Handle other fields
  if (data.expenseId) formData.append('expenseId', data.expenseId);
  if (data.reference !== undefined) formData.append('reference', data.reference || '');
  if (data.paymentMode) formData.append('paymentMode', data.paymentMode);
  if (data.status) formData.append('status', data.status);

  return formData;
};

export async function addExpense(data) {
  try {
    const formData = formatExpenseData(data);

    const response = await fetchWithAuth(ENDPOINTS.EXPENSE.ADD, {
      method: 'POST',
      body: formData
    });

    if (!response || response.code !== 200) {
      console.error('Server response:', response);
      throw new Error(response?.message || 'Failed to add expense');
    }

    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    console.error('Error adding expense:', error);
    return {
      success: false,
      message: error.message || 'Failed to add expense'
    };
  }
}

export async function getExpenseDetails(id) {
  try {
    const response = await fetchWithAuth(`${ENDPOINTS.EXPENSE.VIEW}/${id}`);

    if (!response || response.code !== 200) {
      throw new Error(response?.message || 'Failed to fetch expense details');
    }

    return response.data || { expenseDetails: null };
  } catch (error) {
    console.error('Error fetching expense details:', error);
    throw error;
  }
}

export async function setExpenseAsPending(id) {
  try {
    const response = await fetchWithAuth(`${ENDPOINTS.EXPENSE.SET_AS_PENDING}/${id}`, {
      method: 'PATCH',
      cache: 'no-store',
    });

    if (response.code === 200) {
      return {
        success: true,
        message: response.data?.message || 'Expense set to pending successfully',
      };
    }

    const message = Array.isArray(response.data?.message)
      ? response.data.message.join(' ')
      : response.data?.message || response.message;

    throw new Error(message || 'Failed to set expense as pending');
  } catch (error) {
    console.error('Error setting expense as pending:', error);
    return { success: false, message: error.message };
  }
}

export async function setExpenseAsPaid(id) {
  try {
    const response = await fetchWithAuth(`${ENDPOINTS.EXPENSE.SET_AS_PAID}/${id}`, {
      method: 'PATCH',
      cache: 'no-store',
    });

    if (response.code === 200) {
      return {
        success: true,
        message: response.data?.message || 'Expense set to paid successfully',
      };
    }

    const message = Array.isArray(response.data?.message)
      ? response.data.message.join(' ')
      : response.data?.message;

    throw new Error(message || response.message || 'Failed to set expense as paid');
  } catch (error) {
    console.error('Error setting expense as paid:', error);
    return { success: false, message: error.message };
  }
}

export async function updateExpense(data) {
  try {
    const formData = new FormData();

    // Append all fields manually to match old implementation
    formData.append('_id', data.id);
    formData.append('expenseId', data.expenseId || '');
    formData.append('reference', data.reference || '');
    formData.append('amount', Number(data.amount).toString());
    formData.append('paymentMode', data.paymentMode?.value || data.paymentMode);
    formData.append('expenseDate', dayjs(data.expenseDate).toISOString());
    formData.append('description', data.description || '');
    formData.append('status', data.status?.value || data.status);

    // Handle attachment similar to old implementation
    if (data.attachment?.base64) {
      const blob = dataURLtoBlob(data.attachment.base64);
      const file = new File([blob], data.attachment.name, { type: data.attachment.type });
      formData.append('attachment', file);
    } else {
      formData.append('attachment', '');
    }

    const response = await fetchWithAuth(`${ENDPOINTS.EXPENSE.UPDATE}/${data.id}`, {
      method: 'PUT',
      body: formData
    });

    if (!response || response.code !== 200) {
      console.error('Server response:', response);
      throw new Error(response?.message || 'Failed to update expense');
    }

    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    console.error('Error updating expense:', error);
    return {
      success: false,
      message: error.message || 'Failed to update expense'
    };
  }
}
