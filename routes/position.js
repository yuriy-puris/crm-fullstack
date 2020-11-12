const express = require('express');
const router = express.Router();
const passport = require('passport');
const controller = require('../controllers/position');


router.get('/:categoryId', passport.authenticate('jwt', { session: false }), controller.getByCategoryId);
router.post('/', passport.authenticate('jwt', { session: false }), controller.create);
router.delete('/:id', passport.authenticate('jwt', { session: false }), controller.remove);
router.patch('/:id', passport.authenticate('jwt', { session: false }), controller.update);


module.exports = router;