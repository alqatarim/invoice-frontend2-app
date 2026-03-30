import { amountFormat } from '@/utils/numberUtils';
import { toTitleCase } from '@/utils/string';

export { amountFormat, toTitleCase };

export function debounce(fn, wait = 300) {
  let timeoutId;

  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn(...args);
    }, wait);
  };
}
