const { getAll, saveItem, updateWhere } = require('../../../backend/data/localStore');
const COLLECTION = 'orders';
module.exports = class JsonOrderRepository {
  async save(order){ await saveItem(COLLECTION, order); return order; }
  async list(){ return await getAll(COLLECTION); }
  async findByReference(ref){
    const items = await getAll(COLLECTION);
    return items.find(o => (o.paymentRef === ref) || (o.id === ref)) || null;
  }
  async updateByReference(ref, patch){
    return await updateWhere(COLLECTION, o => (o.paymentRef === ref) || (o.id === ref), patch);
  }
};
