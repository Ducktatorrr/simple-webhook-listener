const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const server = http.createServer(app);

const SERVER_URL = process.env.SERVER_URL;

// Configure Socket.IO with CORS
const io = socketIo(server, {
	cors: {
		origin: SERVER_URL, // Allow only the origin where your Svelte app is running
		methods: ["GET", "POST"],
		allowedHeaders: ["my-custom-header"],
		credentials: true,
	},
});

app.use(express.json());
app.use(express.static("public")); // Serve static files from 'public' directory
app.use(cors()); // This enables CORS for regular routes

io.on("connection", (socket) => {
	console.log("New client connected");
	socket.on("disconnect", () => {
		console.log("Client disconnected");
	});
});

app.post("/webhook", (req, res) => {
	const timestamp = new Date().toLocaleString("en-US", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
	});
	const host = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
	const isLocalhost =
		host === "::1" || host === "::ffff:127.0.0.1" || host === "127.0.0.1";
	const data = {
		headers: req.headers,
		body: req.body,
		timestamp: timestamp,
		host: isLocalhost ? "localhost" : host,
	};
	console.log("Received webhook:", data);
	io.emit("webhook_data", data); // Emit data to all connected clients
	res.status(200).send("Webhook received");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
