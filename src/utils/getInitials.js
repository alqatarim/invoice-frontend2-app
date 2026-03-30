/**
 * Returns the initials of a given string.
 * @param {string} string
 * @param {string} fallback
 */
export const getInitials = (string, fallback = 'U') => {
  const words = String(string || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return fallback;

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
};