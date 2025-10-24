import { Server } from "socket.io";

let io;

export default function handler(req, res) {
	if (!io) {
		console.log("🚀 Socket.IO server starting...");

		io = new Server(res.socket.server, {
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
	}

	res.end();
}
