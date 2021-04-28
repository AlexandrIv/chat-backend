import express from "express";
import * as http from "http";
import dotenv from "dotenv";

dotenv.config();

import "./core/db";
import createRoutes from "./core/routes";
import createSocket from "./core/socket";
import * as socket from "socket.io";

const app = express();
const server: http.Server = http.createServer(app);
const io: socket.Server = createSocket(server);

// TODO: При запуске сервера, передавать IO для работы с сокетами.
createRoutes(app, io);

server.listen(process.env.PORT, () => {
    console.log(`Server: http://localhost:${process.env.PORT}`);
});
