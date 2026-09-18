const express = require('express');
const router = express.Router();

const { getCarts,
    getCartById,
    createCart,
    addProductToCart,
    deleteCart
} = require('../controllers/carts.controllers');

router.get('/', getCarts);
router.get('/:id', getCartById);
router.post('/', createCart);
router.put('/:id', addProductToCart);
router.delete('/:id', deleteCart);

module.exports = router;