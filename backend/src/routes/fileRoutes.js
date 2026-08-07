const express = require('express');
const { uploadFile, listFiles, deleteFile } = require('../controllers/fileController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(protect);

router.post('/upload', upload.single('file'), uploadFile);
router.get('/', listFiles);
router.delete('/:id', deleteFile);

module.exports = router;
