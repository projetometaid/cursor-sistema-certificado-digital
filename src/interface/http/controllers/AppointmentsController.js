const { appointmentCreateSchema } = require('../validators/appointment.dto');

module.exports = function AppointmentsController(container){
  return {
    async book(req, res){
      try{
        const payload = { ...req.body, providerId: req.params.providerId };
        const parse = appointmentCreateSchema.safeParse(payload);
        if(!parse.success) return res.status(400).json({ ok:false, error:'validation_error', details: parse.error.errors });
        const out = await container.bookAppointment.execute(parse.data);
        if(!out.ok) return res.status(409).json(out);
        res.json(out);
      } catch(err){ res.status(500).json({ ok:false, error:'server_error' }); }
    },
    async cancel(req, res){
      try{
        const id = req.params.id;
        const ok = await container.appointmentRepository.cancel(id);
        res.json({ ok });
      } catch(err){ res.status(500).json({ ok:false, error:'server_error' }); }
    }
  };
};


