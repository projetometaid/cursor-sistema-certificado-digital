function buildAuthMiddleware({ authTokenService, userRepository }){
  function authenticate(req, res, next){
    const hdr = req.headers['authorization']||''; const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
    if(!token) return res.status(401).json({ ok:false, error:'unauthorized' });
    const payload = authTokenService.verifyAccess(token);
    if(!payload) return res.status(401).json({ ok:false, error:'unauthorized' });
    req.user = { id: payload.sub, role: payload.role };
    next();
  }
  function requireRole(role){
    return (req,res,next)=>{ if(!req.user || req.user.role !== role) return res.status(403).json({ ok:false, error:'forbidden' }); next(); };
  }
  function requireSelfOrAdmin(param='id'){
    return (req,res,next)=>{ const target = req.params[param]; if(req.user?.role==='admin' || req.user?.id===target) return next(); return res.status(403).json({ ok:false, error:'forbidden' }); };
  }
  return { authenticate, requireRole, requireSelfOrAdmin };
}

module.exports = { buildAuthMiddleware };


