import express from 'express';
import multer from 'multer';
import { cloudinary } from '../lib/cloudinary.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ── Multer — store file in memory so we can stream to Cloudinary ──────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

// POST /api/upload/item-image
router.post('/item-image', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Stream buffer directly to Cloudinary — no temp file needed
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder:         'campusrun/item-images',
          resource_type:  'image',
          transformation: [{ width: 800, crop: 'limit', quality: 'auto' }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    return res.status(200).json({ url: result.secure_url });

  } catch (err) {
    console.error('Cloudinary upload error:', err);
    return res.status(500).json({ message: 'Image upload failed', error: err.message });
  }
});

export default router;