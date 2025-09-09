class LocalCalendarProvider {
  constructor(){ this.store = new Map(); }
  async createEvent({ id, providerId, startISO, endISO, title }){
    const externalId = `${providerId}:${id}`;
    this.store.set(externalId, { id: externalId, startISO, endISO, title });
    return { ok:true, externalId };
  }
  async cancelEvent(externalId){ this.store.delete(externalId); return { ok:true }; }
}

module.exports = LocalCalendarProvider;


