import { Router } from 'express';
import multer from 'multer';

import authMiddleware from './app/middlewares/auth';
import multerConfig from './config/multer';

import SessionControler from './app/controller/SessionController';
import RecipientControler from './app/controller/RecipientController';
import FileController from './app/controller/FileController';
import DeliverymanController from './app/controller/DeliverymanController';

const routes = new Router();
const upload = multer(multerConfig);

/** Public routes */
routes.post('/session', SessionControler.store);

routes.use(authMiddleware);
/** Private routes */
routes.post('/recipients', RecipientControler.store);
routes.put('/recipients/:id', RecipientControler.update);

routes.post('/deliverymen', DeliverymanController.store);
routes.put('/deliverymen/:id', DeliverymanController.update);
routes.get('/deliverymen', DeliverymanController.index);
routes.delete('/deliverymen/:id', DeliverymanController.delete);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
