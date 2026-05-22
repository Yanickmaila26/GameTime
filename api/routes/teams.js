const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/teamController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

// Players within team
router.get('/:id/players', ctrl.getPlayers);
router.post('/:id/players', ctrl.addPlayer);
router.put('/:id/players/:playerId', ctrl.updatePlayer);
router.delete('/:id/players/:playerId', ctrl.deletePlayer);

module.exports = router;
