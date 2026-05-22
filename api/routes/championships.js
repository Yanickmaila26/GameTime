const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/championshipController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.post('/:id/teams', ctrl.addTeam);
router.delete('/:id/teams/:teamId', ctrl.removeTeam);
router.post('/:id/draw', ctrl.draw);

module.exports = router;
