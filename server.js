const express = require("express");
const { exec } = require("child_process");
const fs = require("fs");
const config = require("./src/data/config");
const syncData = require("./syncData");

const PORT = process.env.FLAX_EXPRESS_PORT
	? process.env.FLAX_EXPRESS_PORT
	: 3000;

const updateConfigurations = (updatedConfig) => {
	let currentConfig = config;
	let newConfig = { ...currentConfig, ...updatedConfig };
	fs.writeFile(
		"./src/data/config.json",
		JSON.stringify(newConfig),
		"utf8",
		(err) => {
			if (err) {
				console.error(err);
				return;
			}
			console.log("Data written to config file!");
		}
	);
};

const app = express();

app.use(express.json());

app.get("/healthcheck", (req, res) => {
	return res.status(200).json({
		message: "Looking good",
		...config,
	});
});

app.post("/rebuild", async (req, res) => {
	let updatedConfig = req.body.updatedConfig;
	if (updatedConfig) {
		updateConfigurations(updatedConfig);
	}

	let buildConfigs = req.body.buildConfigs ? req.body.buildConfigs : {};
	await syncData(buildConfigs);

	exec("npx eleventy", (error, stdout, stderr) => {
		if (error) {
			console.error(`Error rebuilding Eleventy app: ${error.message}`);
			return res.status(500).json({ error: "Failed to rebuild the app" });
		}
		return res.status(200).json({ message: "Flax site rebuilt successfully." });
	});
});

// Start the server
app.listen(PORT, () => {
	console.log(
		`Flax and Express server running on port 8080 and ${PORT} respectively.`
	);
});
