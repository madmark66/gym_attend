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
const brypt = require("bcrypt");
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require("./model/User");
const {registerValidation, loginValidation} = require('./validation')


app.use(express.json()); //可以讓app接受json
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get("/", (req, res) => {
  res.json({ message: "ok" });
});

// Connect to mongo DB
dotenv.config();

mongoose.connect(
  process.env.DB_CONNECT,
  ()=>console.log('connected to db!!')
);


//pretend to be a users data in database
const users = []

//api for register  
app.post("/register", async (req, res) =>{
  
  //申請帳號表單驗證
const {error} = registerValidation(req.body);
if(error) return res.status(400).send(error.details[0].message);

  //確認USER是否已存在
  const emailExist = await User.findOne({email: req.body.email})
  if(emailExist) return res.status(400).send('email already exist');


 //hash password
 const salt = await brypt.genSalt()
 const hashedPassword = await brypt.hash(req.body.password, salt)

 //驗證OK存到DB
 
  const user = new User({
    name: req.body.name, 
    email: req.body.email,
    password: hashedPassword
  });
  try{
    const savedUser = await user.save();
    res.send({user: user._id});
  } catch(err){
    res.status(400).send(err);
  }
   
});


//api for login
app.post("/login", async (req, res) =>{
  //申請帳號表單驗證
  const {error} = await loginValidation(req.body);
  if(error) return res.status(400).send(error.details[0].message);

  //確認USER是否已存在
  const user = await User.findOne({email: req.body.email})
  if(!user) return res.status(400).send('email not found');

  //輸入Password 比較DB內Password是否相同
  const validPass = await brypt.compare(req.body.password, user.password);
  if(!validPass) return res.status(400).send('wrong password')

  res.send('login!!')
   
});


//api for many different pages
app.use("/class-records", classRecordsRouter);
app.use("/members", memberRouter);
app.use("/payments", paymentRouter);
app.use("/lessons", lessonRouter);

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
      
      const revenue = await db.query(
        `SELECT sum(lesson_unit_price) AS revenue
        FROM lessons JOIN classRecord ON lessons.lesson_name = classRecord.lesson_name 
        WHERE class_date >= '${fromDate}' AND class_date <= '${toDate}';`,
        
      );
      await res.send(revenue);
    } catch (err) {
      console.error(`Error while getting revenus `, err.message);
      
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
    );
    
    await res.send(person);
  } catch (err) {
    console.error(`Error while getting person `, err.message);
    // next(err);
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});