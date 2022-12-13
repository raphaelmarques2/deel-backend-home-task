import { Express } from "express";
import Sequelize from "sequelize";
import request from "supertest";
import { seedDb } from "../../scripts/seedDb";
import { createApp } from "../app";

describe("GET /admin/best-profession", () => {
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

  it("should return the best paid profession", async () => {
    const result = await request(app)
      .get("/admin/best-profession?start=2022-12-10T00:00:00.000Z")
      .set("profile_id", "999") //admin
      .expect(200)
      .send();

    const topPaid = result.body;
    expect(topPaid.profession).toBe("Programmer"); //best profession!!!
    expect(topPaid.amount).toBe(2683);
  });
  it("should return 401 if isn't an admin user", async () => {
    await request(app)
      .get("/admin/best-profession")
      .set("profile_id", "1") //admin
      .expect(401)
      .send();
  });
});
