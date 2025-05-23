export const ensurePrefix = (str, prefix) => (str.startsWith(prefix) ? str : `${prefix}${str}`)
export const withoutSuffix = (str, suffix) => (str.endsWith(suffix) ? str.slice(0, -suffix.length) : str)
export const withoutPrefix = (str, prefix) => (str.startsWith(prefix) ? str.slice(prefix.length) : str)
export const getInitials = string => string.split(/\s/).reduce((response, word) => (response += word.slice(0, 1)), '')
export const toTitleCase = (str) => {
  if (typeof str !== 'string' || str.trim() === '') {
    return str;
  }
  return str.toLowerCase().replace(/(?:^|\s)\w/g, function(match) {
    return match.toUpperCase();
  });
};

export const convertFirstLetterToCapital = (str) => {
  if (typeof str !== 'string') return '';
  return str
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
};