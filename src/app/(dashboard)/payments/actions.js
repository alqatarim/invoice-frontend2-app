'use server';

import { fetchWithAuth } from '@/utils/fetchWithAuth';
import { dataURLtoBlob } from '@/utils/helpers';
import { revalidatePath } from 'next/cache';
import dayjs from 'dayjs';

const ENDPOINTS = {
  PAYMENT: {
    LIST: '/payment/paymentList',
    ADD: '/payment/addPayment',
    VIEW: '/payment/viewPayment',
    UPDATE: '/payment/updatePayment',
    DELETE: '/payment/deletePayment',
    GET_PAYMENT_NUMBER: '/payment/getPaymentNumber',
    UPDATE_STATUS: '/payment/update_status'
  },
  DROPDOWN: {
    // CUSTOMER_LIST: '/drop_down/customer',
    INVOICE_LIST: '/payment/invoice_list',
    CUSTOMER_LIST: '/payment/customer_list'
  }
};


export async function getCustomers(filters = {}) {
  try {
    let queryParams = new URLSearchParams();

    if (filters.name) {
      queryParams.append('name', filters.name);
    }
    if (filters.invoiceId) {
      queryParams.append('invoiceId', filters.invoiceId);
    }

    const url = `${ENDPOINTS.DROPDOWN.CUSTOMER_LIST}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await fetchWithAuth(url);

    if (response.code === 200) {
      return response.data || [];
    }
    throw new Error(response.message || 'Failed to fetch customers');
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
}


export async function getInvoices() {

  try {
    const response = await fetchWithAuth(ENDPOINTS.DROPDOWN.INVOICE_LIST);
    return response.data
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
}



export async function getPaymentsList(page = 1, pageSize = 10, filters = {}) {
  try {
    revalidatePath('/payments')
    const skipSize = page === 1 ? 0 : (page - 1) * pageSize;
    const queryParams = [`limit=${pageSize}`, `skip=${skipSize}`];

    if (filters.customer && filters.customer.length > 0) {
      queryParams.push(`customer=${filters.customer.join(',')}`);
    }

    const response = await fetchWithAuth(
      `${ENDPOINTS.PAYMENT.LIST}?${queryParams.join('&')}`
    );

    if (response.code !== 200) {
      throw new Error(response?.message || 'Failed to fetch payments');
    }

    return {
      success: true,
      data: response.data || [],
      totalRecords: response.totalRecords || 0
    };
  } catch (error) {
    console.error('Error fetching payments list:', error);
    return { success: false, message: error.message };
  }
}






export async function deletePayment(id) {
  try {
    const response = await fetchWithAuth(`${ENDPOINTS.PAYMENT.DELETE}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
    });

    if (response.code === 200) {
      revalidatePath('/payments')
      return {
        success: true,
        message: 'Payment deleted successfully'
      };
    }

    throw new Error(response?.message || 'Failed to delete payment');
  } catch (error) {
    console.error('Error deleting payment:', error);
    return { success: false, message: error.message };
  }
}

export async function getPaymentDetails(id) {
  try {
    const response = await fetchWithAuth(`${ENDPOINTS.PAYMENT.VIEW}/${id}`);

    if (response.code !== 200) {
      throw new Error(response?.message || 'Failed to fetch payment details');
    }

    // Transform the data to include all necessary fields
    const paymentDetails = response.data?.payment_details;

    if (!paymentDetails) {
      throw new Error('Payment details not found');
    }

    return {
      success: true,
      data: paymentDetails
    };
  } catch (error) {
    console.error('Error fetching payment details:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch payment details'
    };
  }
}

export async function addPayment(data) {
  try {
    const response = await fetchWithAuth(ENDPOINTS.PAYMENT.ADD, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        invoiceId: data.invoiceId,
        payment_number: data.paymentNumber,
        payment_method: data.payment_method,
        amount: data.amount,
        received_on: data.received_on,
        notes: data.notes,
        status: data.status
      })
    });

    if (!response || response.code !== 200) {
      throw new Error(response?.message || 'Failed to add payment');
    }

    revalidatePath('/payments')
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    console.error('Error adding payment:', error);
    return {
      success: false,
      message: error.message || 'Failed to add payment'
    };
  }
}

export async function updatePayment(data) {
  try {
    const formData = new FormData();

    // Append all fields
    formData.append('_id', data.id);
    if (data.date) formData.append('date', dayjs(data.date).toISOString());
    if (data.amount) formData.append('amount', Number(data.amount).toString());
    if (data.customerId) formData.append('customerId', data.customerId);
    if (data.paymentNumber) formData.append('paymentNumber', data.paymentNumber);
    if (data.invoiceId) formData.append('invoiceId', data.invoiceId);
    if (data.paymentMode) formData.append('paymentMode', data.paymentMode?.value || data.paymentMode);
    if (data.description) formData.append('description', data.description);

    const response = await fetchWithAuth(`${ENDPOINTS.PAYMENT.UPDATE}/${data.id}`, {
      method: 'PUT',
      body: formData
    });

    if (!response || response.code !== 200) {
      console.error('Server response:', response);
      throw new Error(response?.message || 'Failed to update payment');
    }

    revalidatePath('/payments')
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    console.error('Error updating payment:', error);
    return {
      success: false,
      message: error.message || 'Failed to update payment'
    };
  }
}

export async function getInvoicesByCustomer(customerId) {
  try {
    const url = customerId
      ? `${ENDPOINTS.DROPDOWN.INVOICE_LIST}?customerId=${customerId}`
      : ENDPOINTS.DROPDOWN.INVOICE_LIST;

    const response = await fetchWithAuth(url);

    if (response.code === 200) {
      return response.data || [];
    }
    throw new Error(response.message || 'Failed to fetch invoices');
  } catch (error) {
    console.error('Error fetching invoices:', error);
    throw error;
  }
}

export async function getPaymentNumber() {
  try {
    revalidatePath('/payments/payment-add')
    const response = await fetchWithAuth(ENDPOINTS.PAYMENT.GET_PAYMENT_NUMBER);
    return response.data;
  } catch (error) {
    console.error('Error fetching payment number:', error);
    throw error;
  }
}

export async function updatePaymentStatus(id, status) {
  try {
    const response = await fetchWithAuth(`${ENDPOINTS.PAYMENT.UPDATE_STATUS}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: status
      })
    });

    if (response.code !== 200) {
      throw new Error(response?.message || 'Failed to update payment status');
    }

    revalidatePath('/payments');
    return {
      success: true,
      message: 'Payment status updated successfully'
    };
  } catch (error) {
    console.error('Error updating payment status:', error);
    return { success: false, message: error.message };
  }
}

export async function searchCustomers(searchText) {
  try {
    const response = await fetchWithAuth(`${ENDPOINTS.DROPDOWN.CUSTOMER_LIST}?name=${searchText}`);

    if (response.code === 200) {
      return {
        success: true,
        data: response.data || []
      };
    }
    throw new Error(response.message || 'Failed to search customers');
  } catch (error) {
    console.error('Error searching customers:', error);
    return { success: false, message: error.message };
  }
}
