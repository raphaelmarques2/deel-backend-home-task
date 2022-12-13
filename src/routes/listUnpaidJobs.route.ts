import Sequelize from "sequelize";
import express, { Request, Response } from "express";
import { Contract, Job } from "../model";

import { getProfile } from "../middleware/getProfile";
import { ContractStatus } from "../model/contract.model";

const route = express.Router();

route.get("/jobs/unpaid", getProfile, async (req: Request, res: Response) => {
  const profile = req.profile!;

  //Get all unpaid jobs for a user (***either*** a client or contractor), for ***active contracts only***.
  /* 
  SELECT * 
    FROM Job j
    INNER JOIN Contract c
    ON c.ContractId = c.id
    WHERE c.status != 'terminated' AND (c.ClientId = *id* OR c.ContractorId = *id*) AND (j.paid IS NULL OR j.paid = "0")
  */

  const jobs = await Job.findAll({
    include: [
      {
        model: Contract,
        required: true,
      },
    ],
    where: {
      [Sequelize.Op.and]: {
        "$Contract.status$": {
          [Sequelize.Op.ne]: "terminated",
        },
        [Sequelize.Op.or]: {
          "$Contract.ClientId$": profile.id,
          "$Contract.ContractorId$": profile.id,
        },
        "$Job.paid$": {
          [Sequelize.Op.or]: [null, 0],
        },
      },
    },
  });

  res.json(jobs);
});

export const listUnpaidJobsRoute = route;
