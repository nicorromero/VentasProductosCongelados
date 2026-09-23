const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middlewares/auth.middleware');
const { getCategories, createCategory, deleteCategory } = require('../controllers/categories.controllers');

router.get('/', getCategories);
router.post('/', authMiddleware, adminMiddleware, createCategory);
router.delete('/:id', authMiddleware, adminMiddleware, deleteCategory);

module.exports = router;
