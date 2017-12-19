const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const Food = require('./food');

const server = express();
server.use(bodyParser.json());
server.use(morgan('combined'));

server.post('/food', (req, res) => {
  const { title } = req.body;
  const newFood = new Food({ title });
  newFood.save((err, savedFood) => {
    if (err) {
      res.status(422);
      res.json({ err: err.message });
      return;
    }
    res.json(savedFood);
  });
});

server.get('/food', (req, res) => {
  Food.find({}, (err, foods) => {
    if (err) return res.status(500).json(err);
    res.json(foods);
  });
});

module.exports = server;
