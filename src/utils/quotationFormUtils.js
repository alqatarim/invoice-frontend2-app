import { formatDateForInput } from '@/utils/dateUtils';

export const createEmptyQuotationItem = () => ({
  productId: '',
  name: '',
  sku: '',
  description: '',
  units: '',
  unit: '',
  quantity: 1,
  rate: 0,
  discount: 0,
  discountType: 2,
  tax: 0,
  taxInfo: {
    _id: '',
    name: '',
    taxRate: 0,
  },
  amount: 0,
  taxableAmount: 0,
  key: Date.now(),
  isRateFormUpadted: false,
  form_updated_rate: '',
  form_updated_discount: '',
  form_updated_discounttype: '',
  form_updated_tax: '',
});

export function mapQuotationItems(items = []) {
  return items.map(item => {
    const discountType = item.discountType || item.form_updated_discounttype || 2;
    const taxInfo = item.taxInfo || { taxRate: 0 };

    return {
      productId: item.productId?._id || item.productId || '',
      name: item.name || '',
      sku: item.sku || item.productId?.sku || '',
      description: item.description || '',
      quantity: item.quantity || 1,
      units: item.units || '',
      unit: item.unit || '',
      rate: item.rate || 0,
      form_updated_rate: item.form_updated_rate || item.rate || 0,
      discountType,
      discount: item.discount || 0,
      form_updated_discount: item.form_updated_discount || item.discount || 0,
      form_updated_discounttype: item.form_updated_discounttype || discountType,
      form_updated_tax: item.form_updated_tax || taxInfo?.taxRate || item.tax || 0,
      taxInfo,
      tax: item.tax || 0,
      amount: item.amount || 0,
      taxableAmount: item.taxableAmount || 0,
      key: item.key || Date.now(),
      isRateFormUpadted: item.isRateFormUpadted || false,
    };
  });
}

export function buildAddQuotationDefaultValues(quotationNumber = '') {
  return {
    quotationNumber: quotationNumber || '',
    customerId: '',
    quotationDate: formatDateForInput(new Date()),
    expiryDate: formatDateForInput(new Date()),
    bank: '',
    employee: '',
    referenceNo: '',
    notes: '',
    termsAndConditions: '',
    items: [],
    taxableAmount: 0,
    totalDiscount: 0,
    vat: 0,
    TotalAmount: 0,
    roundOff: false,
    roundOffValue: 0,
  };
}

export function buildEditQuotationDefaultValues(quotation) {
  return {
    quotationNumber: quotation?.quotation_id || '',
    customerId: quotation?.customerId?._id || quotation?.customerId || '',
    quotationDate: formatDateForInput(quotation?.quotation_date),
    expiryDate: formatDateForInput(quotation?.due_date),
    bank: quotation?.bank?._id || quotation?.bank || '',
    employee: quotation?.employee?._id || quotation?.employee || '',
    referenceNo: quotation?.reference_no || quotation?.referenceNo || '',
    notes: quotation?.notes || '',
    termsAndConditions: quotation?.termsAndCondition || quotation?.termsAndConditions || '',
    items: mapQuotationItems(quotation?.items),
    taxableAmount: quotation?.taxableAmount || 0,
    totalDiscount: quotation?.totalDiscount || 0,
    vat: quotation?.vat || 0,
    TotalAmount: quotation?.TotalAmount || 0,
    roundOff: quotation?.roundOff || false,
    roundOffValue: quotation?.roundOffValue || 0,
  };
}

export function buildQuotationPayload(data, status) {
  return {
    quotationNumber: data.quotationNumber,
    quotation_id: data.quotationNumber,
    customerId: data.customerId,
    date: data.quotationDate,
    expiryDate: data.expiryDate,
    bank: data.bank || '',
    employee: data.employee || '',
    referenceNo: data.referenceNo || '',
    notes: data.notes || '',
    termsAndConditions: data.termsAndConditions || '',
    subTotal: data.taxableAmount,
    totalAmount: data.TotalAmount,
    totalDiscount: data.totalDiscount,
    totalTax: data.vat,
    taxableAmount: data.taxableAmount,
    TotalAmount: data.TotalAmount,
    vat: data.vat,
    roundOff: data.roundOff || false,
    status,
    items: (data.items || [])
      .filter(item => item?.productId)
      .map(item => ({
        ...item,
        productId: item.productId,
        quantity: Number(item.quantity),
        rate: Number(item.rate),
        discount: Number(item.discount),
        discountType: Number(item.discountType),
        tax: Number(item.tax),
        amount: Number(item.amount),
      })),
  };
}
