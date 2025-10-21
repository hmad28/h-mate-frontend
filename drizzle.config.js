import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/schema.js",
  out: "./src/lib/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
