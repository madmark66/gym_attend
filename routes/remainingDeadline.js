const express = require('express');
const router = express.Router();
const db = require('../services/db');

router.get('/', async function(req, res, next) {
  try {
    
    res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
    const rows = await db.query(
      `SELECT lesson_name FROM lessons ` //產生一個包含學員剩餘堂數/上課期限/上課日期的API(SQL query)
    );
    res.json(rows);
  } catch (err) {
    console.error(`Error while getting lessons `, err.message);
    next(err);
  }
});

module.exports = router;