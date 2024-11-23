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

export const amountFormat = (amount) => {
  if (isNaN(amount)) return '0.00';
  return Number(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
  });
};

export const sortbyINVnumberDESC = (array) => {
  if(array?.length > 0){
    array.sort((a, b) => {
      if (a.invoiceNumber < b.invoiceNumber) {
          return 1;
      }
      if (a.invoiceNumber > b.invoiceNumber) {
          return -1;
      }
      return 0;
  });
  return array;
  }else{
    return [];
  }
}

export const handleKeyPress = (event) => {
  const keyCode = event.keyCode || event.which;
  const keyValue = String.fromCharCode(keyCode);
  if (/^\d+$/.test(keyValue)) {
    event.preventDefault();
  }
};

export function debounce(func, timeout = 300){
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}

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



