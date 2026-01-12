import { disconnectDatabase } from "./e2e/utils/db";

export default async function globalTeardown() {
  console.log("\n[GlobalTeardown] Cleaning up...");
  await disconnectDatabase();
  console.log("[GlobalTeardown] Database disconnected\n");
}
