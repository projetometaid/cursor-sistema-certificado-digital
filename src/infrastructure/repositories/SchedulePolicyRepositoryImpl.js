const { getAll, updateWhere, saveItem } = require('../db/localStore');

class SchedulePolicyRepositoryImpl {
  constructor(){ this.collection = 'schedule_policies'; }
  async findByProviderId(providerId){
    const arr = await getAll(this.collection);
    return arr.find(p => p.providerId === providerId) || null;
  }
  async upsert({ providerId, patch }){
    const existing = await this.findByProviderId(providerId);
    if(existing){
      await updateWhere(this.collection, p => p.providerId === providerId, { ...existing, ...patch, providerId });
      return true;
    }
    await saveItem(this.collection, { providerId, ...patch });
    return true;
  }
}

module.exports = SchedulePolicyRepositoryImpl;


