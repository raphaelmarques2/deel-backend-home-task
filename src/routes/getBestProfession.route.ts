import express, { Request, Response } from "express";
import Sequelize from "sequelize";

import { adminGuard } from "../middleware/adminGuard";
import { parseQueryDate } from "../utils/parseQuery";

const route = express.Router();

//"/admin/best-profession?start=<date>&end=<date>"
route.get(
  "/admin/best-profession",
  adminGuard,
  async (req: Request, res: Response) => {
    const start = parseQueryDate(req.query.start as string | undefined);
    const end = parseQueryDate(req.query.end as string | undefined);

    const sequelize = req.app.get("sequelize") as Sequelize.Sequelize;

    const startCondition =
      "AND strftime('%Y-%m-%d',c.createdAt) >= strftime('%Y-%m-%d', ? )";
    const endCondition =
      "AND strftime('%Y-%m-%d',c.updatedAt) <= strftime('%Y-%m-%d', ? )";

    const query = `
      SELECT p.profession, sum(j.price) as total from Profiles p
      INNER JOIN Contracts c
      ON p.id = c.ContractorId
      INNER JOIN Jobs j
      ON j.ContractId = c.id
      WHERE j.paid = 1
      ${start ? startCondition : ""}
      ${end ? endCondition : ""}
      GROUP BY p.profession
      ORDER BY total DESC
      LIMIT 1
      `;

    const queryValues = [start, end]
      .filter(Boolean)
      .map((e) => e?.toISOString());

    const [data] = await sequelize.query({
      query,
      values: queryValues,
    });

    const result = data as { profession: string; total: number }[];

    if (result.length == 0) return res.status(404).end();

    res.json({
      profession: result[0].profession,
      amount: result[0].total,
    });
  }
);

export const getBestProfessionRoute = route;
