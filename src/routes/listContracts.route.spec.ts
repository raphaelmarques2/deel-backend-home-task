import request from "supertest";
import { seedDb } from "../../scripts/seedDb";
import { Express } from "express";
import Sequelize from "sequelize";
import { createApp } from "../app";

describe("GET /contracts", () => {
  let app: Express;
  let sequelize: Sequelize.Sequelize;

  beforeEach(async () => {
    await seedDb();

    const newApp = createApp();
    app = newApp.app;
    sequelize = newApp.sequelize;
  });
  afterEach(async () => {
    await sequelize.close();
  });
  it("should return a list of user's non-terminated contracts", async () => {
    const result = await request(app)
      .get("/contracts")
      .set("profile_id", "1")
      .expect(200)
      .send();

    const contracts = result.body;
    expect(contracts).toHaveLength(1); //there is only one non terminated contract for this user
    expect(contracts[0].status).not.toBe("terminated");
  });
});
