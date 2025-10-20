{
  "apps": [
    {
      "name": "whatsapp-api",
      "script": "src/server.js",
      "instances": 1,
      "exec_mode": "fork",
      "env": {
        "NODE_ENV": "production",
        "PORT": 3000,
        "WHATSAPP_SESSION_PATH": "./sessions",
        "WHATSAPP_LOG_LEVEL": "info"
      },
      "env_production": {
        "NODE_ENV": "production",
        "PORT": 3000,
        "WHATSAPP_SESSION_PATH": "./sessions",
        "WHATSAPP_LOG_LEVEL": "warn"
      },
      "log_file": "./logs/combined.log",
      "out_file": "./logs/out.log",
      "error_file": "./logs/error.log",
      "log_date_format": "YYYY-MM-DD HH:mm:ss Z",
      "merge_logs": true,
      "max_memory_restart": "1G",
      "node_args": "--max-old-space-size=1024",
      "watch": false,
      "ignore_watch": ["node_modules", "logs", "sessions"],
      "restart_delay": 4000,
      "max_restarts": 10,
      "min_uptime": "10s"
    }
  ]
}
