const { Router } = require('express');
module.exports = function buildOrdersRouter({ createOrder, listOrders }){
  const router = Router();
  router.get('/', async (_req,res)=>{ const r = await listOrders.execute(); res.json(r); });
  router.post('/', async (req,res)=>{ const r = await createOrder.execute(req.body); if(!r.ok) return res.status(400).json(r); res.status(201).json(r); });
  return router;
};
