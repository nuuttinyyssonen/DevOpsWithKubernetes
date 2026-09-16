const express = require('express');
const fs = require('fs');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const statusFilePath = '/usr/src/app/files/status.txt';

app.get('/', async (req, res) => {
  let status;
  try {
    status = fs.readFileSync(statusFilePath, 'utf8').trim();
  } catch (err) {
    status = 'status not ready yet';
  }

  let count = '0';
  try {
    const response = await axios.get('http://ping-pong:4567/pings');
    count = response.data;
  } catch (err) {
    console.error('Failed to reach ping-pong:', err.message);
  }

  res.send(`${status}, Ping / Pongs: ${count}`);
});

app.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`);
});