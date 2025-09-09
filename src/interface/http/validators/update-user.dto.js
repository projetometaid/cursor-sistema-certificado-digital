const { z } = require('zod');

const updateUserSchema = z.object({
  fullName: z.string().min(2).max(120).optional(),
  phone: z.string().max(40).optional(),
  timezone: z.string().optional(),
  consent: z.object({ ad_user_data: z.boolean().optional(), ad_personalization: z.boolean().optional() }).optional(),
  metadata: z.record(z.any()).optional()
});

const setRoleSchema = z.object({ role: z.enum(['admin','provider','viewer']) });
const setSchedulingSchema = z.object({ enabled: z.boolean() });

module.exports = { updateUserSchema, setRoleSchema, setSchedulingSchema };


