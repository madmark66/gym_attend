const express = require('express');
const router = express.Router();
const db = require('../services/db');

router.get('/', async function(req, res, next) {
  try {
    
    res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
    const rows = await db.query(
      `SELECT member_name, lesson_name, lastPayDay, 8-COUNT(*) AS remainin, MAX(class_1) AS class_1, MAX(class_2) AS class_2
      , MAX(class_3) AS class_3, MAX(class_4) AS class_4, MAX(class_5) AS class_5, MAX(class_6) AS class_6, MAX(class_7) AS class_7, MAX(class_8) AS class_8
       FROM
            (  
              SELECT c.member_name, c.lesson_name, c.lastPayDay,
               (CASE
                WHEN ColumnSequence = 'class_1' THEN class_date ELSE '' END
               ) AS class_1, 
               (CASE
                WHEN ColumnSequence = 'class_2' THEN class_date ELSE '' END
               ) AS class_2, 
               (CASE
                WHEN ColumnSequence = 'class_3' THEN class_date ELSE '' END
               ) AS class_3,
               (CASE
                WHEN ColumnSequence = 'class_4' THEN class_date ELSE '' END
               ) AS class_4,
               (CASE
                WHEN ColumnSequence = 'class_5' THEN class_date ELSE '' END
               ) AS class_5,
               (CASE
                WHEN ColumnSequence = 'class_6' THEN class_date ELSE '' END
               ) AS class_6,
               (CASE
                WHEN ColumnSequence = 'class_7' THEN class_date ELSE '' END
               ) AS class_7,
               (CASE
                WHEN ColumnSequence = 'class_8' THEN class_date ELSE '' END
               ) AS class_8
      
              FROM (
                      SELECT e.member_name, e.lesson_name, e.class_date, e.lastPayDay, concat('class_', ROW_NUMBER() over 
                      (PARTITION BY e.member_name, e.lesson_name ORDER BY e.member_name, e.lesson_name)) AS ColumnSequence
                      FROM
                          (SELECT a.member_name, a.lesson_name, a.class_date, t.lastPayDay FROM classRecord AS a 
                          LEFT JOIN 
                          (SELECT member_name, lesson_name, MAX(payment_date) AS lastPayDay FROM payment GROUP BY member_name, lesson_name)  AS t 
                          ON (a.lesson_name = t.lesson_name) AND (a.member_name = t.member_name) 
                          WHERE a.class_date >= t.lastPayDay) AS e
                   ) as c
             ) as b
      GROUP BY member_name, lesson_name, lastPayDay   ` //產生一個包含學員剩餘堂數/上課期限/上課日期的API(SQL query)
    );
    res.json(rows);
  } catch (err) {
    console.error(`Error while getting lessons `, err.message);
    next(err);
  }
});

module.exports = router;