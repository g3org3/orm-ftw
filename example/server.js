const express = require('express');
const app = express();
const port = 3000;
const db = require('./db');
app.get('/', (req, res) => res.send('Hello World!'));

app.get('/shoe', (req, res) => {
  db.Shoe.find({}).then(shoes => res.json(shoes));
});

app.get('/shoe/create/:name', (req, res) => {
  const { name } = req.params;
  db.Shoe.create({ name, createdAt: new Date(), deletedAt: null }).then(shoe => {
    res.json({ shoe });
  });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
