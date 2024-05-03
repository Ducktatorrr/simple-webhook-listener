<script>
	import { onMount } from "svelte";
	import io from "socket.io-client";
	import Prism from "prismjs";
	import "prismjs/components/prism-json.min";
	import "prismjs/themes/prism-tomorrow.css";
	import "./styles.css";

	let data = [];
	let requestCounter = 0;
	let selectedId = null;
	const SERVER_URL = process.env.SERVER_URL;

	onMount(() => {
		const socket = io(SERVER_URL);
		socket.on("connect", () => {
			console.log("Connected to the server");
		});
		socket.on("webhook_data", (newData) => {
			requestCounter += 1;
			const newDataWithId = { ...newData, id: requestCounter };
			data = [newDataWithId, ...data];
		});
	});

	function selectData(id) {
		selectedId = id;
	}

	function deleteData(id) {
		data = data.filter((item) => item.id !== id);
		if (selectedId === id) {
			selectedId = null;
		}
	}

	function handleKeydown(event, id) {
		if (event.key === "Enter" || event.key === " ") {
			selectData(id);
		}
	}

	function prismHighlight(node) {
		const json = JSON.parse(node.textContent);
		Prism.highlightElement(node, false, () =>
			Prism.highlight(JSON.stringify(json), Prism.languages.json)
		);
	}

	function copyJsonBody() {
		const selectedBody = data.find((d) => d.id === selectedId)?.body;
		if (selectedBody) {
			navigator.clipboard.writeText(JSON.stringify(selectedBody, null, 2));
		}
	}
</script>

<div id="sidebar">
	{#each data as item (item.id)}
		<div
			class="request-item {selectedId === item.id ? 'selected' : ''}"
			tabindex="0"
			role="button"
			on:click={() => selectData(item.id)}
			on:keydown={(event) => handleKeydown(event, item.id)}
		>
			Request #{item.id}
			<br />
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
			<div id="headers">
				<table>
					<tr>
						<th>Header Key</th>
						<th>Header Value</th>
					</tr>
					{#each Object.entries(data.find((d) => d.id === selectedId)?.headers || {}) as [key, value]}
						<tr>
							<td>{key}</td>
							<td>{value}</td>
						</tr>
					{/each}
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
		{:else}
			<p>You've received request! Select one from the sidebar to inspect.</p>
		{/if}
	{:else}
		<p>No data received yet.</p>
	{/if}
</div>

<!-- global override styles -->
<style>
	.delete-button {
		display: none;
		color: #fc618d;
		cursor: pointer;
		float: right;
		margin-right: 5px;
	}

	.request-item:hover .delete-button {
		display: inline-block;
	}
	:global(body) {
		display: flex;
		font-family: Arial, sans-serif;
		color: #ccc;
		background-color: #333;
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
