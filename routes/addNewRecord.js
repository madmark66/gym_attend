const express = require('express');
const router = express.Router();
const db = require('../services/db');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

router.get('/', async function(req, res, next) {
  try {
    res.set('Access-Control-Allow-Origin', 'http://localhost:3000');

    const member_name = req.body.member_name;
    const lesson_name = req.body.lesson_name;
    const class_date = req.body.class_date;

    app.use(cors());
    app.use(bodyParser.urlencoded({extended:true}));

    const rows = await db.query(
      `INSERT INTO classRecord (member_name, lesson_name, class_date) VALUE (?,?,?)`,
      [member_name, lesson_name, class_date], (err, result) => {
        console.log(result);
      }
    );
    res.json(rows);
  } catch (err) {
    console.error(`Error while getting members `, err.message);
    next(err);
  }
});

module.exports = router;