const express = require('express');
const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

let todos = [];

app.get('/todos', (req, res) => {
    res.json(todos);
});

app.post('/todos', (req, res) => {
    const { text } = req.body;
    if (!text || text.length > 140) {
        return res.status(400).json({ error: 'Todo text is required and must be 140 characters or fewer' });
    }

    const newTodo = {
        id: todos.length + 1,
        text,
    };

    todos.push(newTodo);
    res.status(201).json(newTodo);
});

app.listen(PORT, () => {
    console.log(`Server started in port ${PORT}`);
});