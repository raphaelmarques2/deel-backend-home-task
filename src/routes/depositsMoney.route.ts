import Sequelize from "sequelize";
import express, { Request, Response } from "express";
import { Contract, Job, Profile } from "../model";

import { getProfile } from "../middleware/getProfile";

const route = express.Router();

type Body = {
  amount?: number;
};

route.post(
  "/balances/deposit/:userId",
  getProfile,
  async (req: Request, res: Response) => {
    const profile = req.profile!;

    const { userId } = req.params;

    const amount: number | undefined = req.body?.amount;

    if (typeof amount !== "number") {
      return res.status(400).end();
    }
    if (amount <= 0) {
      return res.status(400).end();
    }

    const sequelize = req.app.get("sequelize") as Sequelize.Sequelize;
    const transaction = await sequelize.transaction(); //transaction so many simultaneous payments don't make the data inconsistent

    try {
      const client = (await Profile.findOne({
        where: { id: profile.id },
        transaction,
      }))!;

      //a client can't deposit more than 25% his total of jobs to pay
      /*
      SELECT *
        FROM Job j
        INNER JOIN Contract c
        ON c.ContractId = c.id
        WHERE c.ClientId = *id* AND (j.paid IS NULL OR j.paid = "0")
      */

      const jobsToPay = await Job.findAll({
        include: [
          {
            model: Contract,
            required: true,
          },
        ],
        where: {
          [Sequelize.Op.and]: {
            "$Contract.ClientId$": client.id,
            "$Job.paid$": {
              [Sequelize.Op.or]: [null, 0],
            },
          },
        },
        transaction,
        // group: ['$Job.id$'],
        // attributes: [
        //   [sequelize.fn('sum', sequelize.col('$Job.price$'))]
        // ]
      });

      const totalToPay = jobsToPay
        .map((e) => e.price)
        .reduce((p, c) => p + c, 0);

      const validAmountToDeposit = amount <= totalToPay * 0.25;
      if (!validAmountToDeposit) {
        await transaction.rollback();
        return res.status(400).end();
      }

      client.balance += amount;
      await client.save({ transaction });

      await transaction.commit();

      return res.json(client);
    } catch (error) {
      await transaction.rollback();
      return res.status(500).end();
    }
  }
);

export const depositsMoneyRoute = route;
