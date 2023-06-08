const express = require('express');
const { exec } = require('child_process');
const fs = require("fs");
const config = require('./src/data/config');

const PORT = 3000;

const updateConfigurations = (updatedConfig) => {
  let currentConfig = config
  console.log({currentConfig})
  let newConfig = {...currentConfig, ...updatedConfig};
  fs.writeFile("./src/data/config.json", JSON.stringify(newConfig), 'utf8',
    (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log("Data written to file neuroscience.json!");
    }
  );
}

const rebuildSite = () => {
  exec('npx eleventy', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error rebuilding Eleventy app: ${error.message}`);
      return false
    }
    console.log("Flax site has been rebuild successfully.")
    return true;
  });
}

const app = express();

app.use(express.json());

app.get('/healthcheck', (req, res) => {
  return res.status(200).json({ 
    message: 'Looking good',
    ...config
  });
});

app.post('/rebuild', (req, res) => {
  console.log("req.body express", req.body)
  let updatedConfig = req.body.updatedConfig
  if(updatedConfig) {
    updateConfigurations(updatedConfig)
  }
  // Rebuild the Eleventy app
  exec('npx eleventy', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error rebuilding Eleventy app: ${error.message}`);
      return res.status(500).json({ error: 'Failed to rebuild the app' });
    }
    return res.status(200).json({ message: 'Flax site rebuilt successfully.' });
  });
});

// Start the server
app.listen(PORT, () => {
  // We can not rebuild the site until the client is up and running. 
  // So might fix this by putting entry point file and wait for the server to up.
  setTimeout(rebuildSite, 60000);
  console.log(`Flax and Express server running on port 8080 and ${PORT} respectively.`);
});