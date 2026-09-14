const express = require('express');
require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 3000;

let counter = 0

app.get('/pingpong', (req, res, next) => {
    counter += 1
    res.send(`pong ${counter}`);
});

app.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`);
});