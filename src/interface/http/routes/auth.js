const { Router } = require('express');
const buildController = require('../controllers/AuthController');
module.exports = function buildAuthRouter(container){
  const router = Router();
  const ctrl = buildController(container);
  router.post('/register', ctrl.register);
  router.post('/login', ctrl.login);
  router.post('/refresh', async (req,res)=>{
    const token = req.body?.refreshToken;
    const payload = container.authTokenService.verifyRefresh(token||'');
    if(!payload) return res.status(401).json({ ok:false, error:'unauthorized' });
    const userId = payload.sub;
    // Deriva papel do repositório do usuário ou do próprio refresh payload, nunca do body
    let role = payload.role || 'provider';
    try {
      const u = await container.userRepository.findById(userId);
      if (u?.role) role = u.role;
    } catch(_){/* fallback mantém role do payload */}
    const accessToken = container.authTokenService.signAccess({ sub:userId, role });
    res.json({ ok:true, accessToken });
  });
  return router;
};
