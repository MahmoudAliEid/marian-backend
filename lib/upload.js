// uploading images to the server using multer and cloudinary
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
console.log('Configuring Cloudinary with:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET ? '***' : 'NOT_SET'
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
}); 

// Test Cloudinary connection
cloudinary.api.ping()
  .then(result => console.log('Cloudinary connection test:', result))
  .catch(err => console.error('Cloudinary connection failed:', err));

// Configure Multer storage with Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'marian', // Folder in Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg'], // Allowed file formats
  },
});

// Create Multer instance with Cloudinary storage
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit (increased from 5MB)
    files: 10, // Maximum 10 files
  },
  fileFilter: (req, file, cb) => {
    console.log('Processing file:', file.originalname, file.mimetype, 'Size:', file.size);
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Create a wrapper function to handle upload errors properly
const uploadHandler = (req, res, next) => {
  const uploadMiddleware = upload.array('images');
  
  uploadMiddleware(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err);
      console.error('Error type:', typeof err);
      console.error('Error message:', err.message);
      console.error('Error code:', err.code);
      
      let errorMessage = 'File upload failed';
      let statusCode = 400;
      
      // Handle specific error types
      if (err.code === 'LIMIT_FILE_SIZE') {
        errorMessage = 'File too large. Maximum size allowed is 25MB per file.';
        statusCode = 413; // Payload Too Large
      } else if (err.code === 'LIMIT_FILE_COUNT') {
        errorMessage = 'Too many files. Maximum 10 files allowed.';
        statusCode = 413;
      } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        errorMessage = 'Unexpected field name. Use "images" for file uploads.';
        statusCode = 400;
      } else if (err.message === 'Only image files are allowed!') {
        errorMessage = 'Invalid file type. Only image files (jpg, png, jpeg) are allowed.';
        statusCode = 400;
      } else if (err.message.includes('Multipart: Boundary not found')) {
        errorMessage = 'Invalid request format. Make sure to use multipart/form-data.';
        statusCode = 400;
      }
      
      // Return proper JSON error response
      return res.status(statusCode).json({ 
        error: errorMessage,
        details: err.message,
        code: err.code,
        maxFileSize: '25MB',
        maxFiles: 10,
        allowedTypes: ['jpg', 'png', 'jpeg']
      });
    }
    next();
  });
};

// Export the wrapper function instead of direct multer middleware
module.exports = uploadHandler; 
