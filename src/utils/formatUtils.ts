/**
 * Formats a file size in bytes to a human-readable string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'] as const;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Formats dimensions into a string
 */
export const formatDimensions = (width: number, height: number): string => {
  return `${width}x${height}`;
};

/**
 * Calculates and formats compression percentage
 */
export const calculateCompressionPercentage = (
  originalSize: string,
  compressedSize: string
): string => {
  const getBytes = (sizeStr: string): number => {
    const [value, unit] = sizeStr.split(' ');
    const multipliers: Record<string, number> = {
      B: 1,
      KB: 1024,
      MB: 1024 * 1024,
      GB: 1024 * 1024 * 1024,
    };
    return parseFloat(value) * multipliers[unit];
  };

  const originalBytes = getBytes(originalSize);
  const compressedBytes = getBytes(compressedSize);
  return (((originalBytes - compressedBytes) / originalBytes) * 100).toFixed(2);
};
