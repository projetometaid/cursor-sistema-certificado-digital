const express = require('express');
const buildController = require('../controllers/AppointmentsController');

module.exports = function buildAppointmentsRouter(container){
  const router = express.Router();
  const ctrl = buildController(container);
  router.post('/:providerId', ctrl.book);
  router.delete('/:id', ctrl.cancel);
  return router;
};


