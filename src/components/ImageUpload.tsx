import React, { useCallback, useRef, useState } from 'react';
import { UI_MESSAGES } from '../constants';
import { ImageUploadProps } from '../types';
import { getImageDimensions, padImageToMultipleOfFour, validateImageFile } from '../utils';

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [resizeInfo, setResizeInfo] = useState<{ original: string; new: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(
    async (files: FileList) => {
      setError(null);
      if (files.length > 0) {
        const file = files[0];

        const validationError = validateImageFile(file);
        if (validationError) {
          setError(validationError);
          return;
        }

        try {
          const dimensions = await getImageDimensions(file);
          const result = await padImageToMultipleOfFour(file);

          if (result.file !== file) {
            setResizeInfo({
              original: `${dimensions.width}x${dimensions.height}`,
              new: `${result.width}x${result.height}`,
            });
          } else {
            setResizeInfo({
              original: `${dimensions.width}x${dimensions.height}`,
              new: `${dimensions.width}x${dimensions.height}`,
            });
          }

          onImageSelect(result.file);
        } catch (error) {
          console.error('Error processing image:', error);
          setError(UI_MESSAGES.processingError);
        }
      }
    },
    [onImageSelect]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        await handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      if (e.target.files) {
        await handleFiles(e.target.files);
      }
    },
    [handleFiles]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="upload-container">
      <div
        className={`upload-area ${dragActive ? 'drag-active' : ''}`}
        onClick={handleClick}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        aria-label="Upload image area"
        onKeyPress={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleClick();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp"
          onChange={handleChange}
          style={{ display: 'none' }}
          aria-label="File input"
        />
        <p>{UI_MESSAGES.dragAndDrop}</p>
        <p className="supported-formats">{UI_MESSAGES.supportedFormats}</p>
      </div>

      {error && (
        <div className="error-notice" role="alert">
          {error}
        </div>
      )}

      {resizeInfo && !error && (
        <div className="resize-notice" role="status">
          {UI_MESSAGES.dimensionsAdjusted}:<br />
          {resizeInfo.new === resizeInfo.original
            ? `${resizeInfo.original} (no change)`
            : `${resizeInfo.original} → ${resizeInfo.new} (transparent padding added)`}
        </div>
      )}
    </div>
  );
};

export const MemoizedImageUpload = React.memo(ImageUpload);
export { MemoizedImageUpload as ImageUpload };
