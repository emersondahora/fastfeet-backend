import { Router } from 'express';
import multer from 'multer';

import authMiddleware from './app/middlewares/auth';
import multerConfig from './config/multer';

import SessionControler from './app/controller/SessionController';
import RecipientControler from './app/controller/RecipientController';
import FileController from './app/controller/FileController';
import DeliverymanController from './app/controller/DeliverymanController';
import DeliveryController from './app/controller/DeliveryController';

const routes = new Router();
const upload = multer(multerConfig);

/** Public routes */
routes.post('/session', SessionControler.store);

routes.use(authMiddleware);
/** Private routes */
routes.post('/files', upload.single('file'), FileController.store);

routes.post('/recipients', RecipientControler.store);
routes.put('/recipients/:id', RecipientControler.update);

routes.get('/deliverymen', DeliverymanController.index);
routes.post('/deliverymen', DeliverymanController.store);
routes.get('/deliverymen/:id', DeliverymanController.show);
routes.put('/deliverymen/:id', DeliverymanController.update);
routes.delete('/deliverymen/:id', DeliverymanController.delete);

routes.get('/deliveries', DeliveryController.index);
routes.post('/deliveries', DeliveryController.store);
routes.get('/deliveries/:id', DeliveryController.show);
routes.delete('/deliveries/:id', DeliveryController.delete);
routes.put('/deliveries/:id', DeliveryController.update);

export default routes;
