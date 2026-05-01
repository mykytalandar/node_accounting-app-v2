'use strict';

const express = require('express');
const cors = require('cors');
const usersRouter = require('./routes/users.route.js');
const usersService = require('./services/users.service.js');

function createServer() {
  // Use express to create a server
  // Add a routes to the server
  // Return the server (express app)

  const app = express();

  let expenses = [];

  app.use(cors());
  app.use('/users', express.json(), usersRouter);

  app.get('/expenses', express.json(), (req, res) => {
    const { userId, categories, from, to } = req.query;

    if (userId) {
      expenses = expenses.filter((expense) => expense.userId === +userId);
    }

    if (categories) {
      expenses = expenses.filter(
        (expense) =>
          expense.category.toLowerCase() === categories.toLowerCase(),
      );
    }

    if (from || to) {
      const filtered = expenses.filter((expense) => {
        const expenseDate = new Date(expense.spentAt);

        if (from && expenseDate < new Date(from)) {
          return false;
        }

        if (to && expenseDate > new Date(to)) {
          return false;
        }

        return true;
      });

      expenses = filtered;
    }

    res.send(expenses);
  });

  app.post('/expenses', express.json(), (req, res) => {
    const { userId, spentAt, title, amount, category, note } = req.body;

    if (!userId || !usersService.getUserById(userId)) {
      res.statusCode = 400;
      res.send('Bad request');

      return;
    }

    if (!spentAt || !title || !amount || !category || !note) {
      res.statusCode = 400;
      res.send('Bad request');

      return;
    }

    const expense = {
      id: expenses.length + 1,
      userId,
      spentAt,
      title,
      amount,
      category,
      note,
    };

    expenses.push(expense);

    res.statusCode = 201;

    res.send(expense);
  });

  app.get('/expenses/:id', (req, res) => {
    const { id } = req.params;

    if (isNaN(Number(id))) {
      res.statusCode = 400;
      res.send('Bad request');

      return;
    }

    const expense = expenses.find((e) => e.id === +id);

    if (!expense) {
      res.statusCode = 404;
      res.send('Not found');

      return;
    }

    res.send(expense);
  });

  app.delete('/expenses/:id', (req, res) => {
    const { id } = req.params;

    const expense = expenses.find((e) => e.id === +id);

    if (!expense) {
      res.statusCode = 404;
      res.send('Not found');

      return;
    }

    expenses = expenses.filter((e) => e.id !== +id);

    res.sendStatus(204);
  });

  app.patch('/expenses/:id', express.json(), (req, res) => {
    const { id } = req.params;

    if (isNaN(Number(id))) {
      res.statusCode = 400;
      res.send('Bad request');

      return;
    }

    const { spentAt, title, amount, category, note } = req.body;

    const expense = expenses.find((e) => e.id === +id);

    if (!expense) {
      res.statusCode = 404;
      res.send('Not found');

      return;
    }

    if (spentAt !== undefined) {
      expense.spentAt = spentAt;
    }

    if (title !== undefined) {
      expense.title = title;
    }

    if (amount !== undefined) {
      expense.amount = amount;
    }

    if (category !== undefined) {
      expense.category = category;
    }

    if (note !== undefined) {
      expense.note = note;
    }

    res.send(expense);
  });

  return app;
}

module.exports = {
  createServer,
};

/*

{

POST

  "userId": 1,
  "spentAt": "2026-05-01T00:05:55.169Z",
  "title": "banana",
  "amount": 10,
  "category": "food",
  "note": "ok"

  "spentAt": "2026-04-30T23:01:49.212Z",
  "title": "banana",
  "amount": 6,
  "category": "food",
  "note": "ok"


PATCH

  "spentAt": "2026-05-01T00:01:55.177Z",
  "title": "banana",
  "amount": 10,
  "category": "food",
  "note": "ok"

}

*/
