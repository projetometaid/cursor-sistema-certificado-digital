const { getAll, saveItem } = require('../../../backend/data/localStore');
const COLLECTION = 'users';
module.exports = class JsonUserRepository {
  async save(user){ await saveItem(COLLECTION, user); return user; }
  async findByEmail(email){ const items = await getAll(COLLECTION); return items.find(u => u.email === email) || null; }
};
