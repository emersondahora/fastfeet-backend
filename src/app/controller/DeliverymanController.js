import * as Yup from 'yup';

import Deliveryman from '../models/Deliveryman';
import File from '../models/File';

const deliverymanExists = async email => {
  const deliveryman = await Deliveryman.findOne({
    where: { email },
  });
  return !!deliveryman;
};

class DeliverymanController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const deliverymen = await Deliveryman.findAll({
      where: { status: 'active' },
      attributes: ['id', 'name', 'email', 'status'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
      limit: 20,
      offset: (page - 1) * 20,
      order: ['name'],
    });
    return res.json(deliverymen);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().required(),
      avatar_id: Yup.number(),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    if (await deliverymanExists(req.body.email)) {
      return res
        .status(400)
        .json({ error: 'Deliveryman email already exists' });
    }

    const deliveryman = await Deliveryman.create(req.body);
    return res.json(deliveryman);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string(),
      avatar_id: Yup.number(),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }
    const deliveryman = await Deliveryman.findByPk(req.params.id);
    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman did not found' });
    }
    if (
      deliveryman.email !== req.body.email &&
      (await deliverymanExists(req.body.email))
    ) {
      return res
        .status(400)
        .json({ error: 'Deliveryman email already exists' });
    }
    await deliveryman.update(req.body);
    return res.json(deliveryman);
  }

  async delete(req, res) {
    const deliveryman = await Deliveryman.findByPk(req.params.id);
    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman did not found' });
    }
    await deliveryman.update({ status: 'inactive' });
    return res.json(deliveryman);
  }
}
export default new DeliverymanController();
