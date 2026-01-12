import "@testing-library/jest-dom";
import { beforeAll, afterEach, afterAll } from "vitest";
import { cleanDatabase, disconnectTestDb, pushSchema } from "../helpers/db";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });

let isDbSetup = false;

beforeAll(async () => {
  if (!isDbSetup) {
    console.log("Setting up test database...");
    try {
      await pushSchema();
      isDbSetup = true;
      console.log("Test database ready");
    } catch (error) {
      console.error("Failed to setup test database:", error);
      throw error;
    }
  }
}, 60000);

afterEach(async () => {
  await cleanDatabase();
});

afterAll(async () => {
  await disconnectTestDb();
});
