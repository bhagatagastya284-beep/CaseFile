const express = require('express');
const { startResearch, getCitations, exportReport } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/:id/run', startResearch);
router.get('/:id/citations', getCitations);
router.get('/:id/export', exportReport);

module.exports = router;
