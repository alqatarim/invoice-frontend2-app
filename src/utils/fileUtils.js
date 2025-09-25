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

export function isImageFile(url) {
  if (!url || typeof url !== 'string') return false;
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
};

export function getFileName(url) {
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

/**
 * Validate profile image dimensions and file type
 * @param {File} file - The image file to validate
 * @returns {Promise<Object>} - { isValid: boolean, error: string, preview: string }
 */
export const validateProfileImage = async (file) => {
  if (!file) {
    return { isValid: false, error: 'No file provided', preview: null };
  }

  // Check file type
  if (!/\.(jpe?g|png)$/i.test(file.name)) {
    return {
      isValid: false,
      error: 'Only PNG, JPG, and JPEG file types are supported.',
      preview: null
    };
  }

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      const img = new Image();

      img.onload = () => {
        if (
          (img.width === 150 && img.height === 150) ||
          (img.width >= 150 && img.height >= 150)
        ) {
          resolve({
            isValid: true,
            error: '',
            preview: reader.result
          });
        } else {
          resolve({
            isValid: false,
            error: 'Profile Pic should be minimum 150 * 150',
            preview: null
          });
        }
      };

      img.onerror = () => {
        resolve({
          isValid: false,
          error: 'Only PNG, JPG, and JPEG file types are supported.',
          preview: null
        });
      };

      img.src = reader.result;
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Validate product image file type and size
 * @param {File} file - The image file to validate
 * @returns {Promise<Object>} - { isValid: boolean, error: string, preview: string }
 */
export const validateProductImage = async (file) => {
  if (!file) {
    return { isValid: false, error: 'No file provided', preview: null };
  }

  // Check file type
  if (!/\.(jpe?g|png|gif|webp)$/i.test(file.name)) {
    return {
      isValid: false,
      error: 'Only PNG, JPG, JPEG, GIF, and WEBP file types are supported.',
      preview: null
    };
  }

  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size must be less than 5MB.',
      preview: null
    };
  }

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      const img = new Image();

      img.onload = () => {
        // For products, we're more flexible with dimensions
        if (img.width >= 100 && img.height >= 100) {
          resolve({
            isValid: true,
            error: '',
            preview: reader.result
          });
        } else {
          resolve({
            isValid: false,
            error: 'Product image should be minimum 100 x 100 pixels',
            preview: null
          });
        }
      };

      img.onerror = () => {
        resolve({
          isValid: false,
          error: 'Invalid image file.',
          preview: null
        });
      };

      img.src = reader.result;
    };

    reader.onerror = () => {
      resolve({
        isValid: false,
        error: 'Failed to read file.',
        preview: null
      });
    };

    reader.readAsDataURL(file);
  });
};



/**
 * Validate expense attachment file type and size
 * @param {File} file - The attachment file to validate
 * @returns {Promise<Object>} - { isValid: boolean, error: string, preview: string }
 */
export const validateExpenseAttachment = async (file) => {
  if (!file) {
    return { isValid: false, error: 'No file provided', preview: null };
  }

  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size must be less than 5MB.',
      preview: null
    };
  }

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      resolve({
        isValid: true,
        error: '',
        preview: reader.result
      });
    };

    reader.onerror = () => {
      resolve({
        isValid: false,
        error: 'Failed to read file.',
        preview: null
      });
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Validate payment attachment file type and size
 * @param {File} file - The attachment file to validate
 * @returns {Promise<Object>} - { isValid: boolean, error: string, preview: string }
 */
export const validatePaymentAttachment = async (file) => {
  if (!file) {
    return { isValid: false, error: 'No file provided', preview: null };
  }

  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size must be less than 5MB.',
      preview: null
    };
  }

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      resolve({
        isValid: true,
        error: '',
        preview: reader.result
      });
    };

    reader.onerror = () => {
      resolve({
        isValid: false,
        error: 'Failed to read file.',
        preview: null
      });
    };

    reader.readAsDataURL(file);
  });
};

export const getNameFromPath = (imageSource, selectedFile) => {
  if (selectedFile) {
    return selectedFile.name;
  }

  if (typeof imageSource === 'string') {
    // Handle URLs, local paths, and mixed formats
    let pathToProcess = imageSource;

    // If it's a full URL, extract the pathname
    try {
      if (imageSource.startsWith('http://') || imageSource.startsWith('https://')) {
        const url = new URL(imageSource);
        pathToProcess = url.pathname;
      }
    } catch (e) {
      // Not a valid URL, continue with original string
      pathToProcess = imageSource;
    }

    // Handle both forward slashes and backslashes
    const urlParts = pathToProcess.split(/[\/\\]/);
    const filename = urlParts[urlParts.length - 1];

    // Remove query parameters if present
    const cleanFilename = filename.split('?')[0];

    // If it's a long filename, truncate it
    if (cleanFilename.length > 30) {
      const extension = cleanFilename.split('.').pop();
      const name = cleanFilename.substring(0, 25);
      return `${name}...${extension ? `.${extension}` : ''}`;
    }

    return cleanFilename || 'attachment';
  }

  return 'attachment';
};


