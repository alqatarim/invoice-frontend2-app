export const handleKeyPress = (event) => {
  const keyCode = event.keyCode || event.which;
  const keyValue = String.fromCharCode(keyCode);
  if (/^\d+$/.test(keyValue)) {
    event.preventDefault();
  }
};