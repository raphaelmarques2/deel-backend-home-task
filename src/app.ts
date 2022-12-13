import express from "express";
import bodyParser from "body-parser";
import { connectToDatabase } from "./model";
import Sequelize from "sequelize";

import { getContractByIdRoute } from "./routes/getContractById.route";
import { listContractsRoute } from "./routes/listContracts.route";
import { listUnpaidJobsRoute } from "./routes/listUnpaidJobs.route";
import { payForJobRoute } from "./routes/payForJob.route";
import { depositsMoneyRoute } from "./routes/depositsMoney.route";
import { getBestProfessionRoute } from "./routes/getBestProfession.route";
import { listBestClientsRoute } from "./routes/listBestClients.route";

declare global {
  namespace Express {
    interface Request {
      sequelize: Sequelize.Sequelize;
    }
  }
}

export function createApp(options?: { sequelize?: { log?: boolean } }) {
  const sequelize = connectToDatabase(options?.sequelize);

  const app = express();

  app.use(bodyParser.json());
  app.set("sequelize", sequelize);
  app.set("models", sequelize.models);

  //routes
  app.use(getContractByIdRoute);
  app.use(listContractsRoute);
  app.use(listUnpaidJobsRoute);
  app.use(payForJobRoute);
  app.use(depositsMoneyRoute);
  app.use(getBestProfessionRoute);
  app.use(listBestClientsRoute);

  return { app, sequelize };
}
