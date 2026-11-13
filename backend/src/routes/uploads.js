const express = require('express');
const router = express.Router();
const multer = require('multer');
const { supabaseAdmin } = require('../config/supabase');
const requireAuth = require('../middleware/auth');

// Multer memory storage (keeps file buffer in memory for direct Supabase upload)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max limit
});

/**
 * POST /api/upload
 * Requires Auth
 * Body: multipart/form-data with field 'file' and query/body 'bucket'
 */
router.post('/', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const bucket = req.body.bucket || req.query.bucket || 'team-avatars';
    const allowedBuckets = ['team-avatars', 'blog-images', 'gallery-images', 'documents'];

    if (!allowedBuckets.includes(bucket)) {
      return res.status(400).json({ error: `Invalid bucket. Allowed: ${allowedBuckets.join(', ')}` });
    }

    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (error) throw error;

    // Retrieve public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(filePath);

    res.json({
      success: true,
      url: publicUrl,
      fileName,
      bucket
    });
  } catch (err) {
    console.error('File upload error:', err);
    res.status(500).json({ error: err.message || 'File upload failed' });
  }
});

module.exports = router;

