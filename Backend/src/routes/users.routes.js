const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middlewares/auth.middleware');

const {
    getUsers,
    getUserById,
    getMe,
    createUser,
    deleteUser,
    updateUserById,
    getInactiveUsers,
    reactivateUser
} = require('../controllers/users.controllers');

router.get('/', authMiddleware, adminMiddleware, getUsers);
router.get('/me', authMiddleware, getMe);
router.get('/inactive', authMiddleware, adminMiddleware, getInactiveUsers);
router.get('/:id', authMiddleware, getUserById);
router.post('/', createUser);
router.put('/:id', authMiddleware, updateUserById);
router.delete('/:id', authMiddleware, adminMiddleware, deleteUser);
router.patch('/:id/reactivate', authMiddleware, adminMiddleware, reactivateUser);

module.exports = router;
