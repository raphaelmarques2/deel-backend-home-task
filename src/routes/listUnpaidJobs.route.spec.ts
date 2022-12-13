import request from "supertest";
import { seedDb } from "../../scripts/seedDb";
import { Express } from "express";
import Sequelize from "sequelize";
import { createApp } from "../app";

describe("GET /jobs/unpaid", () => {
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

  it("should return a list of user's non paid jobs", async () => {
    const result = await request(app)
      .get("/jobs/unpaid")
      .set("profile_id", "2")
      .expect(200)
      .send();

    const jobs = result.body;

    expect(jobs).toHaveLength(2); //this user has 2 unpaid jobs

    expect(jobs[0].paid).not.toBe(true);
    expect(jobs[1].paid).not.toBe(true);

    expect(jobs[0].id).toBe(3);
    expect(jobs[1].id).toBe(4);
  });
});
