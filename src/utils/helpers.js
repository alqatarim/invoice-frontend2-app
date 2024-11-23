// export function dataURLtoBlob(dataURL) {
//   const arr = dataURL.split(',');
//   const mime = arr[0].match(/:(.*?);/)[1];
//   const bstr = atob(arr[1]);
//   let n = bstr.length;
//   const u8arr = new Uint8Array(n);
//   while (n--) {
//     u8arr[n] = bstr.charCodeAt(n);
//   }
//   return new Blob([u8arr], { type: mime });
// }



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
