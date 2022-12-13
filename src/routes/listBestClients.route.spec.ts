import { Express } from "express";
import Sequelize from "sequelize";
import request from "supertest";
import { seedDb } from "../../scripts/seedDb";
import { createApp } from "../app";

describe("GET /admin/best-clients", () => {
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

  it("should return two best clients", async () => {
    const result = await request(app)
      .get("/admin/best-clients")
      .set("profile_id", "999") //admin
      .expect(200)
      .send();

    const bestClients = result.body;
    expect(bestClients).toHaveLength(2);
    expect(bestClients[0].fullName).toBe("Ash Kethcum");
    expect(bestClients[0].paid).toBe(2020);
    expect(bestClients[1].fullName).toBe("Mr Robot");
    expect(bestClients[1].paid).toBe(442);
  });
  it("should return three best clients", async () => {
    const result = await request(app)
      .get("/admin/best-clients?limit=3")
      .set("profile_id", "999") //admin
      .expect(200)
      .send();

    const bestClients = result.body;
    expect(bestClients).toHaveLength(3);
  });
  it("should return one best clients filtered by date", async () => {
    const result = await request(app)
      .get(
        "/admin/best-clients?start=2020-08-17T00:00:00.000Z&end=2020-08-18T00:00:00.000Z&limit=1"
      )
      .set("profile_id", "999") //admin
      .expect(200)
      .send();

    const bestClients = result.body;
    expect(bestClients).toHaveLength(1);
    expect(bestClients[0].fullName).toBe("John Snow");
    expect(bestClients[0].paid).toBe(200);
  });
});
