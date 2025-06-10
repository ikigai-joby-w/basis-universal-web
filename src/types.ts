export type CompressionMode = 'etc1s' | 'uastc' | 'uastc_rdo' | 'hdr_4x4' | 'hdr_6x6' | 'hdr_6x6i';

export interface CompressionOptionsProps {
  mode: CompressionMode;
  onModeChange: (mode: CompressionMode) => void;
  options: {
    quality: number;
    rdoQuality: number;
    lambda: number;
    level: number;
  };
  onOptionsChange: (name: string, value: number) => void;
}

export interface ImageUploadProps {
  onImageSelect: (file: File) => void;
}

export interface MipmapGenerationProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export interface StatusMessageProps {
  message: string;
  type?: 'error' | 'success';
}

export interface ETC1SOptions {
  quality: number; // 1-255
}

export interface UASTCRDOOptions {
  rdoQuality: number; // 0.2-3.0
}

export interface HDR6x6Options {
  lambda: number; // 0-1000
  level: number; // 1-5
}

export interface CompressedFile {
  downloadUrl: string;
  filename: string;
  type: string;
  size: string;
}

export interface PreviewProps {
  originalFile: File | null;
  compressedFiles: CompressedFile[];
  originalSize: string;
}

export interface ImageDimensions {
  width: number;
  height: number;
}
