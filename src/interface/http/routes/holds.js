const express = require('express');
const buildController = require('../controllers/HoldsController');

module.exports = function buildHoldsRouter(container){
  const router = express.Router();
  const ctrl = buildController(container);
  router.post('/:providerId', ctrl.create);
  router.delete('/:id', ctrl.release);
  return router;
};


