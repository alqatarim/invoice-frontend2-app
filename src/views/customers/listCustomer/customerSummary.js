const toNumber = value => {
  if (value === null || value === undefined || value === '') return 0
  const parsed = Number(String(value).replace(/,/g, '').trim())

  return Number.isFinite(parsed) ? parsed : 0
}

export const getDefaultCustomerSummary = () => ({
  totalCustomers: 0,
  paidCustomers: 0,
  outstandingCustomers: 0,
  dueCustomers: 0,
})

export const buildFallbackCustomerSummary = (customers = []) => {
  const safeCustomers = Array.isArray(customers) ? customers : []

  return safeCustomers.reduce((summary, customer) => {
    const totalInvoiced = toNumber(customer?.totalInvoiced)
    const balance = toNumber(customer?.balance)
    const paidAmount = Math.max(totalInvoiced - balance, 0)

    summary.totalCustomers += 1

    if (totalInvoiced <= 0) {
      return summary
    }

    if (balance <= 0) {
      summary.paidCustomers += 1
    } else if (paidAmount <= 0) {
      summary.dueCustomers += 1
    } else {
      summary.outstandingCustomers += 1
    }

    return summary
  }, getDefaultCustomerSummary())
}
