const express = require('express');
const buildController = require('../controllers/SchedulesController');

module.exports = function buildSchedulesRouter(container){
  const router = express.Router();
  const ctrl = buildController(container);
  const { buildAuthMiddleware } = require('../../../infrastructure/http/auth-middleware');
  const { authenticate, requireSelfOrAdmin } = buildAuthMiddleware(container);
  // Políticas e enable/disable: protegido
  router.get('/:providerId/policy', authenticate, requireSelfOrAdmin('providerId'), ctrl.getPolicy);
  router.put('/:providerId/enabled', authenticate, requireSelfOrAdmin('providerId'), ctrl.setEnabled);
  router.put('/:providerId/policy', authenticate, requireSelfOrAdmin('providerId'), ctrl.configurePolicy);
  router.get('/:providerId/availability', ctrl.listAvailability);
  return router;
};


