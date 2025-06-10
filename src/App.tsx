import 'pixi.js/ktx2';
import { useState } from 'react';
import {
  CompressionOptions,
  ImageUpload,
  MipmapGeneration,
  Preview,
  StatusMessage,
} from './components';
import { API_URL } from './config';
import './style.css';
import { CompressionMode } from './types';

function App() {
  const [compressionMode, setCompressionMode] = useState<CompressionMode>('etc1s');
  const [status, setStatus] = useState<{ message: string; type?: 'error' | 'success' }>({
    message: '',
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [generateMipmaps, setGenerateMipmaps] = useState(false);
  const [compressedFiles, setCompressedFiles] = useState<
    Array<{ downloadUrl: string; filename: string; type: string; size: string }>
  >([]);
  const [originalSize, setOriginalSize] = useState<string>('');
  const [compressionOptions, setCompressionOptions] = useState({
    quality: 128,
    rdoQuality: 1.0,
    lambda: 500,
    level: 3,
  });

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    setStatus({ message: '' });
    setCompressedFiles([]);
    setOriginalSize(formatFileSize(file.size));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleCompressionModeChange = (mode: CompressionMode) => {
    setCompressionMode(mode);
  };

  const handleOptionsChange = (name: string, value: number) => {
    setCompressionOptions(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProcessImage = async () => {
    if (!selectedImage) {
      setStatus({ message: 'Please select an image first', type: 'error' });
      return;
    }

    setStatus({ message: 'Processing...', type: 'success' });

    const formData = new FormData();
    formData.append('name', selectedImage.name.split('.')[0]);
    formData.append('image', selectedImage);
    formData.append('mode', compressionMode);
    formData.append('generateMipmaps', generateMipmaps.toString());

    // Add compression options based on mode
    switch (compressionMode) {
      case 'etc1s':
        formData.append('quality', compressionOptions.quality.toString());
        break;
      case 'uastc_rdo':
        formData.append('rdoQuality', compressionOptions.rdoQuality.toString());
        break;
      case 'hdr_6x6':
      case 'hdr_6x6i':
        formData.append('lambda', compressionOptions.lambda.toString());
        formData.append('level', compressionOptions.level.toString());
        break;
    }

    try {
      const response = await fetch(`${API_URL}/compress`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process image');
      }

      setCompressedFiles(data.files);
      setStatus({
        message: `Compression complete!`,
        type: 'success',
      });
    } catch (error) {
      setStatus({
        message: error instanceof Error ? error.message : 'Failed to process image',
        type: 'error',
      });
    }
  };

  return (
    <div className="container">
      <h1>Basis Universal Texture Compression Tool</h1>

      <ImageUpload onImageSelect={handleImageSelect} />

      <CompressionOptions
        mode={compressionMode}
        onModeChange={handleCompressionModeChange}
        options={compressionOptions}
        onOptionsChange={handleOptionsChange}
      />

      <MipmapGeneration
        checked={generateMipmaps}
        onChange={checked => setGenerateMipmaps(checked)}
      />

      <button className="compression-btn" onClick={handleProcessImage} disabled={!selectedImage}>
        Start Compression
      </button>

      <StatusMessage {...status} />

      {selectedImage && (
        <Preview
          originalFile={selectedImage}
          compressedFiles={compressedFiles}
          originalSize={originalSize}
          compressionMode={compressionMode}
        />
      )}
    </div>
  );
}

export default App;
