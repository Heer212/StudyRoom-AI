import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'studyroom-ai/resources',
    resource_type: 'auto', // auto-detects pdf/image/doc
  },
});

const upload = multer({ storage });

export default upload;