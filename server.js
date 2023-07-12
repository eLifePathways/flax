const express = require("express");
const { exec } = require("child_process");
const RequestIp = require("@supercharge/request-ip");
const fs = require("fs");
const config = require("./src/data/config");
const syncData = require("./syncData");
const dns = require("dns");
const util = require("util");

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

const isAddressAllowed = async (extractedIpAddress) => {
	const allowedHosts = process.env.FLAX_ALLOWED_IPS.split(",");
	const lookupPromise = util.promisify(dns.lookup);
	let resolvedAddress;
	let finalIPAddress;
	let isAllowed = false;

	if (allowedHosts.includes("*")) {
		return true;
	}

	for (const hostname of allowedHosts) {
		try {
			resolvedAddress = await lookupPromise(hostname);
			finalIPAddress = resolvedAddress?.address?.substring(
				0,
				resolvedAddress?.address?.lastIndexOf(".")
			);
			if (extractedIpAddress.startsWith(finalIPAddress)) {
				isAllowed = true;
				break;
			}
		} catch (error) {
			console.error(error);
		}
	}
	return isAllowed;
};

const isAuthenticated = async (req) => {
	const extractedIpAddress = RequestIp.getClientIp(req).split(":").pop();
	const checkAllowed = await isAddressAllowed(extractedIpAddress);

	return checkAllowed;
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
	if (!(await isAuthenticated(req))) {
		return res.status(500).json({ error: "IP didn't match... !" });
	}

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
