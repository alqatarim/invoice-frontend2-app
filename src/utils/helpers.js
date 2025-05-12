import dayjs from 'dayjs';

const DEFAULT_NUMBER_OPTIONS = {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
};


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



/**
 * Get the appropriate value from an item based on whether it's form-updated or original
 * @param {Object} item - The item object
 * @param {string} formKey - The form updated key
 * @param {string} originalKey - The original key
 * @returns {*} The appropriate value
 */
export const getItemValue = (item, formKey, originalKey) => {
  if (!item) return 0;
  return (item.isRateFormUpadted === true || item.isRateFormUpadted === "true") ? item[formKey] : item[originalKey];
};

// export function formatDiscount(item) {
//   if (!item) return { displayValue: '0.00', actualValue: '0.00' };

//   const discountType = (item.isRateFormUpadted === true || item.isRateFormUpadted === "true")
//     ? Number(item.form_updated_discounttype)
//     : Number(item.discountType);

//   const discountValue = item.isRateFormUpadted === "true"
//     ? Number(item.form_updated_discount)
//     : Number(item.discount);

//   const rate = Number(getItemValue(item, 'form_updated_rate', 'rate'));
//   const quantity = Number(item.quantity) || 0;
//   const totalRate = rate * quantity;

//   if (discountType === 2) { // Percentage discount
//     const actualDiscountValue = (totalRate * discountValue) / 100;
//     return {
//       displayValue: `${discountValue.toFixed(2)}%`,
//       actualValue: actualDiscountValue.toFixed(2)
//     };
//   }

//   // Fixed discount
//   return {
//     displayValue: discountValue.toFixed(2),
//     actualValue: discountValue.toFixed(2)
//   };
// }

export function formatDate(date) {
  // Format date as DD MMM YYYY
  const d = new Date(date);
  const day = `${d.getDate()}`.padStart(2, '0');
  const month = d.toLocaleString('default', { month: 'short' });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
};

/**
 * Format a number with locale options
 * @param {number|string} number - The number to format
 * @param {string} locale - The locale to use for formatting
 * @param {Object} options - Formatting options
 * @returns {string} - The formatted number
 */
export function formatNumberWithLocale(number, locale = 'en-US', options = DEFAULT_NUMBER_OPTIONS) {
  // Handle invalid values
  if (number === null || number === undefined || isNaN(Number(number))) {
    return '0.00';
  }

  // Convert to number if it's a string
  const numValue = typeof number === 'string' ? parseFloat(number) : number;

  // Format with proper decimal places
  return numValue.toLocaleString(locale, options);
}

/**
 * Format a number as currency with SAR suffix
 * @param {number|string} number - The number to format
 * @returns {string} - The formatted number with SAR suffix
 */
export function formatNumber(number) {
  return number == null || isNaN(Number(number))
    ? '0.00 SAR'
    : `${formatNumberWithLocale(number, 'en-US', DEFAULT_NUMBER_OPTIONS)} SAR`;
}

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



export function formatDateForInput(dateString) {
  return dateString ? dayjs(dateString).format('YYYY-MM-DD') : '';
}

export function parseDateForSubmission(dateString) {
  return dateString ? dayjs(dateString).toISOString() : null;
}

/**
 * Format a numeric value to two decimal places or '0.00' if invalid
 */
export function formatDecimal(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num.toFixed(2) : '0.00';
}

export function renderDiscountCell(item) {
  // Calculate the monetary discount value
  const { discount, discountValue, discountType } = sellCalculations.calculateItemValues(item);

  // Get the original discount percentage/value and type
  // const displayDiscount = getItemValue(item, 'discount', 'form_updated_discount');
  // const displayDiscountType = Number(getItemValue(item, 'form_updated_discounttype', 'discountType'));

  return {
    // For percentage discount, show the percentage
    // For fixed discount, show the fixed amount
    mainValue: discountType === 2
      ? `${Number(discountValue || 0).toFixed(2)}%`
      : Number(discountValue || 0).toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }),

    // For percentage discount, also show the calculated amount in SAR
    secondaryValue: discountType === 2
      ? Number(discount || 0).toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }) + ' SAR'
      : null
  };
}

/**
 * Process signature image into a File object for form submission
 * @param {string|Blob} signatureImage - The signature image (base64 string, URL, or Blob)
 * @param {string} [fileName='signature.png'] - The filename to use
 * @returns {Promise<File|null>} - A File object or null if processing failed
 */
export async function processSignatureImage(signatureImage, fileName = 'signature.png') {
  if (!signatureImage) return null;

  try {
    // Handle base64 image string
    if (typeof signatureImage === 'string' && signatureImage.startsWith('data:image')) {
      const blob = await dataURLtoBlob(signatureImage);
      return new File([blob], fileName, { type: 'image/png' });
    }
    // Handle image URL
    else if (typeof signatureImage === 'string' && signatureImage.startsWith('http')) {
      const response = await fetch(signatureImage);
      const blob = await response.blob();
      return new File([blob], fileName, { type: blob.type || 'image/png' });
    }
    // Handle if it's already a Blob
    else if (signatureImage instanceof Blob) {
      return new File([signatureImage], fileName, { type: signatureImage.type || 'image/png' });
    }

    return null;
  } catch (error) {
    console.error('Error processing signature image:', error);
    return null;
  }
}




export const sellCalculations = {
  /**
   * Calculate values for a single invoice item
   * @param {Object} item - The invoice item
   * @returns {Object} Calculated values for the item
   */
  calculateItemValues: (item) => {
    if (!item) return { rate: 0, discount: 0, tax: 0, amount: 0, taxableAmount: 0 };

console.log(item);

    const quantity = Number(item.quantity);

    const discountType = (item.isRateFormUpadted === true || item.isRateFormUpadted === "true")
      ? Number(item.form_updated_discounttype)
      : Number(item.discountType);

    const taxRate = (item.isRateFormUpadted === true || item.isRateFormUpadted === "true")
      ? Number(item.form_updated_tax)
      : Number(item.taxInfo.taxRate);

    // Calculate total rate (quantity * baseRate)
    const rate = Number((quantity * item.form_updated_rate).toFixed(2));


  let discountX;
    if (item.isRateFormUpadted === true || item.isRateFormUpadted === "true"){
          if ((item.discountType) === 2 || (item.discountType) === "2") { // Percentage discount
          discountX = Number((rate * (item.form_updated_discount / 100)).toFixed(2));
        } else{
           discountX = Number(Number(item.form_updated_discount).toFixed(2));

        }
     } else {
 discountX = Number(Number(item.discount).toFixed(2));
    }



    const taxableAmount = rate - discountX;
    const tax = (taxRate / 100) * taxableAmount;
    const amount = taxableAmount + tax;

    console.log(
      'ITEMS AFTER CALCULATION',
      'rate',      rate,
      'item.form_updated_rate',
      item.form_updated_rate,
      'discountX',
      discountX,
      'item.form_updated_discount',
      item.form_updated_discount,
      'discountType',
      discountType,
      'tax',
      tax,
      'amount',
      amount,
      taxableAmount,
      quantity);

    return {
      rate,
      baseRate: item.form_updated_rate,
      discount: discountX,
      form_updated_discount: Number(item.form_updated_discount),
      discountType:discountType,
      tax,
      amount,
      taxableAmount,
      quantity
    };
  },

  /**
   * Calculate totals across all invoice items
   * @param {Array} items - Array of invoice items
   * @returns {Object} Calculated totals
   */

  calculateTotals: (items) => {
    const initialTotals = {
      subTotal: 0,
      totalDiscount: 0,
      totalTax: 0,
      total: 0,
      taxableAmount: 0
    };

    if (!Array.isArray(items) || items.length === 0) {
      return initialTotals;
    }

    return items.reduce((acc, item) => {
      const { rate, discount, tax, amount, taxableAmount } =
        sellCalculations.calculateItemValues(item);

      return {
        subTotal: Number(acc.subTotal) + Number(rate),
        totalDiscount: Number(acc.totalDiscount) + Number(discount),
        totalTax: Number(acc.totalTax) + Number(tax),
        total: Number(acc.total) + Number(amount),
        taxableAmount: Number(acc.taxableAmount) + Number(taxableAmount)
      };
    }, initialTotals);
  },

  /**
   * Calculate invoice totals with rounding option
   * @param {Array} items - Array of invoice items
   * @param {Boolean} shouldRoundOff - Whether to round the total amount
   * @returns {Object} Calculated totals
   */


  calculateInvoiceTotals: (items, shouldRoundOff) => {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return {
        taxableAmount: 0,
        totalDiscount: 0,
        vat: 0,
        TotalAmount: 0,
        roundOffValue: 0,
      };
    }

    // Use reduce for a more concise calculation
    const { taxableAmount, totalDiscount, vat } = items.reduce(
      (acc, item) => {
        const { rate, discount, tax } = sellCalculations.calculateItemValues(item);







        return {
          taxableAmount: acc.taxableAmount + rate,
          totalDiscount: acc.totalDiscount + discount,
          vat: acc.vat + tax
        };
      },
      { taxableAmount: 0, totalDiscount: 0, vat: 0 }
    );

    let TotalAmount = taxableAmount - totalDiscount + vat;
    let roundOffValue = 0;

    if (shouldRoundOff) {
      roundOffValue = Math.round(TotalAmount) - TotalAmount;
      TotalAmount = Math.round(TotalAmount);
    }

    return {
      taxableAmount,
      totalDiscount,
      vat,
      TotalAmount,
      roundOffValue,
    };
  },

  /**
   * Format an invoice item for display
   * @param {Object} product - The product
   * @returns {Object} Formatted item with calculated values
   */
  formatInvoiceItem: (product) => {
    if (!product) return null;



    let discountX;
    if ((product.discountType) === 2 || (product.discountType) === "2") { // Percentage discount
      discountX = (Number(product.sellingPrice) * (Number(product.discountValue) / 100));
    } else { // Fixed discount
      discountX = (Number(product.discountValue)).toFixed(2);
    }

    // Calculate taxable amount and tax
    const taxableAmount = Number(product.sellingPrice) - discountX;
    const tax = (taxableAmount * ((product.tax?.taxRate || 0)) / 100);
    const amount = (taxableAmount + tax).toFixed(2);


    return {
      productId: product._id,
      name: product.name,
      quantity: 1,
      units: product.units?.name,
      unit: product.units?._id,
      rate: product.sellingPrice,
      discountType: product.discountType,
      discount: discountX,
      taxableAmount: Number(taxableAmount).toFixed(2),
      amount: Number(amount).toFixed(2),
      taxInfo: product.tax,
      tax: Number(tax).toFixed(2),


      // Form update tracking - initialize with original values
      isRateFormUpadted: false,
      form_updated_discounttype: product.discountType,
      form_updated_discount: Number(product.discountValue).toFixed(2),
      form_updated_rate: Number(product.sellingPrice).toFixed(2),
      form_updated_tax: Number(product.tax?.taxRate || 0).toFixed(2)
    };
  }
};



export const purchaseCalculations = {
  /**
   * Calculate values for a single purchase item
   * @param {Object} item - The purchase item
   * @returns {Object} Calculated values for the item
   */
  calculateItemValues: (item) => {
    if (!item) return { rate: 0, discount: 0, discountType: 2, tax: 0, amount: 0, taxableAmount: 0  };

    // Ensure all values are numbers
    const quantity = Number(item.quantity) || 0;
    const baseRate = (item.isRateFormUpadted === true || item.isRateFormUpadted === "true")
      ? Number(item.form_updated_rate)
      : Number(item.purchasePrice);
    const rate = quantity * baseRate;

    // Calculate discount
    const discountX = (item.isRateFormUpadted === true || item.isRateFormUpadted === "true")
      ? Number(item.form_updated_discount)
      : Number(item.discount);
    const discountType = (item.isRateFormUpadted === true || item.isRateFormUpadted === "true")
      ? Number(item.form_updated_discounttype)
      : Number(item.discountType);

    const discountValue = discountType === 2
      ? (rate * discountX / 100)
      : discountX;

    // Calculate tax based on amount after discount
    const taxableAmount = rate - discountValue;
    const taxRate = Number(item.taxInfo?.taxRate) || 0;
    const tax = (taxableAmount * taxRate) / 100;

    // Calculate final amount
    const amount = taxableAmount + tax;

    return {
      rate,
      discount: discountValue,
      tax,
      amount,
      taxableAmount
    };
  },

  /**
   * Calculate totals across all purchase items
   * @param {Array} items - Array of purchase items
   * @returns {Object} Calculated totals
   */
  calculateTotals: (items) => {
    const initialTotals = {
      subTotal: 0,
      totalDiscount: 0,
      vat: 0,
      total: 0,
      taxableAmount: 0
    };

    if (!Array.isArray(items) || items.length === 0) {
      return initialTotals;
    }

    return items.reduce((acc, item) => {
      const { rate, discountValue, tax, amount, taxableAmount } =
        purchaseCalculations.calculateItemValues(item);

      return {
        subTotal: Number(acc.subTotal) + Number(rate),
        totalDiscount: Number(acc.totalDiscount) + Number(discountValue),
        vat: Number(acc.vat) + Number(tax),
        total: Number(acc.total) + Number(amount),
        taxableAmount: Number(acc.taxableAmount) + Number(taxableAmount)
      };
    }, initialTotals);
  },

  /**
   * Format a purchase item for display
   * @param {Object} item - The purchase item
   * @returns {Object} Formatted item with calculated values
   */
  formatPurchaseItem: (product) => {
    if (!product) return null;

    return {
      key: Date.now(),
      name: product.name,
      productId: product._id,
      units: product.units?.name,
      unit: product.units?._id,
      quantity: 1,
      discountType: product.discountType || 3,
      discount: Number(product.discountValue || 0),
      purchasePrice: Number(product.purchasePrice || 0),
      rate: Number(product.purchasePrice || 0),
      taxInfo: product.tax || null,
      tax: product.tax ? Number(product.tax.taxRate || 0) : 0,
      isRateFormUpadted: false,
      form_updated_discounttype: product.discountType || 3,
      form_updated_discount: Number(product.discountValue || 0),
      form_updated_rate: Number(product.sellingPrice || 0),
      form_updated_tax: product.tax ? Number(product.tax.taxRate || 0) : 0
    };
  }
};