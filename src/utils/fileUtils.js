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