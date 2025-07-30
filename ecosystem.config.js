module.exports = {
  apps: [
    {
      name: "puskesmas-api",
      script: "server.ts",
      interpreter: "tsx",
      instances: "max", // Gunakan semua CPU cores
      exec_mode: "cluster",
      env: {
        NODE_ENV: "development",
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 5000,
      },
      // Monitoring
      max_memory_restart: "1G",
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      log_file: "./logs/pm2-combined.log",
      time: true,

      // Auto restart
      watch: false,
      ignore_watch: ["node_modules", "logs"],

      // Health monitoring
      min_uptime: "10s",
      max_restarts: 10,

      // Environment specific
      node_args: "--max-old-space-size=1024",
    },
  ],
};
