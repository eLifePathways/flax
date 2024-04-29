const express = require("express");
const groupController = require("./controllers/groupController");
const { authenticate } = require("./helpers");

const PORT = process.env.FLAX_EXPRESS_PORT
	? process.env.FLAX_EXPRESS_PORT
	: 3009;

const app = express();

app.use(express.json());

app.get("/healthcheck", (req, res) =>
	res.status(200).json({ message: "Looking good" })
);
app.post("/rebuild", authenticate, groupController.rebuild);
app.post("/create-group", authenticate, groupController.createGroup);
app.post("/rebuild-group", authenticate, groupController.rebuildGroup);
app.post("/delete-group", authenticate, groupController.deleteGroup);

// Start the server
app.listen(PORT, async () => {
	console.log(
		`Flax and Express server running on port 8080 and ${PORT} respectively.`
	);
	console.log('Rebuilding Flax site upon startup...')
	await groupController.setupSiteForGroups();
});
