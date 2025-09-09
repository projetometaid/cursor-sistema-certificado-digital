// Deprecatado: usar src/interface/http/routes/webhooks.js
const { buildContainer } = require('../../main/container');
const buildWebhooksRouter = require('../../interface/http/routes/webhooks');
const container = buildContainer();
const webhooksRouter = buildWebhooksRouter(container);
module.exports = { webhooksRouter };


