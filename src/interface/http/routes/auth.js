const { Router } = require('express');
module.exports = function buildAuthRouter({ registerUser, loginUser }){
  const router = Router();
  router.post('/register', async (req,res)=>{ const r = await registerUser.execute(req.body); if(!r.ok) return res.status(400).json(r); res.status(201).json(r); });
  router.post('/login', async (req,res)=>{ const r = await loginUser.execute(req.body); if(!r.ok) return res.status(401).json(r); res.json(r); });
  return router;
};
