/**
 * Validation utility functions for file validation, compression options, and image processing
 */

import { MAX_FILE_SIZE, SUPPORTED_FORMATS } from '../constants';

/**
 * Validates a file for image upload
 * @param file - The file to validate
 * @returns Error message string or null if valid
 */
export const validateImageFile = (file: File): string | null => {
  if (!SUPPORTED_FORMATS.includes(file.type as (typeof SUPPORTED_FORMATS)[number])) {
    return 'Unsupported file format. Please use PNG, JPG, WebP, or GIF.';
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'File is too large. Maximum size is 50MB.';
  }
  return null;
};

/**
 * Validates compression options based on mode
 * @param value - The value to validate
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @param step - Optional step increment
 * @returns True if valid, false otherwise
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
 * @param file - The image file to analyze
 * @returns Promise resolving to width and height
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
