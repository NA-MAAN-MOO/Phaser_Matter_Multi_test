const express = require("express"); // Load in express module
const app = express();
const http = require("http"); // Load in http module
const httpServer = http.createServer(app);

const { Server } = require("socket.io"); // Load in socket.io
const io = new Server(httpServer); // initialize socket instance (passing httpserver)

app.use("/js", express.static(__dirname + "/js"));
app.use("/assets", express.static(__dirname + "/assets"));
app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));

// Store a list of all the players
let players = [];

httpServer.listen(5000);

io.on("connection", (socket) => {
    // socket이 연결됩니다~ 이 안에서 서버는 연결된 클라이언트와 소통할 준비가 됨
    console.log("a user connected");
    console.log(players.length);
    let playerInfo = {
        socket: socket,
        socketId: socket.id,
        x: 200,
        y: 200,
    };
    // The payload to be sent back to the client
    const payLoad = {
        socketId: socket.id,
        x: 200,
        y: 200,
    };
    // Send back the payload to the client and set its initial position
    socket.emit("start", payLoad);
    // Send back the payload to the client and set its initial position
    players.forEach((player) => {
        const payLoad = {
            socketId: socket.id,
            x: player.x,
            y: player.y,
        };
        player.socket.emit("newPlayer", payLoad);
    });

    players.push(playerInfo);

    socket.on("disconnect", () => {
        // socket이 연결 해제됩니다~
        console.log("user disconnected!!!");
        socket.broadcast.emit("playerDisconnect", socket.id);
        // players.forEach((player) => {
        //     if (player.socketId !== socket.id) {
        //         player.socket.emit("playerDisconnect", socket.id);
        //     }
        // });
        players = players.filter((player) => player.socketId !== socket.id);
    });

    socket.on("currentPlayers", () => {
        players.forEach((player) => {
            if (player.socketId !== socket.id) {
                const payLoad = {
                    socketId: player.socketId,
                    x: player.x,
                    y: player.y,
                };
                socket.emit("currentPlayers", payLoad);
            }
        });
    });

    socket.on("movement", (xy) => {
        const payLoad = {
            socketId: socket.id,
            x: xy.x,
            y: xy.y,
            motion: xy.motion,
        };
        socket.broadcast.emit("updateLocation", payLoad);
        playerInfo.x = xy.x;
        playerInfo.y = xy.y;
        // players.forEach((player) => {
        //     if (player.socketId !== socket.id) {

        //         player.socket.emit("updateLocation", payLoad);
        //     } else {
        //         player.x = xy.x;
        //         player.y = xy.y;
        //     }
        // });
    });
});
