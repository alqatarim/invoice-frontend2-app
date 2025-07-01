export const handleKeyPress = (event) => {
  const keyCode = event.keyCode || event.which;
  const keyValue = String.fromCharCode(keyCode);
  if (/^\d+$/.test(keyValue)) {
    event.preventDefault();
  }
};

/**
 * Prevent numeric input (for name fields)
 * @param {Event} event - The keyboard event
 */
export const handleCharacterRestriction = (event) => {
  const keyCode = event.keyCode || event.which;
  const keyValue = String.fromCharCode(keyCode);
  if (/^\d+$/.test(keyValue)) {
    event.preventDefault();
  }
};

/**
 * Allow only numbers and + sign (for phone fields)
 * @param {Event} event - The keyboard event
 */
export const handleNumberRestriction = (event) => {
  const keyCode = event.keyCode || event.which;
  const keyValue = String.fromCharCode(keyCode);
  if (!/^\d+$/.test(keyValue) && keyValue !== '+') {
    event.preventDefault();
  }
};

/**
 * Prevent all numeric input except + sign for phone numbers
 * @param {Event} event - The keyboard event
 */
export const handlePhoneKeyPress = (event) => {
  const keyCode = event.keyCode || event.which;
  const keyValue = String.fromCharCode(keyCode);
  if (!/^\d+$/.test(keyValue) && keyValue !== '+') {
    event.preventDefault();
  }
};