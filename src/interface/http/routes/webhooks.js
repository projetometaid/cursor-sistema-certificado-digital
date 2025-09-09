const { Router } = require('express');
module.exports = function buildWebhooksRouter({ markOrderPaid }){
  const router = Router();
  router.post('/safe2pay', async (req,res)=>{ const reference = req.body?.Reference || req.body?.reference; const status = String(req.body?.Status || '').toLowerCase(); if(!reference) return res.status(400).json({ ok:false, error:'missing reference' }); if(status==='paid'||status==='approved'){ await markOrderPaid.execute(reference); } res.json({ ok:true }); });
  return router;
};
