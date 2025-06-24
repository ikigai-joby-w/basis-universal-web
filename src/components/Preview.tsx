import React, { useEffect, useRef, useState } from 'react';
import { API_URL } from '../config';
import { FILE_TYPE_LABELS, HDR_MODES, UI_MESSAGES } from '../constants';
import { CompressionMode } from '../types';
import { calculateCompressionPercentage } from '../utils/formatUtils';
import { BasisViewer } from './BasisViewer';
import { ImageViewer } from './ImageViewer';
import { KTX2Viewer } from './KTX2Viewer';

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
        <div>
          {originalPreviewUrl && (
            <>
              {renderedDimensions ? (
                <ImageViewer
                  url={originalPreviewUrl}
                  width={renderedDimensions?.width || 100}
                  height={renderedDimensions?.height || 100}
                />
              ) : (
                <div className="preview">
                  <img
                    style={{
                      position: 'absolute',
                      zIndex: -1,
                    }}
                    ref={imgRef}
                    src={originalPreviewUrl}
                    alt="Original"
                  />
                </div>
              )}
            </>
          )}
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
              <div>
                {renderedDimensions &&
                  (file.type === 'ktx2' ? (
                    <KTX2Viewer
                      url={file.downloadUrl}
                      width={renderedDimensions.width}
                      height={renderedDimensions.height}
                    />
                  ) : file.type === 'basis' ? (
                    <BasisViewer
                      url={file.downloadUrl}
                      width={renderedDimensions.width}
                      height={renderedDimensions.height}
                    />
                  ) : (
                    <ImageViewer
                      url={file.downloadUrl}
                      width={renderedDimensions.width}
                      height={renderedDimensions.height}
                    />
                  ))}
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
