<script>
	import { onMount } from "svelte";
	import io from "socket.io-client";
	import Prism from "prismjs";
	import "prismjs/components/prism-json.min";
	import "prismjs/themes/prism-tomorrow.css";
	import "./styles.css";

	// Load environment variables
	// Initialize variables
	let data = [];			// Data received from the server stored in an array so it's gone on page refresh
	let requestCounter = 0;	// Counter to assign unique id to each request
	let selectedId = null;	// State to keep track of selected request

	// Get the server URL from the environment variables
	const API_URL = __api_url__;
	console.log("API_URL:", API_URL);

	// Connect to the server and listen for incoming data
	onMount(() => {
		const socket = io(API_URL);
		socket.on("connect", () => {
			console.log("Connected to the server");
		});
		// Listen for incoming data and add it to the data array
		socket.on("webhook_data", (newData) => {
			requestCounter += 1;
			const newDataWithId = { ...newData, id: requestCounter };
			data = [newDataWithId, ...data];
		});
	});

	// Function to select a request from the data array
	function selectData(id) {
		selectedId = id;
	}

	// Function to delete a request from the data array
	function deleteData(id) {
		data = data.filter((item) => item.id !== id);
		if (selectedId === id) {
			selectedId = null;
		}
	}

	// Function to handle keyboard events for accessibility
	function handleKeydown(event, id) {
		if (event.key === "Enter" || event.key === " ") {
			selectData(id);
		}
	}

	// Function to highlight JSON syntax using Prism to make the JSON ✨ pretty ✨
	function prismHighlight(node) {
		const json = JSON.parse(node.textContent);
		Prism.highlightElement(node, false, () =>
			Prism.highlight(JSON.stringify(json), Prism.languages.json)
		);
	}

	// Function to copy the raw JSON body to the clipboard
	function copyJsonBody() {
		const selectedBody = data.find((d) => d.id === selectedId)?.body;
		if (selectedBody) {
			navigator.clipboard.writeText(JSON.stringify(selectedBody, null, 2));
		}
	}
	
	// Function to generate and copy cURL command from the selected request data
	function copyCurlCommand() {
		console.log("Attempting to copy cURL command...");
		const requestData = data.find(d => d.id === selectedId);
		if (!requestData) {s
			console.log("No request data found.");
			return;
		}

		const { method, url, headers, body } = requestData;

		// Start building the cURL command
		let curlCmd = `curl -X ${method.toUpperCase()} '${API_URL}'`;	// We take API_URL directly from the environment variables
																		// because our CORS policy for the API server only allows requests from this URL
																		// so we can assume that the API server is at this URL

		// Add headers to the cURL command
		Object.entries(headers).forEach(([key, value]) => {
			if (key.toLowerCase() !== 'content-length') { // Exclude Content-Length header to avoid hanging
				curlCmd += ` -H '${key}: ${value}'`;
			}
		});

		// Add request body if applicable
		if (body && Object.keys(body).length > 0) {
			const bodyData = JSON.stringify(body);
			curlCmd += ` -d '${bodyData}'`;
		}

		// Copy to clipboard
		navigator.clipboard.writeText(curlCmd).then(() => {
			console.log('cURL command copied to clipboard!');
		}).catch(err => {
			console.error('Failed to copy cURL command:', err);
		});
	}

</script>

<h1>Simple Webhook Listener</h1>

<div class="container">
	<div id="sidebar">
		{#each data as item (item.id)}
			<div
				class="request-item {selectedId === item.id ? 'selected' : ''}"
				tabindex="0"
				role="button"
				on:click={() => selectData(item.id)}
				on:keydown={(event) => handleKeydown(event, item.id)}
			>
				Request #{item.id} <br />
				<span class="host-ip">From: {item.host}</span><br />
				<span class="timestamp">{item.timestamp}</span>
				<span
					class="delete-button"
					on:click|stopPropagation={() => deleteData(item.id)}
					on:keydown={(event) => handleKeydown(event, item.id)}
				>
					&#x2716;
				</span>
			</div>
		{/each}
	</div>

	<div id="main">
		{#if data.length > 0}
			{#if selectedId}
				<div id="request-details">
					<div class="button-container">
						<button on:click={copyCurlCommand}>Copy as cURL</button>
					</div>
					<div id="headers">
						<table>
							<thead>
								<tr>
									<th>Header Key</th>
									<th>Header Value</th>
								</tr>
							</thead>
							<tbody>
								{#each Object.entries(data.find((d) => d.id === selectedId)?.headers || {}) as [key, value]}
									<tr>
										<td>{key}</td>
										<td>{value}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
					<div id="json" class="json-block">
						<pre><code class="language-json" use:prismHighlight
								>{JSON.stringify(
									data.find((d) => d.id === selectedId)?.body || {},
									null,
									2
								)}</code
							></pre>
						<div class="button-container">
							<button on:click={copyJsonBody}>Copy JSON Body</button>
						</div>
					</div>
				</div>
			{:else}
				<p>You've received request! Select one from the sidebar to inspect.</p>
			{/if}
		{:else}
			<p>No data received yet.</p>
		{/if}
	</div>
</div>

<footer>
	<p>
		Made with 🦆 by 🦆 - <a href="https://github.com/Ducktatorrr/simple-webhook-listener" target="_blank" rel="noopener noreferrer">Peep Code & Contribute</a>
	</p>
</footer>

<!-- global override styles -->
<style>
	:global(body) {
		display: flex;
		flex-direction: column;
		font-family: Arial, sans-serif;
		color: #ccc;
		background-color: #333;
		margin: 0;
		padding: 0;
		min-height: 100vh;
  	}

	.request-item:hover,
	:global(.request-item.selected) {
		background-color: #444;
	}

	:global(.json-block pre) {
		margin: 0;
		padding: 10px;
	}

	:global(.json-block code) {
		font-family: "Fira Code", "Roboto Mono", "Courier New", monospace;
	}

	:global(.token.property) {
		color: #9cdcfe;
	}

	:global(.token.string) {
		color: #ce9178;
	}

	:global(.token.null) {
		color: #fc618d;
	}

	:global(.token.number) {
		color: #b5cea8;
	}

	:global(.token.boolean) {
		color: #d7ba7d;
	}
</style>
