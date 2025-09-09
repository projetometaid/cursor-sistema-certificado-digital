const { updateUserSchema, setRoleSchema, setSchedulingSchema } = require('../validators/update-user.dto');

module.exports = function UsersController(container){
  return {
    async getProfile(req,res){
      const id = req.params.id;
      const u = await container.userRepository.findById(id);
      if(!u) return res.status(404).json({ ok:false, error:'not_found' });
      res.json({ ok:true, user:{ id:u.id, fullName:u.fullName, email:u.email, role:u.role, timezone:u.timezone, schedulingEnabled:u.schedulingEnabled } });
    },
    async updateProfile(req,res){
      const id = req.params.id;
      const parse = updateUserSchema.safeParse(req.body||{});
      if(!parse.success) return res.status(400).json({ ok:false, error:'validation_error', details: parse.error.errors });
      const patch = { ...parse.data };
      patch.updatedAt = new Date().toISOString();
      const ok = await container.userRepository.updateWhere(id, patch);
      res.json({ ok });
    },
    async setRole(req,res){
      const id = req.params.id;
      const parse = setRoleSchema.safeParse(req.body||{});
      if(!parse.success) return res.status(400).json({ ok:false, error:'validation_error', details: parse.error.errors });
      const ok = await container.userRepository.updateWhere(id, { role: parse.data.role });
      res.json({ ok });
    },
    async setScheduling(req,res){
      const id = req.params.id;
      const parse = setSchedulingSchema.safeParse(req.body||{});
      if(!parse.success) return res.status(400).json({ ok:false, error:'validation_error', details: parse.error.errors });
      await container.enableSchedulingForUser.execute({ providerId:id, enabled: parse.data.enabled });
      const ok = await container.userRepository.updateWhere(id, { schedulingEnabled: parse.data.enabled });
      res.json({ ok });
    }
  };
};


