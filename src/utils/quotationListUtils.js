import moment from 'moment';
import { quotationConvertAllowedStatuses, quotationStatusValues } from '@/data/dataSets';

export function getQuotationConvertEligibility(quotation) {
  if (quotation?.status === quotationStatusValues.CONVERTED) {
    return { canConvert: false, reason: 'Already converted' };
  }

  if (quotation?.status === quotationStatusValues.EXPIRED) {
    return { canConvert: false, reason: 'Quotation expired' };
  }

  if (quotation?.due_date && moment(quotation.due_date).isBefore(moment(), 'day')) {
    return { canConvert: false, reason: 'Quotation expired' };
  }

  if (quotation?.status && !quotationConvertAllowedStatuses.includes(quotation.status)) {
    return { canConvert: false, reason: 'Invalid status' };
  }

  return { canConvert: true, reason: null };
}
