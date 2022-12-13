import express, { Request, Response } from "express";
import { Contract } from "../model";

import { getProfile } from "../middleware/getProfile";

const route = express.Router();

route.get("/contracts/:id", getProfile, async (req: Request, res: Response) => {
  const profile = req.profile!;

  const { id } = req.params;
  const contract = await Contract.findOne({ where: { id } });

  if (!contract) return res.status(404).end();

  const contractBelongsToProfile =
    contract.ClientId === profile.id || contract.ContractorId === profile.id;

  if (!contractBelongsToProfile) return res.status(401).end();

  res.json(contract);
});

export const getContractByIdRoute = route;
