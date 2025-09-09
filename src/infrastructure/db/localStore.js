const { readFile, writeFile, mkdir } = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.resolve('src/backend/data');

async function ensureFile(file) {
  await mkdir(DATA_DIR, { recursive: true });
  try { await readFile(file, 'utf-8'); }
  catch { await writeFile(file, '[]', 'utf-8'); }
}

function fileFor(collection) { return path.join(DATA_DIR, `${collection}.json`); }

function createId() { return crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex'); }

async function getAll(collection) {
  const file = fileFor(collection); await ensureFile(file);
  return JSON.parse(await readFile(file, 'utf-8'));
}

async function saveItem(collection, item) {
  const file = fileFor(collection); const arr = await getAll(collection);
  arr.push(item); await writeFile(file, JSON.stringify(arr, null, 2), 'utf-8');
  return item;
}

async function findOne(collection, predicate) {
  const arr = await getAll(collection);
  return arr.find(predicate) || null;
}

async function updateWhere(collection, predicate, patch = {}) {
  const file = fileFor(collection); const arr = await getAll(collection);
  let changed = false;
  const out = arr.map(it => {
    if (predicate(it)) { changed = true; return { ...it, ...patch }; }
    return it;
  });
  if (changed) await writeFile(file, JSON.stringify(out, null, 2), 'utf-8');
  return changed;
}

module.exports = { createId, getAll, saveItem, findOne, updateWhere };


