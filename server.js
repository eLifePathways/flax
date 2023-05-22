const express = require('express');
const { execSync } = require('child_process');

const app = express();

const port = 8080;

app.use(express.static('public'));

// Define a route for triggering the rebuild
app.post('/rebuild', (req, res) => {
  try {
    // Trigger the Eleventy rebuild process
    execSync('npx eleventy');

    // Send a success response
    res.status(200).send('Eleventy site rebuilt successfully!');
  } catch (error) {
    // Send an error response
    res.status(500).send('Error occurred while rebuilding Eleventy site');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});