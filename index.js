"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const cron = require("node-cron");
const cors = require("cors");
const log4js = require("log4js");
const mongoose = require("mongoose");
const index_1 = __importDefault(require("./routes/index"));
const cron_1 = __importDefault(require("./controllers/common/cron"));
const sensor_1 = __importDefault(require("./controllers/user/sensor"));
const morgan = require("morgan");
// config();
var port = process.env.PORT;
log4js.configure({
    appenders: {
        everything: {
            type: "dateFile",
            filename: "./logger/all-the-logs.log",
            maxLogSize: 10485760,
            backups: 3,
            compress: true,
        },
    },
    categories: {
        default: { appenders: ["everything"], level: "debug" },
    },
});
// Router Prefix Setup
express.application.prefix = express.Router.prefix = function (path, configure) {
    var router = express.Router();
    this.use(path, router);
    configure(router);
    return router;
};
// prefix Over
const app = express();
app.use(morgan(":method :url :response-time"));
// prefix start
// body mathi data get  karva start
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// body mathi data get  karva over
app.set("view engine", "ejs");
const corsOptions = {
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    optionSuccessStatus: 200,
};
app.use(express.static('uploads'));
app.use('/uploads', express.static('uploads'));
app.use(cors(corsOptions)); // Use this after the variable declaration
// start route
app.get("/api/", function (req, res) {
    res.send("Hello World!123");
});
app.use("/api", index_1.default);
const server = http.createServer(app);

const dbUrl = "mongodb+srv://sarmistha1:sarmistha@cluster0.npn1qmh.mongodb.net/store";

server.listen(4000, async (req, res) => {
    if (process.env.MONGO_URI || true) {
        await mongoose.connect(dbUrl);
        console.log(`Successfully connected to MongoDB 👍`);
    }
    console.log("Server is running on Port: " + 4000);
    // logger.info('Express server started on port: ' + port);
});
server.timeout = 90000;
// // daily data base backup and send email
cron.schedule("0 0 */3 * *", async () => {
    await cron_1.default.removeLogger();
});
// daily data base backup and send email
// cron.schedule("15 0 * * *", async () => {
//     await cronService.databaseBackup();
//     await cronService.autoCancelledAfter12Month();
//     await cronService.serviceAutoCancelAfter30Day();
// });
// cron.schedule("* * * * *", async () => {
//     // all monite after delete this 
//     await cronService.autoCancelledAfter12Month();
// });
// Cron job every night at midnight is a commonly used cron schedule.
// cron.schedule("0 0 * * *", async () => {
//     await cronService.serviceAutoClose();
//     await cronService.destroyToken(); // remove auto token 
//     console.log("Database device token  delete ");
//     console.log("Cron job every night at midnight is a commonly used cron schedule.  ");
// });
cron.schedule('0 0 * * *', async () => {
    // await cronService.serviceAutoCancelAfter30Day();
    await sensor_1.default.deleteSensorDataPassedDays();
    console.log('cronjob');
});
// cron.schedule("* * * * * *", async () => {
//     await cronService.randomDataUpdate();
// // update data here
// });
