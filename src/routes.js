import { Router } from 'express';

import authMiddleware from './app/middlewares/auth';

import SessionControler from './app/controller/SessionController';

const routes = new Router();

/** Public routes */
routes.post('/session', SessionControler.store);

routes.use(authMiddleware);
/** Private routes */
routes.get('/', (req, res) => res.json({ application: 'Fast Feet' }));

export default routes;
