const express = require('express');
const fs = require('fs');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const statusFilePath = '/usr/src/app/files/status.txt';
const infoFilePath = '/usr/src/app/config/information.txt';
const pingPongUrl = process.env.PING_PONG_URL || 'http://ping-pong:80/pings';

app.get('/', async (req, res) => {
  let status;
  try {
    status = fs.readFileSync(statusFilePath, 'utf8').trim();
  } catch (err) {
    status = 'status not ready yet';
  }

  let count = '0';
  try {
    const response = await axios.get(pingPongUrl);
    count = response.data;
  } catch (err) {
    console.error('Failed to reach ping-pong:', err.message);
  }

  let fileContent;
  try {
    fileContent = fs.readFileSync(infoFilePath, 'utf8').trim();
  } catch (err) {
    fileContent = 'file not found';
  }

  const message = process.env.MESSAGE || 'not set';

  res.send(
    `file content: ${fileContent}\n` +
    `env variable: MESSAGE=${message}\n` +
    `${status}, Ping / Pongs: ${count}`
  );
});

app.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`);
});