/**
 * Image processing utility functions for texture memory calculation and image manipulation
 */

// Define texture format constants
const TEXTURE_FORMATS = {
  RGBA: 6408,
  RGB: 6407,
  ALPHA: 6406,
  LUMINANCE: 6409,
  LUMINANCE_ALPHA: 6410,
} as const;

type TextureFormat = (typeof TEXTURE_FORMATS)[keyof typeof TEXTURE_FORMATS];

/**
 * Pads an image to dimensions that are multiples of 4 (required for Basis compression)
 * @param file - The image file to pad
 * @returns Promise resolving to padded file and new dimensions
 */
export const padImageToMultipleOfFour = async (
  file: File
): Promise<{ file: File; width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = e => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      const originalWidth = img.width;
      const originalHeight = img.height;

      // Calculate new dimensions (next multiple of 4)
      const newWidth = Math.ceil(originalWidth / 4) * 4;
      const newHeight = Math.ceil(originalHeight / 4) * 4;

      // If dimensions are already multiples of 4, return original file
      if (newWidth === originalWidth && newHeight === originalHeight) {
        resolve({ file, width: originalWidth, height: originalHeight });
        return;
      }

      // Create canvas with new dimensions
      const canvas = document.createElement('canvas');
      canvas.width = newWidth;
      canvas.height = newHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Make canvas transparent
      ctx.clearRect(0, 0, newWidth, newHeight);

      // Draw original image at top-left corner (0,0)
      ctx.drawImage(img, 0, 0);

      // Convert canvas to blob
      canvas.toBlob(blob => {
        if (!blob) {
          reject(new Error('Could not convert canvas to blob'));
          return;
        }

        // Create new file with same name but .png extension
        const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.png'), {
          type: 'image/png',
        });

        resolve({
          file: newFile,
          width: newWidth,
          height: newHeight,
        });
      }, 'image/png');
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Calculate texture memory usage based on texture dimensions and format
 * @param texture - The PIXI texture to analyze
 * @returns Estimated memory usage in bytes
 */
export const calculateTextureMemory = (texture: any): number => {
  if (!texture.source) return 0;

  const { width, height } = texture.source;
  const format = Number(texture.source.format) as TextureFormat;

  // Estimate memory usage based on format
  let bytesPerPixel = 4; // Default to RGBA
  switch (format) {
    case TEXTURE_FORMATS.RGBA:
      bytesPerPixel = 4;
      break;
    case TEXTURE_FORMATS.RGB:
      bytesPerPixel = 3;
      break;
    case TEXTURE_FORMATS.ALPHA:
      bytesPerPixel = 1;
      break;
    case TEXTURE_FORMATS.LUMINANCE:
      bytesPerPixel = 1;
      break;
    case TEXTURE_FORMATS.LUMINANCE_ALPHA:
      bytesPerPixel = 2;
      break;
    // Add more format cases as needed
  }

  return width * height * bytesPerPixel;
};

/**
 * Export texture format constants for use in components
 */
export { TEXTURE_FORMATS };
export type { TextureFormat };
