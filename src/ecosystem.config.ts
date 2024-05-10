module.exports = {
    apps : [{
      script    : "server.js",
      instances : "3",
      exec_mode : "cluster"
    }]
}