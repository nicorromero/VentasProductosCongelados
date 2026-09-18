const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middlewares/auth.middleware');

const {
    getProducts,
    getProductById,
    createProduct,
    deleteProduct,
    updateProduct,
    getInactiveProducts,
    reactivateProduct
} = require('../controllers/products.controllers');

router.get('/', getProducts);
router.get('/inactive', authMiddleware, adminMiddleware, getInactiveProducts);
router.get('/:id', getProductById);
router.post('/', authMiddleware, adminMiddleware, createProduct);
router.put('/:id', authMiddleware, adminMiddleware, updateProduct);
router.delete('/:id', authMiddleware, adminMiddleware, deleteProduct);
router.patch('/:id/reactivate', authMiddleware, adminMiddleware, reactivateProduct);

module.exports = router;
