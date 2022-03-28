const express = require('express');
const router = express.Router();
const db = require('../services/db');

router.get('/', async function(req, res, next) {
  try {
    //res.json(await classRecords.getMultiple(req.query.page));
    res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
    const rows = await db.query(
      `SELECT lesson_name FROM lessons `
    );
    res.json(rows);
  } catch (err) {
    console.error(`Error while getting lessons `, err.message);
    next(err);
  }
});

module.exports = router;