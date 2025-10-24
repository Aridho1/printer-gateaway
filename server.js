import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
	cors: { origin: "*" }, // biar bisa diakses dari web cpanel kamu
});

const clients = {}; // { clientId: { web: socketId, printer: socketId } }

io.on("connection", (socket) => {
	console.log("Client connected:", socket.id);

	socket.on("register", ({ role, clientId }) => {
		if (!clients[clientId]) clients[clientId] = {};
		clients[clientId][role] = socket.id;
		console.log(`[REGISTER] ${clientId} (${role})`);
	});

	socket.on("print", ({ clientId, text }) => {
		const printerSocket = clients[clientId]?.printer;
		if (printerSocket) {
			io.to(printerSocket).emit("print", { text });
			console.log(`[PRINT] ${clientId}: ${text}`);
		} else {
			console.log(`[WARN] No printer for ${clientId}`);
		}
	});

	socket.on("disconnect", () => {
		console.log(`[DISCONNECT] ${socket.id}`);
	});
});

httpServer.listen(3000, () => console.log("🚀 Print Gateway ready on port 3000"));
