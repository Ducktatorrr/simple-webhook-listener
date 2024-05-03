const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const server = http.createServer(app);

const APP_URL = process.env.APP_URL;

// Apply consistent CORS policy for both Express and Socket.IO
const corsOptions = {
	origin: APP_URL,
	methods: ["GET", "POST"],
	credentials: true,
};

app.use(cors(corsOptions)); // Apply CORS with the options
app.use(express.json());

// Configure Socket.IO with CORS
const io = socketIo(server, { cors: corsOptions });

io.on("connection", (socket) => {
	console.log("New client connected");
	socket.on("disconnect", () => {
		console.log("Client disconnected");
	});
});

// Error handling middleware for async operations
const asyncHandler = (fn) => (req, res, next) =>
	Promise.resolve(fn(req, res, next)).catch(next);

app.post(
	"/",
	asyncHandler(async (req, res) => {
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
			method: req.method,
			headers: req.headers,
			body: req.body,
			timestamp: timestamp,
			host: isLocalhost ? "localhost" : host,
		};
		console.log("Received webhook:", data);
		io.emit("webhook_data", data);
		res.status(200).send({ message: "Webhook received" });
	})
);

// Error handling middleware
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).send("Something went wrong!");
});

// Serve
const PORT = 3000;
server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
