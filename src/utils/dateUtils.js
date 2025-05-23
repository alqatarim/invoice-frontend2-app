import dayjs from 'dayjs';

export function formatDate(date) {
  const d = new Date(date);
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