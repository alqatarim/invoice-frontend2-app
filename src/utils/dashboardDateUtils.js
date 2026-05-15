'use client';

import dayjs from 'dayjs';

export const normalizeDateValue = (value = '') => {
	const rawValue = String(value || '').trim();

	if (!rawValue) return '';

	const parsed = dayjs(rawValue);

	return parsed.isValid() ? parsed.format('YYYY-MM-DD') : '';
};

export const formatDateRangeLabel = (fromDate = '', toDate = '') => {
	const start = dayjs(fromDate);
	const end = dayjs(toDate);

	if (!start.isValid() || !end.isValid()) return 'All Time';

	return `${start.format('DD MMM YYYY')} - ${end.format('DD MMM YYYY')}`;
};
