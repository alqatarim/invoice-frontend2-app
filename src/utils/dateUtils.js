import dayjs from 'dayjs';

export function formatDate(date) {
  // Handle null/undefined dates
  if (!date) return 'N/A';
  
  // If the date is already in DD-MM-YYYY format from backend, parse it correctly
  if (typeof date === 'string' && /^\d{2}-\d{2}-\d{4}$/.test(date)) {
    // Backend sends "DD-MM-YYYY" format, convert to display format
    const [day, month, year] = date.split('-');
    const dateObj = new Date(year, month - 1, day); // month is 0-indexed
    const monthName = dateObj.toLocaleString('default', { month: 'short' });
    return `${day} ${monthName} ${year}`;
  }
  
  // Fallback for other date formats (ISO strings, Date objects, etc.)
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';
  
  const day = `${d.getDate()}`.padStart(2, '0');
  const month = d.toLocaleString('default', { month: 'short' });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
};

export function formatDateForInput(dateString) {
  return dateString ? dayjs(dateString).format('YYYY-MM-DD') : '';
}

export function parseDateForSubmission(dateString) {
  return dateString ? dayjs(dateString).toISOString() : null;
}