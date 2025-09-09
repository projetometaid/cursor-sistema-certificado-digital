const { z } = require('zod');

const registerSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(64),
  role: z.enum(['admin','provider','viewer']).optional(),
  timezone: z.string().optional(),
  schedulingEnabled: z.boolean().optional()
});

module.exports = { registerSchema };


