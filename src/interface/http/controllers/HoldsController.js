const { createHoldSchema } = require('../validators/hold.dto');

module.exports = function HoldsController(container){
  return {
    async create(req, res){
      try{
        const providerId = req.params.providerId;
        const payload = { providerId, ...(req.body||{}) };
        const parse = createHoldSchema.safeParse(payload);
        if(!parse.success) return res.status(400).json({ ok:false, error:'validation_error', details: parse.error.errors });
        const out = await container.createHold.execute(parse.data);
        if(!out.ok) return res.status(409).json(out);
        res.json(out);
      } catch(err){ res.status(500).json({ ok:false, error:'server_error' }); }
    },
    async release(req, res){
      try{
        const holdId = req.params.id;
        const out = await container.releaseHold.execute({ holdId });
        res.json(out);
      } catch(err){ res.status(500).json({ ok:false, error:'server_error' }); }
    }
  };
};


