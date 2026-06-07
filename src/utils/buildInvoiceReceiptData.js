export function buildInvoiceReceiptData(invoiceData = null, companyData = null) {
  if (!invoiceData) return null;

  const company = companyData || {};
  const fullAddress =
    [
      company.addressLine1,
      company.addressLine2,
      company.city,
      company.state,
      company.country,
      company.postalCode || company.pincode,
    ]
      .filter(Boolean)
      .join(', ') || company.address || company.city || 'Saudi Arabia';

  return {
    ...invoiceData,
    company: {
      ...company,
      companyName: company.companyName || 'Company',
      fullAddress,
      vat_number:
        company.vat_number ||
        company.vatNo ||
        company.vat ||
        company.taxNumber ||
        'N/A',
    },
    items: invoiceData.items || [],
    customerId: invoiceData.customerId,
    customer: invoiceData.walkInCustomer || invoiceData.customerId,
  };
}
