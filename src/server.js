const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const cors = require('cors');
const util = require('util');
const sharp = require('sharp');

// Promisify functions
const statAsync = util.promisify(fs.stat);
const execAsync = util.promisify(exec);
const readdirAsync = util.promisify(fs.readdir);
const unlinkAsync = util.promisify(fs.unlink);
const copyFileAsync = util.promisify(fs.copyFile);

// Constants
const FILE_AGE_LIMIT = 5 * 60 * 1000; // 5 minutes
const BASISU_PATH = path.resolve(__dirname, '../basisu/basisu');

// Directory paths
const DIRS = {
  uploads: path.join(__dirname, '../public/uploads'),
  preview: path.join(__dirname, '../public/preview'),
  public: path.join(__dirname, '../public'),
  nodeModules: path.join(__dirname, '../node_modules'),
};

// Ensure directories exist
Object.values(DIRS).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: DIRS.uploads,
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.static(DIRS.public));
app.use('/uploads', express.static(DIRS.uploads));
app.use('/node_modules', express.static(DIRS.nodeModules));

/**
 * Utility Functions
 */

// Format file size for display
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Validate image dimensions (must be multiple of 4)
async function validateImageDimensions(imagePath) {
  const metadata = await sharp(imagePath).metadata();
  return {
    isValid: metadata.width % 4 === 0 && metadata.height % 4 === 0,
    width: metadata.width,
    height: metadata.height,
  };
}

/**
 * Image Compression Functions
 */

// Build basisu command based on compression options
function buildBasisuCommand(inputFileName, options) {
  let command = `cd "${DIRS.preview}" && "${BASISU_PATH}"`;

  switch (options.mode) {
    case 'etc1s':
      command += ` -q ${options.quality || '128'}`;
      break;
    case 'uastc':
      command += ` -uastc`;
      break;
    case 'uastc_rdo':
      command += ` -uastc -uastc_rdo_l ${options.rdoQuality || '1.0'}`;
      break;
    case 'hdr_4x4':
      command += ` -hdr`;
      break;
    case 'hdr_6x6':
      command += ` -hdr_6x6 -lambda ${options.lambda || '500'} -hdr_6x6_level ${options.level || '3'}`;
      break;
    case 'hdr_6x6i':
      command += ` -hdr_6x6i -lambda ${options.lambda || '500'} -hdr_6x6i_level ${options.level || '3'}`;
      break;
    default:
      command += ` -q 128`;
      break;
  }

  if (options.generateMipmaps === 'true') {
    command += ' -mipmap';
  }

  return command + ` "${inputFileName}"`;
}

// Compress image using basisu
async function compressImage(inputPath, options) {
  const inputFileName = path.basename(inputPath);
  const baseFileName = path.basename(inputFileName, path.extname(inputFileName));
  const tempInputPath = path.join(DIRS.preview, inputFileName);

  try {
    // Copy input file to preview directory
    await copyFileAsync(inputPath, tempInputPath);

    // Execute compression command
    const command = buildBasisuCommand(inputFileName, options);
    const { stdout, stderr } = await execAsync(command);
    console.log('Command output:', stdout);
    if (stderr) console.error('Command stderr:', stderr);

    // Clean up temporary input file
    await unlinkAsync(tempInputPath);

    // Find generated files
    const files = await readdirAsync(DIRS.preview);
    const compressedFiles = files
      .filter(
        file => file.startsWith(baseFileName) && (file.endsWith('.basis') || file.endsWith('.ktx2'))
      )
      .map(file => {
        const newPath = path.join(
          DIRS.preview,
          `${options.name}.${path.extname(file).substring(1)}`
        );
        // Rename the file to match original name
        if (file !== path.basename(newPath)) {
          fs.renameSync(path.join(DIRS.preview, file), newPath);
        }
        return {
          path: newPath,
          type: path.extname(newPath).substring(1),
        };
      });

    if (compressedFiles.length === 0) {
      throw new Error('No compressed files found');
    }

    return compressedFiles;
  } catch (error) {
    // Clean up temporary file on error
    try {
      await unlinkAsync(tempInputPath);
    } catch (e) {
      console.error('Failed to clean up temporary file:', e);
    }
    throw new Error('Compression failed: ' + error.message);
  }
}

/**
 * Cleanup Functions
 */

// Clean up old files in uploads directory
async function cleanupOldFiles() {
  try {
    const files = await readdirAsync(DIRS.uploads);
    const now = Date.now();

    for (const file of files) {
      const filePath = path.join(DIRS.uploads, file);
      const stats = await statAsync(filePath);
      const age = now - stats.mtime.getTime();

      if (age > FILE_AGE_LIMIT) {
        try {
          await unlinkAsync(filePath);
          console.log(`Deleted old file: ${file}`);
        } catch (error) {
          console.error(`Failed to delete file ${file}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('Error cleaning up old files:', error);
  }
}

// Clean up preview directory
async function cleanupPreviewDir() {
  try {
    const files = await readdirAsync(DIRS.preview);
    for (const file of files) {
      const filePath = path.join(DIRS.preview, file);
      await unlinkAsync(filePath);
      console.log('Deleted preview file:', filePath);
    }
  } catch (error) {
    console.error('Failed to clean preview directory:', error);
  }
}

/**
 * API Routes
 */

// Compress image endpoint
app.post('/compress', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    // Clean old files in uploads directory
    await cleanupOldFiles();

    // Clean preview directory before compression
    await cleanupPreviewDir();

    // Get original file size
    const stats = await statAsync(req.file.path);
    const originalSize = formatFileSize(stats.size);

    // Validate image dimensions
    const dimensions = await validateImageDimensions(req.file.path);
    if (!dimensions.isValid) {
      throw new Error(
        `Image dimensions must be multiples of 4. Current: ${dimensions.width}x${dimensions.height}`
      );
    }

    // Compress image
    const compressedFiles = await compressImage(req.file.path, {
      mode: req.body.mode || 'etc1s',
      quality: req.body.quality,
      rdoQuality: req.body.rdoQuality,
      lambda: req.body.lambda,
      level: req.body.level,
      generateMipmaps: req.body.generateMipmaps,
      name: req.body.name,
    });

    // Get compressed file sizes
    const fileSizes = await Promise.all(
      compressedFiles.map(async f => {
        const stats = await statAsync(f.path);
        return {
          type: f.type,
          size: formatFileSize(stats.size),
        };
      })
    );

    // Clean up input file
    await unlinkAsync(req.file.path);

    res.json({
      success: true,
      files: compressedFiles.map(f => ({
        downloadUrl: `/preview/${path.basename(f.path)}`,
        filename:
          path.basename(req.file.originalname, path.extname(req.file.originalname)) + '.' + f.type,
        type: f.type,
        size: fileSizes.find(s => s.type === f.type).size,
      })),
      originalSize,
      originalImage: req.file.filename,
    });
  } catch (error) {
    console.error('Error:', error);
    // Clean up input file on error
    if (req.file) {
      await unlinkAsync(req.file.path).catch(console.error);
    }
    res.status(500).json({ error: error.message });
  }
});

// Get latest KTX2 file endpoint
app.get('/latest-ktx2', async (req, res) => {
  try {
    const files = await readdirAsync(DIRS.preview);
    const ktx2Files = files.filter(f => f.endsWith('.ktx2'));

    if (ktx2Files.length === 0) {
      return res.status(404).json({ error: 'No KTX2 files found' });
    }

    const latestFile = ktx2Files[ktx2Files.length - 1];
    res.json({
      filename: latestFile,
      url: `/preview/${latestFile}`,
    });
  } catch (error) {
    console.error('Error getting latest KTX2:', error);
    res.status(500).json({ error: 'Failed to get latest KTX2 file' });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
