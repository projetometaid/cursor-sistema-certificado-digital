const { Router } = require('express');
const buildController = require('../controllers/AuthController');
module.exports = function buildAuthRouter(container){
  const router = Router();
  const ctrl = buildController(container);
  router.post('/register', ctrl.register);
  router.post('/login', ctrl.login);
  router.post('/refresh', (req,res)=>{
    const token = req.body?.refreshToken;
    const payload = container.authTokenService.verifyRefresh(token||'');
    if(!payload) return res.status(401).json({ ok:false, error:'unauthorized' });
    const userId = payload.sub;
    const role = req.body?.role || 'provider';
    const accessToken = container.authTokenService.signAccess({ sub:userId, role });
    res.json({ ok:true, accessToken });
  });
  return router;
};
