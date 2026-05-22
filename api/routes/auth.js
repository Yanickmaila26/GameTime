const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/authController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.post('/login', ctrl.login);
router.get('/me', verifyToken, ctrl.me);
router.get('/users', verifyToken, requireAdmin, ctrl.getUsers);
router.post('/users', verifyToken, requireAdmin, ctrl.createUser);
router.put('/users/:id', verifyToken, requireAdmin, ctrl.updateUser);
router.delete('/users/:id', verifyToken, requireAdmin, ctrl.deleteUser);

module.exports = router;
