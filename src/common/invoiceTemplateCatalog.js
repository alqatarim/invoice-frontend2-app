export const defaultInvoiceTemplateId = '1'

export const invoiceTemplateCatalog = [
  {
    id: '1',
    name: 'General Invoice 1',
    image: '/images/invoices/invoice1.jpg',
    description: 'A balanced layout for standard invoices with full totals and signature space.'
  },
  {
    id: '2',
    name: 'General Invoice 2',
    image: '/images/invoices/invoice2.jpg',
    description: 'A clean compact option that keeps the header prominent for retail-style billing.'
  },
  {
    id: '3',
    name: 'General Invoice 3',
    image: '/images/invoices/invoice3.jpg',
    description: 'A denser document style suited to detailed line items and supporting notes.'
  },
  {
    id: '4',
    name: 'General Invoice 4',
    image: '/images/invoices/invoice4.jpg',
    description: 'A presentation-focused format with stronger spacing for customer-facing documents.'
  },
  {
    id: '5',
    name: 'General Invoice 5',
    image: '/images/invoices/invoice5.jpg',
    description: 'A simple alternative layout when you want a slightly different visual hierarchy.'
  }
]

export const resolveInvoiceTemplateId = value => {
  const candidate = String(
    value?.defaultTemplateId ||
      value?.default_invoice_template ||
      value?.defaultInvoiceTemplate ||
      value?.updatedData?.default_invoice_template ||
      value ||
      defaultInvoiceTemplateId
  ).trim()

  const exists = invoiceTemplateCatalog.some(template => template.id === candidate)

  return exists ? candidate : defaultInvoiceTemplateId
}

export const getInvoiceTemplateMeta = value => {
  const templateId = resolveInvoiceTemplateId(value)

  return (
    invoiceTemplateCatalog.find(template => template.id === templateId) ||
    invoiceTemplateCatalog[0]
  )
}

