/** @typedef {{ id:string, reference:string, status:string, payload?:any }} PaymentResponse */
/** @typedef {{ createPayment(input:{ order: any, method:'PIX'|'BOLETO' }): Promise<PaymentResponse> }} PaymentGateway */
module.exports = {};
