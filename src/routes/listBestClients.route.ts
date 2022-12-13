import express, { Request, Response } from "express";
import Sequelize from "sequelize";

import { adminGuard } from "../middleware/adminGuard";
import { parseQueryDate, parseQueryInt } from "../utils/parseQuery";

const route = express.Router();

// /admin/best-clients?start=<date>&end=<date>&limit=<integer>
route.get(
  "/admin/best-clients",
  adminGuard,
  async (req: Request, res: Response) => {
    const start = parseQueryDate(req.query.start as string | undefined);
    const end = parseQueryDate(req.query.end as string | undefined);
    const limit = parseQueryInt(req.query.limit as string | undefined) ?? 2;

    const sequelize = req.app.get("sequelize") as Sequelize.Sequelize;

    const startCondition =
      "AND strftime('%Y-%m-%d',j.paymentDate) >= strftime('%Y-%m-%d', ? )";
    const endCondition =
      "AND strftime('%Y-%m-%d',j.paymentDate) <= strftime('%Y-%m-%d', ? )";

    const query = `
      SELECT p.id, p.firstName, p.lastName, sum(j.price) as paid from Profiles p
      INNER JOIN Contracts c
      ON c.ClientId = p.id
      INNER JOIN Jobs j
      ON c.id = j.ContractId
      WHERE j.paid = 1
      ${start ? startCondition : ""}
      ${end ? endCondition : ""}
      GROUP BY p.id
      ORDER BY paid DESC
      LIMIT ?
    `;

    const dateValues = [start, end]
      .filter(Boolean)
      .map((e) => e?.toISOString());
    const queryValues = [...dateValues, limit];

    const [data] = await sequelize
      .query({
        query,
        values: queryValues,
      })
      .catch((err) => {
        console.log(err);
        return [[]];
      });

    const result = data as {
      id: number;
      firstName: string;
      lastName: string;
      paid: number;
    }[];

    const formattedResult = result.map((e) => ({
      id: e.id,
      fullName: `${e.firstName} ${e.lastName}`,
      paid: e.paid,
    }));

    //if (result.length == 0) return res.status(404).end();

    res.json(formattedResult);
  }
);

export const listBestClientsRoute = route;
