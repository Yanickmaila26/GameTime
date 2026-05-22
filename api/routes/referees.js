const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/refereeController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);
router.get('/', ctrl.getAllIncludingInactive);
router.get('/active', ctrl.getAll);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
