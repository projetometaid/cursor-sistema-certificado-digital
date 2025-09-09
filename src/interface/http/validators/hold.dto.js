const { z } = require('zod');

const createHoldSchema = z.object({
  providerId: z.string(),
  startISO: z.string(),
  endISO: z.string(),
  customer: z.object({ name: z.string().optional(), email: z.string().email().optional(), phone: z.string().optional() }).optional(),
  ttlMinutes: z.number().int().positive().max(60).optional().default(10)
});

module.exports = { createHoldSchema };
