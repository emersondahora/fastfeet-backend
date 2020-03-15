import * as Yup from 'yup';
import { getHours, parseISO } from 'date-fns';

import Delivery from '../models/Delivery';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';
import File from '../models/File';

class DeliveryController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const deliveries = await Delivery.findAll({
      where: { canceled_at: null },
      attributes: ['id', 'product'],

      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['name'],
        },
      ],
      limit: 20,
      offset: (page - 1) * 20,
      order: ['created_at'],
    });
    return res.json(deliveries);
  }

  async show(req, res) {
    const delivery = await Delivery.findByPk(req.params.id, {
      attributes: ['id', 'product'],
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['name'],
        },
        {
          model: File,
          as: 'signature',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });
    if (!delivery) {
      return res.status(400).json({ error: 'Delivery not found' });
    }
    return res.json(delivery);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
      product: Yup.string().required(),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }
    const deliveryman = await Deliveryman.findByPk(req.body.deliveryman_id);
    if (!deliveryman || deliveryman.status === 'inactive') {
      return res.status(400).json({ error: 'Deliveryman not found' });
    }
    const recipient = await Recipient.findByPk(req.body.recipient_id);
    if (!recipient) {
      return res.status(400).json({ error: 'Recipient not found' });
    }

    const delivery = await Delivery.create(req.body);

    return res.json(delivery);
  }

  async delete(req, res) {
    const delivery = await Delivery.findByPk(req.params.id);
    if (!delivery) {
      return res.status(400).json({ error: 'Delivery not found' });
    }
    if (!delivery.canceled_at) {
      await delivery.update({ canceled_at: new Date() });
    }
    return res.json(delivery);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number().required(),
      product: Yup.string(),
      start_date: Yup.date(),
      end_date: Yup.date(),
      signature_id: Yup.number().when('end_date', (end_date, field) =>
        end_date ? field.required() : field
      ),
    });
    const data = { ...req.body, ...req.params };
    if (!(await schema.isValid(data))) {
      return res.status(400).json({ error: 'Validation fails' });
    }
    if (data.start_date) {
      const hour = getHours(parseISO(data.start_date));
      if (hour < 8 || hour >= 18) {
        return res.status(400).json({ error: 'Pick-up time not allowed' });
      }
    }
    const delivery = await Delivery.findByPk(data.id);
    if (!delivery || delivery.canceled_at) {
      return res.status(400).json({ error: 'Delivery not found' });
    }
    if (delivery.start_date && data.start_date) {
      return res.status(400).json({ error: 'Delivery already withdrawn.' });
    }
    if (!delivery.start_date && data.end_date) {
      return res.status(400).json({ error: 'Delivery not withdrawn.' });
    }
    if (delivery.end_date) {
      return res.status(400).json({ error: 'Delivery delivered.' });
    }
    await delivery.update(data);
    return res.json(delivery);
  }
}

export default new DeliveryController();
