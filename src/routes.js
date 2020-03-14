import { Router } from 'express';

import authMiddleware from './app/middlewares/auth';

import SessionControler from './app/controller/SessionController';
import RecipientControler from './app/controller/RecipientController';

const routes = new Router();

/** Public routes */
routes.post('/session', SessionControler.store);

routes.use(authMiddleware);
/** Private routes */
routes.post('/recipients', RecipientControler.store);
routes.put('/recipients/:id', RecipientControler.update);

export default routes;
