import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Single storage config that handles both idCard and selfie ─────────────────
const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    folder: file.fieldname === 'idCard'
      ? 'campusrun/id-cards'
      : 'campusrun/selfies',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1000, quality: 'auto' }],
  }),
});

// ── Upload both files in one request ──────────────────────────────────────────
export const uploadDispatcherDocs = multer({ storage }).fields([
  { name: 'idCard', maxCount: 1 },
  { name: 'selfie', maxCount: 1 },
]);

export { cloudinary };