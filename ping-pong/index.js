const express = require('express');
const fs = require('fs');  
require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 3000;
const filePath = '/usr/src/app/files/pingpong-counter.txt';

let counter = 0

try {
  counter = parseInt(fs.readFileSync(filePath, 'utf8'), 10) || 0;
} catch (err) {
  counter = 0;
}

app.get('/pingpong', (req, res, next) => {
    counter += 1
    fs.writeFileSync(filePath, counter.toString());
    res.send(`pong ${counter}`);
});

app.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`);
});