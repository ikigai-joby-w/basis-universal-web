import React, { useEffect, useState, useRef } from 'react';
import { API_URL } from '../config';
import { KTX2Viewer } from './KTX2Viewer';
import { CompressionMode } from '../types';
import { calculateCompressionPercentage, HDR_MODES, UI_MESSAGES, FILE_TYPE_LABELS } from '../utils';

interface PreviewProps {
  originalFile: File | null;
  compressedFiles: Array<{
    downloadUrl: string;
    filename: string;
    type: string;
    size: string;
  }>;
  originalSize: string;
  compressionMode: CompressionMode;
}

interface ImageDimensions {
  width: number;
  height: number;
}

export const Preview: React.FC<PreviewProps> = ({
  originalFile,
  compressedFiles,
  originalSize,
  compressionMode,
}) => {
  const [renderedDimensions, setRenderedDimensions] = useState<ImageDimensions | null>(null);
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);

  const isHDRMode = HDR_MODES.includes(compressionMode as (typeof HDR_MODES)[number]);

  useEffect(() => {
    if (originalFile) {
      // Create preview URL for original image
      const url = URL.createObjectURL(originalFile);
      setOriginalPreviewUrl(url);

      // Get original image dimensions
      const img = new Image();
      img.src = url;

      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [originalFile]);

  // Get rendered dimensions when image loads
  useEffect(() => {
    const updateRenderedDimensions = () => {
      if (imgRef.current) {
        const { clientWidth, clientHeight } = imgRef.current;
        setRenderedDimensions({
          width: clientWidth,
          height: clientHeight,
        });
      }
    };

    // Update dimensions on load
    if (imgRef.current) {
      imgRef.current.onload = updateRenderedDimensions;
    }

    // Also update dimensions if window resizes
    window.addEventListener('resize', updateRenderedDimensions);

    return () => {
      window.removeEventListener('resize', updateRenderedDimensions);
    };
  }, [originalPreviewUrl]);

  return (
    <div className="preview-container">
      {/* Original Image Preview */}
      <div className="preview-box">
        <h3>Original {FILE_TYPE_LABELS.png}</h3>
        <div className="preview">
          {originalPreviewUrl && <img ref={imgRef} src={originalPreviewUrl} alt="Original" />}
        </div>
        <div className="info">
          <div className="size">Size: {originalSize}</div>
        </div>
      </div>

      {/* Compressed Files Preview */}
      {compressedFiles.map((file, index) => (
        <div key={index} className="preview-box">
          <h3>{FILE_TYPE_LABELS[file.type as keyof typeof FILE_TYPE_LABELS]} Preview</h3>
          {isHDRMode ? (
            <div className="info">
              <div className="hdr-notice">{UI_MESSAGES.hdrPreviewUnavailable}</div>
              <div className="size">Compressed Size: {file.size}</div>
              <div className="percentage">
                Compression Percentage: {calculateCompressionPercentage(originalSize, file.size)}%
              </div>
              <a
                href={`${API_URL}${file.downloadUrl}`}
                download={originalFile?.name.split('.')[0] + '.' + file.type}
                className="download-btn"
              >
                Download {FILE_TYPE_LABELS[file.type as keyof typeof FILE_TYPE_LABELS]}
              </a>
            </div>
          ) : (
            <>
              <div className="preview">
                {file.type === 'ktx2' && renderedDimensions ? (
                  <KTX2Viewer
                    url={`${API_URL}${file.downloadUrl}`}
                    width={renderedDimensions.width}
                    height={renderedDimensions.height}
                  />
                ) : (
                  <img src={`${API_URL}${file.downloadUrl}`} alt={`Compressed ${file.type}`} />
                )}
              </div>
              <div className="info">
                <div className="size">Compressed Size: {file.size}</div>
                <div className="percentage">
                  Compression Percentage: {calculateCompressionPercentage(originalSize, file.size)}%
                </div>
                <a
                  href={`${API_URL}${file.downloadUrl}`}
                  download={originalFile?.name.split('.')[0] + '.' + file.type}
                  className="download-btn"
                >
                  Download {FILE_TYPE_LABELS[file.type as keyof typeof FILE_TYPE_LABELS]}
                </a>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};
