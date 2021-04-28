import * as http from "http";
import * as socket from "socket.io";

export default (server: http.Server) => {
    const io: socket.Server = new socket.Server(server,{
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: [
                'Origin',
                'X-Requested-With',
                'Content-Type',
                'Accept',
                'X-Access-Token',
            ],
            credentials: true
        }
    });

    io.on('connection', (socket: socket.Socket) => {
        //
    });

    return io;
}
