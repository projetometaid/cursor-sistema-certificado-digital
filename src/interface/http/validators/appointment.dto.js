const { z } = require('zod');

const appointmentCreateSchema = z.object({
  providerId: z.string(),
  customer: z.object({ name: z.string(), email: z.string().email().optional(), phone: z.string().optional() }),
  serviceId: z.string().optional(),
  startISO: z.string(),
  endISO: z.string(),
  holdId: z.string().optional()
});

const availabilityListSchema = z.object({
  providerId: z.string(),
  fromISO: z.string(),
  toISO: z.string()
});

module.exports = { appointmentCreateSchema, availabilityListSchema };


