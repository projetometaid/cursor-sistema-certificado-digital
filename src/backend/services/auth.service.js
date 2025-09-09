const { saveItem, findOne, createId } = require('../data/localStore');
const { hashPassword, comparePassword } = require('../utils/hash');
const { signToken } = require('../utils/tokens');

const USERS_COLLECTION = 'users';

async function registerUser({ name, email, password }) {
  const errors = [];
  if (!email) errors.push('email obrigatório');
  if (!password) errors.push('senha obrigatória');
  if (errors.length) return { ok: false, errors };

  const exists = await findOne(USERS_COLLECTION, u => u.email === email);
  if (exists) return { ok: false, errors: ['email já cadastrado'] };

  const user = {
    id: createId(),
    name: name || '',
    email,
    passwordHash: await hashPassword(password)
  };
  await saveItem(USERS_COLLECTION, user);
  return { ok: true, user: { id: user.id, name: user.name, email: user.email } };
}

async function loginUser({ email, password }) {
  const user = await findOne(USERS_COLLECTION, u => u.email === email);
  if (!user) return { ok: false, errors: ['credenciais inválidas'] };
  const ok = await comparePassword(password, user.passwordHash);
  if (!ok) return { ok: false, errors: ['credenciais inválidas'] };
  const token = signToken({ sub: user.id, email: user.email });
  return { ok: true, token, user: { id: user.id, name: user.name, email: user.email } };
}

module.exports = { registerUser, loginUser };


