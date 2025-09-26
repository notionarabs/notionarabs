const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Upload image endpoint
router.post('/image', upload.single('image'), async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'لم يتم رفع أي ملف'
      });
    }

    // Validate file size
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'حجم الملف يجب أن يكون أقل من 5 ميجابايت'
      });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'notion-arabs/templates',
          transformation: [
            { width: 1200, height: 800, crop: 'limit' },
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    // Return success response
    res.json({
      success: true,
      message: 'تم رفع الصورة بنجاح',
      data: {
        imageUrl: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes
      }
    });

  } catch (error) {
    console.error('Image upload error:', error);

    // Handle specific Cloudinary errors
    if (error.message && error.message.includes('Only image files are allowed')) {
      return res.status(400).json({
        success: false,
        message: 'يرجى رفع ملف صورة صالح (PNG, JPG, GIF)'
      });
    }

    if (error.message && error.message.includes('File too large')) {
      return res.status(400).json({
        success: false,
        message: 'حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت'
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء رفع الصورة',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete image endpoint
router.delete('/image/:publicId', async (req, res) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'معرف الصورة مطلوب'
      });
    }

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      res.json({
        success: true,
        message: 'تم حذف الصورة بنجاح'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'الصورة غير موجودة'
      });
    }

  } catch (error) {
    console.error('Image deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حذف الصورة',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Upload profile picture endpoint
router.post('/profile-picture', auth, upload.single('profilePicture'), async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'لم يتم رفع أي ملف'
      });
    }

    // Validate file size
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'حجم الملف يجب أن يكون أقل من 5 ميجابايت'
      });
    }

    // Upload to Cloudinary with profile picture specific settings
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'notion-arabs/profile-pictures',
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    // Return success response
    res.json({
      success: true,
      message: 'تم رفع صورة الملف الشخصي بنجاح',
      url: result.secure_url,
      publicId: result.public_id
    });

  } catch (error) {
    console.error('Profile picture upload error:', error);

    // Handle specific Cloudinary errors
    if (error.message && error.message.includes('Only image files are allowed')) {
      return res.status(400).json({
        success: false,
        message: 'يرجى رفع ملف صورة صالح (PNG, JPG, GIF)'
      });
    }

    if (error.message && error.message.includes('File too large')) {
      return res.status(400).json({
        success: false,
        message: 'حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت'
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء رفع صورة الملف الشخصي',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
