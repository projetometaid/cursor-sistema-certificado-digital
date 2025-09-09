function toISO(date){ return new Date(date).toISOString(); }
function parseHHmm(hhmm){
  const [h,m] = hhmm.split(':').map(Number);
  return { hours: h||0, minutes: m||0 };
}
function addMinutesISO(startISO, minutes){
  return new Date(new Date(startISO).getTime() + minutes*60000).toISOString();
}
function sameDayISO(iso){ return iso.slice(0,10); }
function getWeekday(iso){ return new Date(iso).getDay(); }
function buildDateOnDay(baseISO, hhmm){
  const base = new Date(baseISO);
  const { hours, minutes } = parseHHmm(hhmm);
  const dt = new Date(base);
  dt.setHours(hours, minutes, 0, 0);
  return dt.toISOString();
}
function rangesOverlap(aStart, aEnd, bStart, bEnd){
  return new Date(aStart) < new Date(bEnd) && new Date(bStart) < new Date(aEnd);
}

module.exports = { toISO, parseHHmm, addMinutesISO, sameDayISO, getWeekday, buildDateOnDay, rangesOverlap };


