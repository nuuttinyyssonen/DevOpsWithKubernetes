const express = require('express');
require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 3000;

function generateRandomString(length = 16) {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const randomString = generateRandomString();

console.log(`Startup random string: ${randomString}`);

// Output it every 5 seconds with a timestamp
setInterval(() => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${randomString}`);
}, 5000);

app.get('/', (req, res) => {
  const timestamp = new Date().toISOString();
  res.send(`${timestamp}: ${randomString}`);
});

app.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`);
});