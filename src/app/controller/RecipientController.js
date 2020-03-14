import * as Yup from 'yup';
import Sequelize, { Op } from 'sequelize';

import Recipient from '../models/Recipient';

const existsRecipient = async (name, id) => {
  let where = Sequelize.where(Sequelize.fn('lower', Sequelize.col('name')), {
    [Op.like]: String(name).toLowerCase(),
  });
  if (id) {
    where = {
      [Op.and]: [
        where,
        {
          id: {
            [Op.ne]: id,
          },
        },
      ],
    };
  }

  const recipient = await Recipient.findOne({
    where,
  });
  return !!recipient;
};

class RecipientController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      street: Yup.string().required(),
      number: Yup.number().required(),
      complement: Yup.string(),
      state: Yup.string().required(),
      city: Yup.string().required(),
      zipcode: Yup.string().required(),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    if (await existsRecipient(req.body.name)) {
      return res.status(400).json({ error: 'Recipient name aready used.' });
    }

    const recipient = await Recipient.create(req.body);
    return res.json(recipient);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number().required(),
      name: Yup.string(),
      street: Yup.string(),
      number: Yup.number(),
      complement: Yup.string(),
      state: Yup.string(),
      city: Yup.string(),
      zipcode: Yup.string(),
    });

    if (!(await schema.isValid({ ...req.body, ...req.params }))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const recipient = await Recipient.findByPk(req.params.id);
    if (!recipient) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    if (await existsRecipient(req.body.name, req.params.id)) {
      return res.status(400).json({ error: 'Recipient name aready used.' });
    }

    (await recipient.update(req.body)).reload();
    // const recipient = await Recipient.create(req.body);
    return res.json(recipient);
  }
}
export default new RecipientController();
