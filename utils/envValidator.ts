interface RequiredEnvVars {
  DB_URI: string;
  CLOUD_NAME: string;
  CLOUD_API_KEY: string;
  CLOUD_SECRET_KEY: string;
  ACCESS_TOKEN: string;
  REFRESH_TOKEN: string;
  REDIS_URL?: string;
  NODE_ENV: "development" | "production" | "test";
  PORT?: string;
  ALLOWED_ORIGINS?: string;
}

export const validateEnvironment = (): RequiredEnvVars => {
  const requiredVars = [
    "DB_URI",
    "CLOUD_NAME",
    "CLOUD_API_KEY",
    "CLOUD_SECRET_KEY",
    "ACCESS_TOKEN",
    "REFRESH_TOKEN",
  ];

  const missing = requiredVars.filter((envVar) => !process.env[envVar]);

  if (missing.length > 0) {
    console.error(
      `❌ Missing required environment variables: ${missing.join(", ")}`
    );
    process.exit(1);
  }

  // Validate JWT secrets strength in production
  if (process.env.NODE_ENV === "production") {
    const accessToken = process.env.ACCESS_TOKEN!;
    const refreshToken = process.env.REFRESH_TOKEN!;

    if (accessToken.length < 32 || refreshToken.length < 32) {
      console.error(
        "❌ JWT secrets must be at least 32 characters in production"
      );
      process.exit(1);
    }
  }

  return process.env as unknown as RequiredEnvVars;
};
