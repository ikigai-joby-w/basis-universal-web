/**
 * Creates a URL for a file object
 */
export const createObjectURL = (file: File): string => {
  return URL.createObjectURL(file);
};

/**
 * Revokes a previously created object URL
 */
export const revokeObjectURL = (url: string): void => {
  URL.revokeObjectURL(url);
};

/**
 * Extracts file extension from filename
 */
export const getFileExtension = (filename: string): string => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};

/**
 * Changes file extension
 */
export const changeFileExtension = (filename: string, newExtension: string): string => {
  const base = filename.substring(0, filename.lastIndexOf('.'));
  return `${base}.${newExtension}`;
};

/**
 * Creates a new File object with a different extension
 */
export const createFileWithNewExtension = (
  originalFile: File,
  newExtension: string,
  type: string
): File => {
  return new File([originalFile], changeFileExtension(originalFile.name, newExtension), { type });
};
