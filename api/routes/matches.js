const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/matchController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.put('/:id/setup', ctrl.setup);
router.post('/:id/start', ctrl.start);
router.post('/:id/score', ctrl.addScore);
router.post('/:id/foul', ctrl.addFoul);
router.post('/:id/next-quarter', ctrl.nextQuarter);
router.post('/:id/finish', ctrl.finish);

module.exports = router;
