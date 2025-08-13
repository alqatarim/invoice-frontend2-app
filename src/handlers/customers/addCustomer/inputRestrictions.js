/**
 * Input restriction handlers for form fields
 * Matching the old app's input restrictions
 */

// Handle character restriction (only letters and spaces)
export const handleCharacterRestrictionSpace = (e) => {
  const char = String.fromCharCode(e.which || e.keyCode);
  const regex = /^[a-zA-Z\s]*$/;
  if (!regex.test(char)) {
    e.preventDefault();
  }
};

// Handle number restriction (only numbers)
export const handleNumberRestriction = (e) => {
  const char = String.fromCharCode(e.which || e.keyCode);
  const regex = /^[0-9]*$/;
  if (!regex.test(char)) {
    e.preventDefault();
  }
};

// Handle special character and space restriction
export const handleSpecialCharacterSpaceRestriction = (e) => {
  const char = String.fromCharCode(e.which || e.keyCode);
  const regex = /^[a-zA-Z0-9\s]*$/;
  if (!regex.test(char)) {
    e.preventDefault();
  }
};

// Handle key down events (for preventing certain keys)
export const handleKeyDown = (e) => {
  // Prevent 'e', 'E', '+', '-' in number fields
  if (['e', 'E', '+', '-'].includes(e.key)) {
    e.preventDefault();
  }
};

// Phone number formatter
export const formatPhoneNumber = (value) => {
  // Remove all non-digit characters
  const cleaned = value.replace(/\D/g, '');
  return cleaned.slice(0, 15); // Max 15 digits
};
