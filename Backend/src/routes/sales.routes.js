const express = require('express');
const router = express.Router();

const { getSales, getSaleById, createSale, deleteSale, createOrder, getMyOrders, updateOrderStatus, updateOrderItems } =
    require('../controllers/sales.controllers');

const { authMiddleware, adminMiddleware } =
    require('../middlewares/auth.middleware');

// Rutas específicas ANTES de los wildcards (/:id captura cualquier segmento)
router.post('/ordenes', createOrder);
router.get('/ordenes', authMiddleware, getSales);
router.get('/mis-ordenes', authMiddleware, getMyOrders);
router.patch('/ordenes/:id/estado', authMiddleware, adminMiddleware, updateOrderStatus);
router.patch('/ordenes/:id/items', authMiddleware, adminMiddleware, updateOrderItems);
router.delete('/ordenes/:id', authMiddleware, adminMiddleware, deleteSale);


// Rutas legacy con wildcard
router.get('/', getSales);
router.get('/:id', getSaleById);
router.post('/', createSale);
router.delete('/:id', authMiddleware, adminMiddleware, deleteSale);

module.exports = router;