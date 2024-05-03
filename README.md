# Simple Webhook Listener

As the repository title says, a simple webhook listener with Svelte app frontend to view the contents of the sent requests. Handy for debugging, previewing, or collecting data you're POSTing.

![alt text](/images/screenshot.png)

## About

I created this project as an exercise to explore Svelte and for personal use to avoid relying on online services for inspecting POST request data. Contributions are always welcome!

Please note: the requests are stored in an array at the app level. If you refresh the page or restart the app the data will reset. Will move this over to the server side eventually.

## Setup

### Cloning & Installing

To set up this project, clone the repository and run the following commands:

```bash
git clone https://github.com/Ducktatorrr/simple-webhook-listener.git
cd simple-webhook-listener
npm install
```

### Seting up environment variable

In /api and /app there are .env.example files.
Make a copy of these files and rename them `.env`
Here you will note where your API and Svelte App would be running.
The default values in the example are already correctly set for you to run the start command for local usage.

### Rock & Rolling (locally)

To then run the API + Svelte App locally run the follow command:

```bash
npm start
```

Both the API server and Svelte App should will start up.
Now open the Svelte App by visiting `http://localhost:8080/` in your browser.
To make sure everything works make a test POST request to the API:

```bash
curl -X POST -H "Content-Type: application/json" -d '{"Ayo": "World"}' http://localhost:3000
```

## License

This project is licensed under the MIT License - see the [LICENSE](/LICENSE) file for details.
