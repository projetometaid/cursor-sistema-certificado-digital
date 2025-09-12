const express = require('express');
const integrations = require('../../../infrastructure/integrations/safeweb/protocolApis');

module.exports = function buildIntegrationsRouter(){
  const router = express.Router();
  router.post('/biometria', async (req,res)=>{
    try{ const r = await integrations.safeweb.validarBiometria(req.body?.cpf||''); res.json(r); }catch(e){ res.status(500).json({ error:e.message }); }
  });
  router.post('/assertiva/cpf', async (req,res)=>{
    try{ const r = await integrations.assertiva.consultarCPF(req.body?.cpf||''); res.json(r); }catch(e){ res.status(500).json({ error:e.message }); }
  });
  router.post('/safeweb/consulta-previa-cpf', async (req,res)=>{
    try{ const { cpf, dataNascimento } = req.body||{}; const r = await integrations.safeweb.validarCPF(cpf, dataNascimento); res.json(r); }catch(e){ res.status(500).json({ error:e.message }); }
  });
  router.post('/safeweb/consulta-previa-cnpj', async (req,res)=>{
    try{ const { cnpj, cpfResponsavel, dataNascimento } = req.body||{}; const r = await integrations.safeweb.validarCNPJ(cnpj, cpfResponsavel, dataNascimento); res.json(r); }catch(e){ res.status(500).json({ error:e.message }); }
  });
  router.get('/viacep/:cep', async (req,res)=>{
    try{ const r = await integrations.viacep.consultarCEP(req.params.cep||''); res.json(r); }catch(e){ res.status(500).json({ error:e.message }); }
  });
  router.get('/externos/cnpj/:cnpj', async (req,res)=>{
    try{ const { consultarCNPJ } = require('../../../infrastructure/integrations/externos/cnpjProvider'); const r = await consultarCNPJ(req.params.cnpj); res.json(r); }catch(e){ res.status(500).json({ error:e.message }); }
  });
  return router;
}


