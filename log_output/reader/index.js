const express = require('express');
const fs = require('fs');
const app = express();

const PORT = process.env.PORT || 3000;
const statusFilePath = '/usr/src/app/files/status.txt';
const counterFilePath = '/usr/src/app/files/pingpong-counter.txt';

app.get('/', (req, res) => {
  let status;
  try {
    status = fs.readFileSync(statusFilePath, 'utf8').trim();
  } catch (err) {
    status = 'status not ready yet';
  }

  let counter;
  try {
    counter = fs.readFileSync(counterFilePath, 'utf8').trim();
  } catch (err) {
    counter = '0';
  }

  res.send(`${status}, Ping / Pongs: ${counter}`);
});

app.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`);
});