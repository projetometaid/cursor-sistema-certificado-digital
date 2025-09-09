const { z } = require('zod');

const shiftSchema = z.object({ start: z.string().regex(/^\d{2}:\d{2}$/), end: z.string().regex(/^\d{2}:\d{2}$/) });
const holidaySchema = z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), reason: z.string().optional() });
const blockSchema = z.object({ startISO: z.string(), endISO: z.string(), reason: z.string().optional() });

const schedulePolicySchema = z.object({
  enabled: z.boolean(),
  timezone: z.string(),
  workingDays: z.array(z.number().int().min(0).max(6)),
  shifts: z.array(shiftSchema),
  slotDurationMinutes: z.number().int().positive(),
  gapBetweenSlotsMinutes: z.number().int().min(0).optional().default(0),
  exceptions: z.object({ holidays: z.array(holidaySchema).optional(), blocks: z.array(blockSchema).optional() }).optional(),
  maxConcurrentAppointments: z.number().int().positive().default(1),
  bookingWindowDays: z.number().int().positive().default(30),
  serviceDurations: z.record(z.string(), z.number().int().positive()).nullable().optional()
});

module.exports = { schedulePolicySchema };


