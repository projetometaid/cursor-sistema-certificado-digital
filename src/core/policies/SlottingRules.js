function overlaps(aStartISO, aEndISO, bStartISO, bEndISO){
  return new Date(aStartISO) < new Date(bEndISO) && new Date(bStartISO) < new Date(aEndISO);
}

function applyExceptions({ slots, holidays = [], blocks = [] }){
  const holidayDates = new Set((holidays||[]).map(h => h.date));
  return slots
    .filter(s => !holidayDates.has(s.startISO.slice(0,10)))
    .filter(s => !(blocks||[]).some(b => overlaps(s.startISO, s.endISO, b.startISO, b.endISO)));
}

function withGap(slots, gapMinutes){
  if(!gapMinutes || gapMinutes <= 0) return slots;
  return slots.map(s => ({ ...s, endISO: new Date(new Date(s.endISO).getTime() + gapMinutes*60000).toISOString() }));
}

module.exports = { overlaps, applyExceptions, withGap };


