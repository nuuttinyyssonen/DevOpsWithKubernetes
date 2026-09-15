const express = require('express');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5001;

const urlFilePath = '/usr/src/app/files/image-url.txt';
const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes

function generateNewImageUrl() {
  const randomSeed = Math.floor(Math.random() * 1000);
  const url = `https://picsum.photos/seed/${randomSeed}/1200`;
  fs.writeFileSync(urlFilePath, url);
  console.log(`New image URL set at ${new Date().toISOString()}: ${url}`);
}

if (!fs.existsSync(urlFilePath)) {
  generateNewImageUrl();
}

setInterval(generateNewImageUrl, REFRESH_INTERVAL);

app.get('/', (req, res) => {
  let imageUrl;
  try {
    imageUrl = fs.readFileSync(urlFilePath, 'utf8').trim();
  } catch (err) {
    imageUrl = '';
  }

  res.send(`
    <!DOCTYPE html>
    <html>
      <head><title>Todo App</title></head>
      <body>
        <h1>Todo app image!</h1>
        ${imageUrl ? `<img src="${imageUrl}" alt="Random image" width="400" />` : '<p>Image not ready yet</p>'}
      </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`);
});