import { SUPPORTED_FORMATS, MAX_FILE_SIZE } from './constants';

/**
 * Validates a file for image upload
 */
export const validateImageFile = (file: File): string | null => {
  if (!SUPPORTED_FORMATS.includes(file.type as (typeof SUPPORTED_FORMATS)[number])) {
    return 'Unsupported file format. Please use PNG, JPG, or GIF.';
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'File is too large. Maximum size is 50MB.';
  }
  return null;
};

/**
 * Validates compression options based on mode
 */
export const validateCompressionOptions = (
  value: number,
  min: number,
  max: number,
  step?: number
): boolean => {
  if (value < min || value > max) return false;
  if (step && value % step !== 0) return false;
  return true;
};

/**
 * Gets image dimensions from a File object
 */
export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
};
