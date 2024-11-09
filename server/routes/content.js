const express = require('express');
const router = express.Router();
const multer = require('multer');
const { encrypt, decrypt } = require('../utils/encryption');
const Content = require('../models/Content');

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Route to handle file encryption
router.post('/encrypt/file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Encrypt the file buffer
    const { encryptedData, key, iv } = encrypt(req.file.buffer);

    // Create new content document
    const content = new Content({
      type: 'file',
      encryptedData,
      iv,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype
    });

    // Save to database
    await content.save();

    // Send response
    res.json({
      id: content._id,
      key,
      fileName: req.file.originalname
    });
  } catch (error) {
    console.error('File encryption error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route to handle text encryption
router.post('/encrypt/text', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'No text provided' });
    }

    const { encryptedData, key, iv } = encrypt(text);

    const content = new Content({
      type: 'text',
      encryptedData,
      iv
    });

    await content.save();

    res.json({
      id: content._id,
      key
    });
  } catch (error) {
    console.error('Text encryption error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route to handle decryption
router.post('/decrypt/:id', async (req, res) => {
  try {
    const { key } = req.body;
    const content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    const decrypted = decrypt(content.encryptedData, key, content.iv);

    res.json({
      type: content.type,
      data: decrypted.toString(content.type === 'file' ? 'base64' : 'utf8'),
      fileName: content.fileName,
      mimeType: content.mimeType
    });
  } catch (error) {
    console.error('Decryption error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;