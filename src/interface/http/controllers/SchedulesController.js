const { schedulePolicySchema } = require('../validators/schedule-policy.dto');
const { availabilityListSchema } = require('../validators/appointment.dto');

module.exports = function SchedulesController(container){
  return {
    async getPolicy(req, res){
      try{
        const providerId = req.params.providerId;
        const policy = await container.schedulePolicyRepository.findByProviderId(providerId);
        res.json({ ok:true, policy: policy || null });
      } catch(err){ res.status(500).json({ ok:false, error:'server_error' }); }
    },
    async setEnabled(req, res){
      try{
        const providerId = req.params.providerId;
        const enabled = !!req.body.enabled;
        const out = await container.enableSchedulingForUser.execute({ providerId, enabled });
        if(!out.ok) return res.status(400).json(out);
        res.json(out);
      } catch(err){ res.status(500).json({ ok:false, error:'server_error' }); }
    },
    async configurePolicy(req, res){
      try{
        const providerId = req.params.providerId;
        const parse = schedulePolicySchema.safeParse(req.body);
        if(!parse.success) return res.status(400).json({ ok:false, error:'validation_error', details: parse.error.errors });
        const out = await container.configureSchedulePolicy.execute({ providerId, policy: parse.data });
        res.json(out);
      } catch(err){ res.status(500).json({ ok:false, error:'server_error' }); }
    },
    async listAvailability(req, res){
      try{
        const query = { providerId: req.params.providerId, fromISO: req.query.fromISO, toISO: req.query.toISO };
        const parse = availabilityListSchema.safeParse(query);
        if(!parse.success) return res.status(400).json({ ok:false, error:'validation_error', details: parse.error.errors });
        const out = await container.listAvailability.execute(parse.data);
        res.json(out);
      } catch(err){ res.status(500).json({ ok:false, error:'server_error' }); }
    }
  };
};


