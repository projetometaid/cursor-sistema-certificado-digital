const express = require('express');
const buildUsersController = require('../controllers/UsersController');
module.exports = function buildUsersRouter(container){
  const router = express.Router();
  const ctrl = buildUsersController(container);
  const { buildAuthMiddleware } = require('../../../infrastructure/http/auth-middleware');
  const { authenticate, requireRole, requireSelfOrAdmin } = buildAuthMiddleware(container);
  router.use(authenticate);
  router.get('/:id', requireSelfOrAdmin('id'), ctrl.getProfile);
  router.put('/:id', requireSelfOrAdmin('id'), ctrl.updateProfile);
  router.patch('/:id/role', requireRole('admin'), ctrl.setRole);
  router.patch('/:id/scheduling', requireSelfOrAdmin('id'), ctrl.setScheduling);
  return router;
};


