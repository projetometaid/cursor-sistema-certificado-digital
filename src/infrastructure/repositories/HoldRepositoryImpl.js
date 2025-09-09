const { getAll, saveItem, updateWhere, createId } = require('../db/localStore');

class HoldRepositoryImpl {
  constructor(){ this.collection = 'holds'; }
  async create({ providerId, startISO, endISO, expiresAt, customer }){
    const hold = { id: createId(), providerId, startISO, endISO, status:'active', expiresAt, customer };
    await saveItem(this.collection, hold);
    return hold;
  }
  async release(id){
    return updateWhere(this.collection, h => h.id === id && h.status === 'active', { status:'released' });
  }
  async listActiveByProviderBetween(providerId, fromISO, toISO){
    const arr = await getAll(this.collection);
    const now = new Date().toISOString();
    const from = new Date(fromISO), to = new Date(toISO);
    return arr.filter(h => h.providerId === providerId && h.status === 'active' && h.expiresAt > now && new Date(h.startISO) < to && new Date(h.endISO) > from);
  }
  async expireOlderThan(nowISO){
    const arr = await getAll(this.collection);
    let count = 0;
    for(const h of arr){
      if(h.status === 'active' && h.expiresAt <= nowISO){
        await updateWhere(this.collection, x => x.id === h.id, { status:'expired' });
        count++;
      }
    }
    return count;
  }
}

module.exports = HoldRepositoryImpl;


