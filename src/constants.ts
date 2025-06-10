/**
 * Compression Mode Constants
 * ------------------------
 */

/**
 * Compression mode descriptions for each supported format
 */
export const MODE_DESCRIPTIONS = {
  etc1s:
    'ETC1S: Suitable for general web images, supports transparency, smaller file size but lower quality.',
  uastc: 'UASTC LDR: High quality mode, suitable for scenes requiring the best visual effect.',
  uastc_rdo: 'UASTC LDR RDO: High quality mode, optimized size through extra processing.',
  hdr_4x4: 'UASTC HDR 4x4: High quality HDR mode, supports HDR displays.',
  hdr_6x6: 'UASTC HDR 6x6: HDR mode with smaller files, 3.56 bits/pixel.',
  hdr_6x6i: 'GPU Photo: Special intermediate format, can quickly convert to other HDR formats.',
} as const;

/**
 * HDR mode types for type checking and validation
 */
export const HDR_MODES = ['hdr_4x4', 'hdr_6x6', 'hdr_6x6i'] as const;

/**
 * Default compression options for each mode
 */
export const DEFAULT_COMPRESSION_OPTIONS = {
  quality: 128,
  rdoQuality: 1.0,
  lambda: 500,
  level: 3,
} as const;

/**
 * Compression option constraints and validation ranges
 */
export const OPTION_CONSTRAINTS = {
  quality: { min: 1, max: 255 },
  rdoQuality: { min: 0.2, max: 3.0, step: 0.1 },
  lambda: { min: 0, max: 1000 },
  level: { min: 1, max: 5 },
} as const;

/**
 * File Handling Constants
 * ----------------------
 */

/**
 * Supported file formats for image upload
 */
export const SUPPORTED_FORMATS = ['image/png', 'image/jpeg', 'image/gif'] as const;

/**
 * Maximum file size for uploads (50MB)
 */
export const MAX_FILE_SIZE = 50 * 1000 * 1000;

/**
 * File type labels for UI display
 */
export const FILE_TYPE_LABELS = {
  ktx2: 'KTX2',
  png: 'PNG',
  jpeg: 'JPEG',
  gif: 'GIF',
} as const;

/**
 * UI Constants
 * -----------
 */

/**
 * Common UI messages and text content
 */
export const UI_MESSAGES = {
  dragAndDrop: 'Drag and drop your image here or click to select',
  supportedFormats: 'Supported formats: PNG, JPG, JPEG, GIF (max 50MB)',
  hdrPreviewUnavailable: 'HDR preview not available in web browser',
  processingError: 'Failed to process image. Please try another file.',
  dimensionsAdjusted: 'Image dimensions have been adjusted to multiples of 4',
} as const;

/**
 * Renderer Constants
 * -----------------
 */

/**
 * Default PIXI.js renderer options
 */
export const DEFAULT_RENDERER_OPTIONS = {
  backgroundColor: 0x000000,
  backgroundAlpha: 1,
  antialias: true,
  resolution: window.devicePixelRatio || 1,
  autoDensity: true,
  clearBeforeRender: true,
  preserveDrawingBuffer: true,
} as const;
