export const dataURLtoBlob = (dataURL) => {
  const byteString = atob(dataURL.split(',')[1]);
  const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const uintArray = new Uint8Array(arrayBuffer);

  for (let i = 0; i < byteString.length; i++) {
    uintArray[i] = byteString.charCodeAt(i);
  }

  return new Blob([arrayBuffer], { type: mimeString });
};

  export function isImageFile (url)  {
    if (!url || typeof url !== 'string') return false;
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  };

  export function getFileName (url)  {
    if (!url || typeof url !== 'string') return '';
    return url.split('/').pop() || '';
  };

export function blobToObject(blob) {
  return {
    type: blob.type,
    size: blob.size,
    dataURL: URL.createObjectURL(blob)
  };
}

export function objectToBlob(obj) {
  if (!obj || !obj.dataURL) {
    throw new Error('Invalid object or dataURL');
  }
  return fetch(obj.dataURL).then(res => res.blob());
}

export const calculateItemValues = (item) => {
  const rate = Number(item.rate);
  const discount = item.discountType === '2' ? (item.rate * (item.discount / 100)) : Number(item.discount);
  const taxable = (rate * item.quantity) - discount;
  const tax = (taxable * (item.taxRate / 100)).toFixed(2);
  const amount = (taxable + Number(tax)).toFixed(2);
  return { rate, discount, tax, amount };
};

export const calculateTotals = (items, roundOff) => {
  const taxableAmount = items.reduce((acc, item) => acc + (Number(item.rate) * Number(item.quantity)), 0);
  const totalDiscount = items.reduce((acc, item) => acc + Number(item.discount), 0);
  const totalTax = items.reduce((acc, item) => acc + Number(item.tax), 0);
  const subtotal = taxableAmount - totalDiscount + totalTax;
  const roundOffValue = roundOff ? Math.round(subtotal) - subtotal : 0;
  const totalAmount = subtotal + roundOffValue;
  return { taxableAmount, totalDiscount, totalTax, totalAmount, roundOffValue };
};

export const formatDateForInput = (date) => {
  // Format date as YYYY-MM-DD for input[type="date"]
  const d = new Date(date);
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  const year = d.getFullYear();
  return [year, month, day].join('-');
};

export const fileToBase64Object = async (file) => {
  if (!file) return null;

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve({
      name: file.name,
      type: file.type,
      size: file.size,
      base64: reader.result
    });
    reader.readAsDataURL(file);
  });
};
