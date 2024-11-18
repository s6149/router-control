module.exports = {
  apps: [{
    name: "router-control",
    script: "./src/app.js",
    watch: true,
    env: {
      "NODE_ENV": "production",
      "PORT": 3000
    },
    error_file: "logs/error.log",
    out_file: "logs/output.log",
    time: true,
    exec_mode: "fork",
    instances: 1
  }]
};