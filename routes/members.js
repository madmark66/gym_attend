const express = require('express');
const router = express.Router();
const classRecords = require('../services/classRecords');
const db = require('../services/db');

router.get('/', async function(req, res, next) {
  try {
    //res.json(await classRecords.getMultiple(req.query.page));
    res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
    const rows = await db.query(
      `SELECT member_name FROM members `
    );
    res.json(rows);
  } catch (err) {
    console.error(`Error while getting members `, err.message);
    next(err);
  }
});

module.exports = router;