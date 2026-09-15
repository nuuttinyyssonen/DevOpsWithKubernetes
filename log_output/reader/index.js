const express = require('express');
const fs = require('fs');
const app = express();

const PORT = process.env.PORT || 3000;
const filePath = '/usr/src/app/files/status.txt';

app.get('/', (req, res) => {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('File not ready yet');
    }
    res.send(data);
  });
});

app.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`);
});