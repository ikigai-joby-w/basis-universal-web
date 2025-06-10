# Basis Universal Texture Compression Tool

A web-based tool for compressing image textures using the Basis Universal GPU texture format. This tool provides an easy-to-use interface for converting images to highly compressed GPU textures that can be efficiently loaded in web applications.

## Features

- Multiple compression modes:
  - ETC1S: Low-medium quality with transparency support
  - UASTC LDR: High quality for standard images
  - UASTC LDR RDO: Optimized high quality with rate-distortion optimization
  - UASTC HDR 4x4: High quality HDR support
  - UASTC HDR 6x6: HDR with smaller file sizes
  - GPU Photo: Special intermediate HDR format
- Customizable compression options for each mode
- Mipmap generation support
- Real-time preview of compressed textures
- File size comparison
- Drag-and-drop file upload
- Support for PNG, JPG, JPEG, and GIF formats
- Automatic image dimension validation (multiples of 4)

## Prerequisites

- Node.js (v14 or higher)
- Basis Universal command-line tool
- Modern web browser with WebGL support

## Installation

1. Clone the repository:
```bash
git clone
cd basis-universal-web
```

2. Install dependencies:
```bash
npm install
```

3. Install the Basis Universal command-line tool:
```bash
# Instructions vary by platform
# See: https://github.com/BinomialLLC/basis_universal
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000` (frontend) and `http://localhost:3001` (backend).

## Usage

1. Upload an image by dragging and dropping or clicking the upload area
2. Select a compression mode based on your needs:
   - ETC1S for general web images with transparency
   - UASTC modes for higher quality requirements
   - HDR modes for high dynamic range images
3. Adjust compression options:
   - Quality (1-255) for ETC1S
   - RDO Quality (0.2-3.0) for UASTC RDO
   - Lambda and Level for HDR modes
4. Enable mipmaps if needed
5. Click "Start Compression"
6. Preview the results and download the compressed files

## API Endpoints

### POST /compress
Compresses an uploaded image using specified parameters.

Request body (multipart/form-data):
- `image`: Image file
- `mode`: Compression mode
- `generateMipmaps`: Boolean
- Additional parameters based on mode:
  - `quality` for ETC1S
  - `rdoQuality` for UASTC RDO
  - `lambda` and `level` for HDR modes

Response:
```json
{
  "success": true,
  "files": [
    {
      "downloadUrl": "/preview/filename.ktx2",
      "filename": "output.ktx2",
      "type": "ktx2",
      "size": "128 KB"
    }
  ],
  "originalSize": "1.2 MB"
}
```

### GET /latest-ktx2
Returns information about the most recently generated KTX2 file.

## Development

The project is built with:
- React + TypeScript (Frontend)
- Express.js (Backend)
- Basis Universal (Texture compression)
- PixiJS (Texture preview)

Key files:
- `src/App.tsx`: Main application component
- `src/components/`: React components
- `src/server.js`: Express backend server
- `src/types.ts`: TypeScript type definitions

## License

MIT License - See LICENSE file for details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Acknowledgments

- [Basis Universal](https://github.com/BinomialLLC/basis_universal) for the texture compression technology
- [PixiJS](https://pixijs.com/) for WebGL texture rendering
- All contributors and maintainers
