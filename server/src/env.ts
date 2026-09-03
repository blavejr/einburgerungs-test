export interface Env {
  port: number;
  databaseUri: string;
  databaseName: string;
  jwtSecret: string;
  origins: string[];
  production: boolean;
}

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    console.error(`${name} is required`);
    process.exit(1);
  }
  return value;
}

export function loadEnv(): Env {
  return {
    port: Number(process.env.PORT) || 8787,
    databaseUri: required("DATABASE_URI"),
    databaseName: process.env.DATABASE_NAME?.trim() || "einburgerung",
    jwtSecret: required("JWT_SECRET"),
    origins: (process.env.CORS_ORIGINS || "http://localhost:5173")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
    production: process.env.NODE_ENV === "production",
  };
}
