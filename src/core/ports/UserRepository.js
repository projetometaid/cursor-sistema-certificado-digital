/** @typedef {{ id:string, name?:string, email:string, passwordHash:string }} User */
/** @typedef {{ save(user:User):Promise<User>, findByEmail(email:string):Promise<User|null> }} UserRepository */
module.exports = {};
