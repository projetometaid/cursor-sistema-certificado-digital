const { getAll, saveItem, updateWhere } = require('../db/localStore');

class AppointmentRepositoryImpl {
  constructor(){ this.collection = 'appointments'; }
  async save(appt){ await saveItem(this.collection, appt); return appt; }
  async findById(id){ const arr = await getAll(this.collection); return arr.find(a => a.id === id) || null; }
  async cancel(id){
    return await updateWhere(this.collection, a => a.id === id, { status:'cancelled' });
  }
  async listByProviderBetween(providerId, fromISO, toISO){
    const arr = await getAll(this.collection);
    const from = new Date(fromISO), to = new Date(toISO);
    return arr.filter(a => a.providerId === providerId && new Date(a.startISO) < to && new Date(a.endISO) > from);
  }
  async findOverlappingRange(providerId, fromISO, toISO){
    return this.listByProviderBetween(providerId, fromISO, toISO);
  }
}

module.exports = AppointmentRepositoryImpl;


