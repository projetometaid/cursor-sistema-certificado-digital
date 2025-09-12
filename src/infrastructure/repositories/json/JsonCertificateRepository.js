const { getAll, saveItem, updateWhere } = require('../../../backend/data/localStore');
const COLLECTION = 'certificates';

module.exports = class JsonCertificateRepository {
  async list(){ return await getAll(COLLECTION); }
  async save(certificate){ await saveItem(COLLECTION, certificate); return certificate; }
  async deleteById(id){ return updateWhere(COLLECTION, it => it.id === id, { _deleted: true }); }
};


