const express = require("express");
const app = express();
const port = 8080;
const classRecordsRouter = require("./routes/classRecords");
const memberRouter = require("./routes/members");
const paymentRouter = require("./routes/payments");
const lessonRouter = require("./routes/lessons");
const addNewRecordRouter = require("./routes/addNewRecord");
const remainingDeadlineRouter = require("./routes/remainingDeadline");
const req = require("express/lib/request");
const res = require("express/lib/response");
const cors = require('cors');
const db = require('./services/db');

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.get("/", (req, res) => {
  res.json({ message: "ok" });
});
app.use("/class-records", classRecordsRouter);
app.use("/members", memberRouter);
app.use("/payments", paymentRouter);
app.use("/lessons", lessonRouter);
// app.use("/addNewRecord", addNewRecordRouter);

app.use("/remainingDeadline", remainingDeadlineRouter);

app.use(cors());

//api for addNewRecord
app.post("/addNewRecord", (req, res) => {

  const member_name = req.body.member_name;
  const lesson_name = req.body.lesson_name;
  const class_date = req.body.class_date;

  db.query(
  `INSERT INTO classRecord (member_name, lesson_name, class_date) VALUE (?,?,?)`,
    [member_name, lesson_name, class_date], (err, result) => {
        console.log(err);
        }
  )
});


//api for addPaymentRecord
app.post("/addPaymentRecord", (req, res) => {

  const member_name = req.body.member_name;
  const lesson_name = req.body.lesson_name;
  const payment_date = req.body.payment_date;
  const payment_amount = req.body.payment_amount;

  db.query(
  `INSERT INTO payment (member_name, lesson_name, payment_date, payment_amount) VALUE (?,?,?,?)`,
    [member_name, lesson_name, payment_date, payment_amount], (err, result) => {
        console.log(err);
        }
  )
});

//api for revenue
 
app.get('/revenue', async function(req, res, next) {
    try {
     
      res.set('Access-Control-Allow-Origin', 'http://localhost:3000');

      const fromDate = req.query.fromDate;
      const toDate = req.query.toDate;
      
      console.log(fromDate);
      console.log(toDate);

      const revenue = await db.query(
        `SELECT sum(lesson_unit_price) AS revenue
        FROM lessons JOIN classRecord ON lessons.lesson_name = classRecord.lesson_name 
        WHERE class_date >= '${fromDate}' AND class_date <= '${toDate}';`,
        // (err, result) => {
        //   console.log(err);
        // } 
      );//sql query for selecting revenue between fromDate , toDate
      await res.send(revenue);
    } catch (err) {
      console.error(`Error while getting revenus `, err.message);
      // next(err);
    }
});

//api for personShowedUp
app.get('/personShowedUp', async function(req, res, next) {
  try {
   
    res.set('Access-Control-Allow-Origin', 'http://localhost:3000');

    const showedUpDate = req.query.showedUpDate;

    const person = await db.query(
      `SELECT member_name
      FROM classRecord 
      WHERE class_date = '${showedUpDate}';`,
      // (err, result) => {
      //   console.log(err);
      // } 
    );//sql query for selecting revenue between fromDate , toDate
    await res.send(person);
  } catch (err) {
    console.error(`Error while getting person `, err.message);
    // next(err);
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});