import Sequelize from "sequelize";
import express, { Request, Response } from "express";
import { Contract } from "../model";

import { getProfile } from "../middleware/getProfile";
import { ContractStatus } from "../model/contract.model";

const route = express.Router();

route.get("/contracts", getProfile, async (req: Request, res: Response) => {
  const profile = req.profile!;

  const contracts = await Contract.findAll({
    where: {
      [Sequelize.Op.and]: {
        status: {
          [Sequelize.Op.ne]: ContractStatus.Terminated,
        },
        [Sequelize.Op.or]: {
          ClientId: {
            [Sequelize.Op.eq]: profile.id,
          },
          ContractorId: {
            [Sequelize.Op.eq]: profile.id,
          },
        },
      },
    },
  });

  res.json(contracts);
});

export const listContractsRoute = route;
