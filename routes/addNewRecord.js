const express = require('express');
const router = express.Router();
const db = require('../services/db');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

// app.use(cors({
//   origin:"*"
// }));

// app.use(bodyParser.urlencoded({extended:true}));
console.log('test1');

router.post('/', async function(req, res, next) {
    // res.set('Access-Control-Allow-Origin', 'http://localhost:3000');

    const corsOptions = {
      origin: '*'
    }
    app.use(cors(corsOptions))
    
    app.use(function(req, res) {
        res.header("Access-Control-Allow-Origin", '*');
        res.header("Access-Control-Allow-Credentials", true);
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');

    });
  
    console.log('test2');
    // const member_name = req.body.member_name;
    // const lesson_name = req.body.lesson_name;
    // const class_date = req.body.class_date;

    console.log(req.body);

    // await db.query(
    //   `INSERT INTO classRecord (member_name, lesson_name, class_date) VALUE (?,?,?)`,
    //   [member_name, lesson_name, class_date], (err, result) => {
    //     console.log(err);
    //   }
    // );
    // res.json(rows);
});

module.exports = router;