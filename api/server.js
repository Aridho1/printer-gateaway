import { Server } from "socket.io";
import { createServer } from "http";

let io; // biar nggak keinit 2x waktu cold start

export default function handler(req, res) {
	if (!io) {
		const httpServer = createServer();
		io = new Server(httpServer, {
			cors: { origin: "*" },
		});

		const clients = {};

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

		console.log("✅ Socket.IO gateway initialized on Vercel");
	}

	res.status(200).json({ message: "Socket.IO gateway running." });
}
