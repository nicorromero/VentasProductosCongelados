const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middlewares/auth.middleware');

const {
    getProducts,
    getProductById,
    createProduct,
    deleteProduct,
    updateProduct,
    toggleActive,
    getInactiveProducts,
    reactivateProduct,
    confirmSuggestedPrice,
    syncExcelPricesManual,
    syncExcelSalesManual
} = require('../controllers/products.controllers');

router.get('/', getProducts);
router.get('/inactive', authMiddleware, adminMiddleware, getInactiveProducts);
router.get('/:id', getProductById);
router.post('/', authMiddleware, adminMiddleware, createProduct);
router.put('/:id', authMiddleware, adminMiddleware, updateProduct);
router.delete('/:id', authMiddleware, adminMiddleware, deleteProduct);
router.patch('/:id/toggle-active', authMiddleware, adminMiddleware, toggleActive);
router.patch('/:id/reactivate', authMiddleware, adminMiddleware, reactivateProduct);
// ── Excel Sync: confirmar precio sugerido y disparadores manuales ─────────────
router.patch('/:id/confirm-price', authMiddleware, adminMiddleware, confirmSuggestedPrice);
router.post('/sync-excel-prices', authMiddleware, adminMiddleware, syncExcelPricesManual);
router.post('/sync-excel-sales', authMiddleware, adminMiddleware, syncExcelSalesManual);

module.exports = router;
