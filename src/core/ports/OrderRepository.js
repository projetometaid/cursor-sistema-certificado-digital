/** @typedef {{ id:string, type:'eCPF'|'eCNPJ', customer:Object, address?:Object, documents?:Object, protocolId?:string|null, paymentRef?:string|null, status:string, createdAt:string }} Order */
/** @typedef {{ save(order:Order):Promise<Order>, list():Promise<Order[]>, findByReference(ref:string):Promise<Order|null>, updateByReference(ref:string, patch:Object):Promise<boolean> }} OrderRepository */
module.exports = {};
