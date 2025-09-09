const { registerSchema } = require('../validators/register.dto');
const { loginSchema } = require('../validators/login.dto');

module.exports = function AuthController(container){
  return {
    async register(req,res){
      const parse = registerSchema.safeParse(req.body||{});
      if(!parse.success) return res.status(400).json({ ok:false, error:'validation_error', details: parse.error.errors });
      const r = await container.registerUser.execute(parse.data);
      if(!r.ok) return res.status(400).json(r);
      res.status(201).json(r);
    },
    async login(req,res){
      const parse = loginSchema.safeParse(req.body||{});
      if(!parse.success) return res.status(400).json({ ok:false, error:'validation_error', details: parse.error.errors });
      const r = await container.loginUser.execute(parse.data);
      if(!r.ok) return res.status(401).json(r);
      res.json(r);
    }
  };
}
