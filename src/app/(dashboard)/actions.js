'use server';


 import { fetchWithAuth } from '@/utils/fetchWithAuth';
const NEXT_PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;




export async function getFilteredDashboardData(filter = '') {
  return fetchWithAuth(`/dashboard?type=${filter}`);
}

export async function getDashboardData() {
  return fetchWithAuth(`/dashboard`);
}
export async function convertToSalesReturn(id) {
  return fetchWithAuth(`/invoice/${id}/convertsalesreturn`, { method: 'POST' });
}

export async function sendInvoice(id) {
  return fetchWithAuth(`/invoice/pdfCreate?invoiceId=${id}`);
}


export async function cloneInvoice(id) {
  return fetchWithAuth(`/invoice/${id}/clone`, { method: 'POST' });
}



