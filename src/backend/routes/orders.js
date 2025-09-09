// Deprecatado: usar src/interface/http/routes/orders.js
const { buildContainer } = require('../../main/container');
const buildOrdersRouter = require('../../interface/http/routes/orders');
const container = buildContainer();
const ordersRouter = buildOrdersRouter(container);
module.exports = { ordersRouter };


