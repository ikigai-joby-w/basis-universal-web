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
