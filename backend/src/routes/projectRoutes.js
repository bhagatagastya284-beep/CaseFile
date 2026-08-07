const express = require('express');
const {
  createProject,
  listProjects,
  getProject,
  updateProject,
  deleteProject,
  getDashboardStats
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/stats/dashboard', getDashboardStats);
router.post('/', createProject);
router.get('/', listProjects);
router.get('/:id', getProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

module.exports = router;
