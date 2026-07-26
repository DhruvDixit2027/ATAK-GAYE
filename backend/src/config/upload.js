const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'atak-gaye-profiles', // Cloudinary ke andar is naam ke folder mein sab save hoga
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    public_id: (req, file) => `profile-${Date.now()}`,   // 👈 NAYA — ad-blockers isko block na karein isliye prefix diya
    transformation: [{ width: 500, height: 500, crop: 'limit' }], // auto-resize, bahut badi image na ho
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB tak allow
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Sirf image files allowed hain'));
    }
  },
});

module.exports = upload;