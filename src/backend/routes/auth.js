// Deprecatado: usar src/interface/http/routes/auth.js
const { buildContainer } = require('../../main/container');
const buildAuthRouter = require('../../interface/http/routes/auth');
const container = buildContainer();
const authRouter = buildAuthRouter(container);
module.exports = { authRouter };


