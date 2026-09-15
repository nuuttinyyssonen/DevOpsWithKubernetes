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
      <head>
        <title>Todo App</title>
        <style>
          body {
            font-family: Arial, Helvetica, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 40px 20px;
            background: #ffffff;
            color: #333;
          }
          h1, h2 {
            text-align: center;
          }
          img {
            width: 300px;
            height: 300px;
            object-fit: cover;
            border-radius: 12px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
            margin-bottom: 30px;
          }
          .input-row {
            display: flex;
            gap: 10px;
            margin-bottom: 30px;
            width: 100%;
            max-width: 600px;
          }
          .input-row input {
            flex: 1;
            padding: 12px;
            border: 2px solid #6aa84f;
            border-radius: 6px;
            font-size: 16px;
          }
          .input-row button {
            padding: 12px 24px;
            background-color: #6aa84f;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 16px;
            cursor: pointer;
          }
          .todo-list {
            width: 100%;
            max-width: 600px;
          }
          .todo-item {
            background: #f7f7f7;
            border-left: 4px solid #6aa84f;
            padding: 16px;
            margin-bottom: 10px;
            border-radius: 4px;
            font-size: 16px;
          }
        </style>
      </head>
      <body>
        <h1>Todo App</h1>

        ${imageUrl ? `<img src="${imageUrl}" alt="Random image" />` : '<p>Image not ready yet</p>'}

        <div class="input-row">
          <input type="text" placeholder="Enter a new todo (max 140 characters)" maxlength="140" />
          <button>Send</button>
        </div>

        <h2>Todos</h2>
        <div class="todo-list">
          <div class="todo-item">Learn Kubernetes basics</div>
          <div class="todo-item">Deploy application to cluster</div>
          <div class="todo-item">Configure persistent volumes</div>
        </div>
      </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`);
});