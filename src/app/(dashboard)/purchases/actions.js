'use server';

import { fetchWithAuth } from '@/Auth/fetchWithAuth';
import { dataURLtoBlob } from '@/utils/fileUtils';

const ENDPOINTS = {
     PURCHASE: {
          LIST: '/purchases/listPurchases',
          ADD: '/purchases/addPurchase',
          VIEW: '/purchases/viewPurchase',
          UPDATE: '/purchases/updatePurchase',
          DELETE: '/purchases/deletePurchase',
          GET_NUMBER: '/purchases/getPurchaseNumber'
     }
};

export async function getPurchaseList(page = 1, pageSize = 10, searchTerm = '', filters = {}) {
     try {
          let url = `${ENDPOINTS.PURCHASE.LIST}?limit=${pageSize}&skip=${(page - 1) * pageSize}`;

          if (searchTerm) {
               url += `&search=${searchTerm}`;
          }

          if (filters.vendors && filters.vendors.length > 0) {
               url += `&vendor=${filters.vendors.join(',')}`;
          }

          const response = await fetchWithAuth(url);
          return {
               success: response.code === 200,
               data: response.data || [],
               totalRecords: response.totalRecords
          };
     } catch (error) {
          console.error('Error fetching purchase list:', error);
          return { success: false, message: error.message };
     }
}

export async function deletePurchase(id) {
     try {
          const response = await fetchWithAuth(`${ENDPOINTS.PURCHASE.DELETE}`, {
               method: 'POST',
               headers: {
                    'Content-Type': 'application/json'
               },
               body: JSON.stringify({ _id: id })
          });

          return {
               success: response.code === 200,
               message: response.message
          };
     } catch (error) {
          console.error('Error deleting purchase:', error);
          return { success: false, message: error.message };
     }
}

export async function getPurchaseDetails(id) {
     try {
          const response = await fetchWithAuth(`${ENDPOINTS.PURCHASE.VIEW}/${id}`);
          return {
               success: response.code === 200,
               data: response.data
          };
     } catch (error) {
          console.error('Error fetching purchase details:', error);
          return { success: false, message: error.message };
     }
}

export async function addPurchase(data, signatureURL) {
     try {
          // Convert data to FormData
          const formData = new FormData();

          // Add items data with explicit field names instead of dynamic iteration
          data.items.forEach((item, i) => {
               // Product information
               formData.append(`items[${i}][key]`, item.key || '');
               formData.append(`items[${i}][name]`, item.name || '');
               formData.append(`items[${i}][productId]`, item.productId || '');
               formData.append(`items[${i}][units]`, item.units || '');
               formData.append(`items[${i}][unit]`, item.unit || '');

               // Quantity and price
               formData.append(`items[${i}][quantity]`, Number(item.quantity || 0).toString());
               formData.append(`items[${i}][purchasePrice]`, Number(item.purchasePrice || 0).toString());
               formData.append(`items[${i}][rate]`, Number(item.rate || 0).toString());

               // Discount details
               formData.append(`items[${i}][discountType]`, item.discountType || '3');
               formData.append(`items[${i}][discount]`, Number(item.discount || 0).toString());

               // Tax information
               if (item.taxInfo) {
                    const taxInfoStr = typeof item.taxInfo === 'string' ? item.taxInfo : JSON.stringify(item.taxInfo);
                    formData.append(`items[${i}][taxInfo]`, taxInfoStr);
               }
               formData.append(`items[${i}][tax]`, Number(item.tax || 0).toString());

               // Form updated values
               formData.append(`items[${i}][isRateFormUpadted]`, item.isRateFormUpadted || false);
               formData.append(`items[${i}][form_updated_discounttype]`, item.form_updated_discounttype || item.discountType || '3');
               formData.append(`items[${i}][form_updated_discount]`, Number(item.form_updated_discount || item.discount || 0).toString());
               formData.append(`items[${i}][form_updated_rate]`, Number(item.form_updated_rate || item.rate || 0).toString());
               formData.append(`items[${i}][form_updated_tax]`, Number(item.form_updated_tax || item.tax || 0).toString());

               // Amount
               if (item.amount) {
                    formData.append(`items[${i}][amount]`, Number(item.amount).toString());
               }
          });

          // Add basic fields with explicit handling
          if (data.vendorId) formData.append('vendorId', data.vendorId);
          if (data.purchaseDate) formData.append('purchaseDate', new Date(data.purchaseDate).toISOString());
          if (data.dueDate) formData.append('dueDate', new Date(data.dueDate).toISOString());
          if (data.referenceNo) formData.append('referenceNo', data.referenceNo);
          if (data.supplierInvoiceSerialNumber) formData.append('supplierInvoiceSerialNumber', data.supplierInvoiceSerialNumber);
          if (data.notes) formData.append('notes', data.notes);
          if (data.termsAndCondition) formData.append('termsAndCondition', data.termsAndCondition);
          if (data.bank) formData.append('bank', data.bank);
          if (data.sign_type) formData.append('sign_type', data.sign_type);

          // Handle signature based on type
          if (data.sign_type === 'manualSignature' && data.signatureId) {
               formData.append('signatureId', data.signatureId);
          } else if (data.sign_type === 'eSignature') {
               if (data.signatureName) formData.append('signatureName', data.signatureName);
               if (data.signatureData) formData.append('signatureData', data.signatureData);
          }

          // Add total values with number conversion
          if (data.taxableAmount) formData.append('taxableAmount', Number(data.taxableAmount).toString());
          if (data.TotalAmount) formData.append('TotalAmount', Number(data.TotalAmount).toString());
          if (data.vat) formData.append('vat', Number(data.vat).toString());
          if (data.totalDiscount) formData.append('totalDiscount', Number(data.totalDiscount).toString());

          // Add the subTotal field
          if (data.subTotal) formData.append('subTotal', Number(data.subTotal).toString());

          // Handle signature if provided
          if (signatureURL) {
               try {
                    const blob = await dataURLtoBlob(signatureURL);
                    formData.append('signatureImage', blob, 'signature.png');
               } catch (error) {
                    console.error('Error processing signature:', error);
                    throw new Error('Failed to process signature');
               }
          }

          const response = await fetchWithAuth(ENDPOINTS.PURCHASE.ADD, {
               method: 'POST',
               body: formData
          });

          return {
               success: response.code === 200,
               data: response.data,
               message: response.message
          };
     } catch (error) {
          console.error('Error adding purchase:', error);
          return { success: false, message: error.message };
     }
}

export async function updatePurchase(id, data, signatureURL) {
     try {
          // Convert data to FormData
          const formData = new FormData();

          // Add items data with explicit field names instead of dynamic iteration
          data.items.forEach((item, i) => {
               // Product information
               formData.append(`items[${i}][key]`, item.key || '');
               formData.append(`items[${i}][name]`, item.name || '');
               formData.append(`items[${i}][productId]`, item.productId || '');
               formData.append(`items[${i}][units]`, item.units || '');
               formData.append(`items[${i}][unit]`, item.unit || '');

               // Quantity and price
               formData.append(`items[${i}][quantity]`, Number(item.quantity || 0).toString());
               formData.append(`items[${i}][purchasePrice]`, Number(item.purchasePrice || 0).toString());
               formData.append(`items[${i}][rate]`, Number(item.rate || 0).toString());

               // Discount details
               formData.append(`items[${i}][discountType]`, item.discountType || '3');
               formData.append(`items[${i}][discount]`, Number(item.discount || 0).toString());

               // Tax information
               if (item.taxInfo) {
                    const taxInfoStr = typeof item.taxInfo === 'string' ? item.taxInfo : JSON.stringify(item.taxInfo);
                    formData.append(`items[${i}][taxInfo]`, taxInfoStr);
               }
               formData.append(`items[${i}][tax]`, Number(item.tax || 0).toString());

               // Form updated values
               formData.append(`items[${i}][isRateFormUpadted]`, item.isRateFormUpadted || false);
               formData.append(`items[${i}][form_updated_discounttype]`, item.form_updated_discounttype || item.discountType || '3');
               formData.append(`items[${i}][form_updated_discount]`, Number(item.form_updated_discount || item.discount || 0).toString());
               formData.append(`items[${i}][form_updated_rate]`, Number(item.form_updated_rate || item.rate || 0).toString());
               formData.append(`items[${i}][form_updated_tax]`, Number(item.form_updated_tax || item.tax || 0).toString());

               // Amount
               if (item.amount) {
                    formData.append(`items[${i}][amount]`, Number(item.amount).toString());
               }
          });

          // Add basic fields with explicit handling
          if (data.vendorId) formData.append('vendorId', data.vendorId);
          if (data.purchaseDate) formData.append('purchaseDate', new Date(data.purchaseDate).toISOString());
          if (data.dueDate) formData.append('dueDate', new Date(data.dueDate).toISOString());
          if (data.referenceNo) formData.append('referenceNo', data.referenceNo);
          if (data.supplierInvoiceSerialNumber) formData.append('supplierInvoiceSerialNumber', data.supplierInvoiceSerialNumber);
          if (data.notes) formData.append('notes', data.notes);
          if (data.termsAndCondition) formData.append('termsAndCondition', data.termsAndCondition);
          if (data.bank) formData.append('bank', data.bank);
          if (data.sign_type) formData.append('sign_type', data.sign_type);

          // Handle signature based on type
          if (data.sign_type === 'manualSignature' && data.signatureId) {
               formData.append('signatureId', data.signatureId);
          } else if (data.sign_type === 'eSignature') {
               if (data.signatureName) formData.append('signatureName', data.signatureName);
               if (data.signatureData) formData.append('signatureData', data.signatureData);
          }

          // Add total values with number conversion
          if (data.taxableAmount) formData.append('taxableAmount', Number(data.taxableAmount).toString());
          if (data.TotalAmount) formData.append('TotalAmount', Number(data.TotalAmount).toString());
          if (data.vat) formData.append('vat', Number(data.vat).toString());
          if (data.totalDiscount) formData.append('totalDiscount', Number(data.totalDiscount).toString());

          // Add the subTotal field
          if (data.subTotal) formData.append('subTotal', Number(data.subTotal).toString());

          // Handle signature if provided
          if (signatureURL) {
               try {
                    const blob = await dataURLtoBlob(signatureURL);
                    formData.append('signatureImage', blob, 'signature.png');
               } catch (error) {
                    console.error('Error processing signature:', error);
                    throw new Error('Failed to process signature');
               }
          }

          const response = await fetchWithAuth(`${ENDPOINTS.PURCHASE.UPDATE}/${id}`, {
               method: 'PUT',
               body: formData
          });

          return {
               success: response.code === 200,
               data: response.data,
               message: response.message
          };
     } catch (error) {
          console.error('Error updating purchase:', error);
          return { success: false, message: error.message };
     }
}

export async function getPurchaseNumber() {
     try {
          const response = await fetchWithAuth(ENDPOINTS.PURCHASE.GET_NUMBER);
          return {
               success: response.code === 200,
               data: response.data
          };
     } catch (error) {
          console.error('Error getting purchase number:', error);
          return { success: false, message: error.message };
     }
}

// Dropdown data functions
export async function getVendors() {
     try {
          const response = await fetchWithAuth('/drop_down/vendor');
          return response.data || [];
     } catch (error) {
          console.error('Error fetching vendors:', error);
          return [];
     }
}

export async function getProducts() {
     try {
          const response = await fetchWithAuth('/drop_down/product');
          return response.data || [];
     } catch (error) {
          console.error('Error fetching products:', error);
          return [];
     }
}

export async function getTaxRates() {
     try {
          const response = await fetchWithAuth('/drop_down/tax');
          return response.data || [];
     } catch (error) {
          console.error('Error fetching tax rates:', error);
          return [];
     }
}

export async function getBanks() {
     try {
          const response = await fetchWithAuth('/drop_down/bank');
          return response.data || [];
     } catch (error) {
          console.error('Error fetching banks:', error);
          return [];
     }
}

export async function getSignatures() {
     try {
          const response = await fetchWithAuth('/drop_down/signature');
          return response.data || [];
     } catch (error) {
          console.error('Error fetching signatures:', error);
          return [];
     }
}

export async function getUnits() {
     try {
          const response = await fetchWithAuth('/drop_down/unit');
          return response.data || [];
     } catch (error) {
          console.error('Error fetching units:', error);
          return [];
     }
}

export async function getDropdownData() {
     try {
          const [vendors, products, taxRates, banks, signatures, units] = await Promise.all([
               getVendors(),
               getProducts(),
               getTaxRates(),
               getBanks(),
               getSignatures(),
               getUnits()
          ]);

          return {
               vendors,
               products,
               taxRates,
               banks,
               signatures,
               units
          };
     } catch (error) {
          console.error('Error fetching dropdown data:', error);
          return {
               vendors: [],
               products: [],
               taxRates: [],
               banks: [],
               signatures: [],
               units: []
          };
     }
}
