const express = require('express');
const buildUsersController = require('../controllers/UsersController');
const { registerSchema } = require('../validators/register.dto');
module.exports = function buildUsersRouter(container){
  const router = express.Router();
  const ctrl = buildUsersController(container);
  const { buildAuthMiddleware } = require('../../../infrastructure/http/auth-middleware');
  const { authenticate, requireRole, requireSelfOrAdmin } = buildAuthMiddleware(container);
  router.use(authenticate);
  // Admin cria usuários
  router.post('/', requireRole('admin'), async (req,res)=>{
    const parse = registerSchema.safeParse(req.body||{});
    if(!parse.success) return res.status(400).json({ ok:false, error:'validation_error', details: parse.error.errors });
    const r = await container.registerUser.execute(parse.data);
    if(!r.ok) return res.status(400).json(r);
    res.status(201).json(r);
  });
  router.get('/me', ctrl.getMe);
  router.get('/', requireRole('admin'), ctrl.list);
  router.get('/:id', requireSelfOrAdmin('id'), ctrl.getProfile);
  router.put('/:id', requireSelfOrAdmin('id'), ctrl.updateProfile);
  router.patch('/:id/role', requireRole('admin'), ctrl.setRole);
  router.patch('/:id/scheduling', requireSelfOrAdmin('id'), ctrl.setScheduling);
  return router;
};


