const log4js = require('log4js');

log4js.configure({
    appenders: {
        cheese: { type: "file", filename: "./src/log/app.log" },
        console: { type: 'console' }
    },
    categories: { default: { appenders: ["cheese", "console"], level: "all" } },
});

const logger = log4js.getLogger();
logger.level = "all";

module.exports = logger;