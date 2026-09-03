import mongoose from "mongoose";
import { createApp } from "./app.js";
import { loadEnv } from "./env.js";

const env = loadEnv();
const app = createApp(env);

try {
  await mongoose.connect(env.databaseUri, { dbName: env.databaseName });
  console.log(`Mongo connected (db=${env.databaseName})`);
  app.listen(env.port, "0.0.0.0", () => {
    console.log(`API listening on ${env.port}`);
  });
} catch (error) {
  console.error("Mongo connection failed", error);
  process.exit(1);
}
