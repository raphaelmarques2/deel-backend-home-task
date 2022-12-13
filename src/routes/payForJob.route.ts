import Sequelize from "sequelize";
import express, { Request, Response } from "express";
import { Contract, Job, Profile } from "../model";

import { getProfile } from "../middleware/getProfile";

const route = express.Router();

route.post(
  "/jobs/:job_id/pay",
  getProfile,
  async (req: Request, res: Response) => {
    const profile = req.profile!;

    const { job_id } = req.params;

    const sequelize = req.app.get("sequelize") as Sequelize.Sequelize;
    const transaction = await sequelize.transaction(); //transaction so many simultaneous payments don't make the data inconsistent

    try {
      const job = await Job.findOne({ where: { id: job_id }, transaction });
      if (!job) {
        await transaction.rollback();
        return res.status(404).end();
      }

      //contract doesn't need to be parte of the transaction
      const contract = await Contract.findOne({
        where: { id: job?.ContractId },
      });
      if (!contract) {
        await transaction.rollback();
        return res.status(404).end();
      }

      const profileIsClientOfTheContract = contract.ClientId == profile.id;
      if (!profileIsClientOfTheContract) {
        await transaction.rollback();
        return res.status(401).end();
      }

      const client = await Profile.findOne({
        where: { id: contract.ClientId },
        transaction,
      });
      const contractor = await Profile.findOne({
        where: { id: contract.ContractorId },
        transaction,
      });

      if (!client || !contractor) {
        await transaction.rollback();
        return res.status(500).end(); //this shouldn't happen
      }

      if (job.paid) {
        await transaction.rollback();
        return res.json(job); //if job is already paid, ignores for idempotency
      }

      const clientCanPayByTheJob = client.balance >= job.price;
      if (!clientCanPayByTheJob) {
        await transaction.rollback();
        return res.status(400).end();
      }

      const amount = job.price;
      client.balance -= amount;
      contractor.balance += amount;

      job.paid = true;
      job.paymentDate = new Date();

      await client.save({ transaction });
      await contractor.save({ transaction });
      await job.save({ transaction });

      await transaction.commit();

      res.json(job);
    } catch (error) {
      await transaction.rollback();
      res.status(500).end();
    }
  }
);

export const payForJobRoute = route;
