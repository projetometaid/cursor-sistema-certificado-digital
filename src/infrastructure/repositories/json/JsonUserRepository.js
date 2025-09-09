const { getAll, saveItem, updateWhere } = require('../../../backend/data/localStore');
const COLLECTION = 'users';
module.exports = class JsonUserRepository {
  async save(user){ await saveItem(COLLECTION, user); return user; }
  async findByEmail(email){ const items = await getAll(COLLECTION); return items.find(u => u.email === email) || null; }
  async findById(id){ const items = await getAll(COLLECTION); return items.find(u => u.id === id) || null; }
  async updateWhere(id, patch){ return updateWhere(COLLECTION, u => u.id === id, patch); }
};
