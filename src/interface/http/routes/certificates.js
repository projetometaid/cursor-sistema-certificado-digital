const express = require('express');

module.exports = function buildCertificatesRouter(container){
  const router = express.Router();
  const { buildAuthMiddleware } = require('../../../infrastructure/http/auth-middleware');
  const { authenticate } = buildAuthMiddleware(container);
  const repo = new (require('../../../infrastructure/repositories/json/JsonCertificateRepository'))();

  router.use(authenticate);
  router.get('/', async (_req,res)=>{ const items = await repo.list(); res.json({ ok:true, items: items.filter(i=>!i._deleted) }); });
  router.post('/', async (req,res)=>{
    const now = new Date().toISOString();
    const it = { id: require('crypto').randomUUID(), ...req.body, createdAt: now, updatedAt: now };
    await repo.save(it);
    res.status(201).json({ ok:true, item: it });
  });
  router.delete('/:id', async (req,res)=>{ const ok = await repo.deleteById(req.params.id); res.json({ ok }); });
  return router;
}


