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
const {registerValidation, loginValidation} = require('./validation');
const jwt = require('jsonwebtoken');
const verifyJWT = require('./verifyToken');
//const bodyParser = require("body-parser");
//const cookieParser = require("cookie-parser");
const session = require("express-session");
const cookie = require("cookie");
const authController = require('./controllers/authController');

app.use(express.json()); //可以讓app接受json
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);
//app.use(cookieParser());
//app.use(bodyParser.urlencoded({ extended: true }));


app.use(
  session({
    // key: "keys that renewed",
    secret: "i try new 2",
    // name: 'user', // optional
    resave: false,
    saveUninitialized: false,
    //store: MemoryStore,
    cookie: {
      secure: true,
      httpOnly: true,
      sameSite: 'none',
      maxAge : 1000 * 60 * 10,
      //expires: 1000 * 60 * 10 ,
    },
  })
);



// Connect to mongo DB
dotenv.config();
mongoose.connect(
process.env.DB_CONNECT,
()=>console.log('connected to db from outside!!')
);


//create token for authenticated user 
const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
  });
}

const createUserToken = async(user, code, req, res) => {
  const token = signToken(user._id);

  //console.log('token-created', token);

  //check if session is set and its content
  req.session.isAuth = true;
  console.log('session content',req.session);

  //set expiry to 1 month 
  let d = new Date();
  d.setDate(d.getDate() + 30);

  //cookie settings 
  res.cookie('jwt', token, {
      expires: d, 
      httpOnly: true,
      //secure: req.secure || req.headers['x-forwarded-proto'] === 'https', 
      secure: true,
      sameSite: 'none'
  });

  //remove user password from output
  user.password = undefined; 
  res.status(code).json({
      status: 'success',
      token,
      data: {
          user
      }
  });
};



//api for register  
app.post("/register", async (req, res, next) =>{

res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
//res.header("Access-Control-Allow-Credentials", "true");
  
  //申請帳號表單驗證(joi)
const {error} = registerValidation(req.body);
if(error) return res.status(400).send(error.details[0].message);

  //確認USER是否已存在(mongoDB)
  const emailExist = await User.findOne({email: req.body.email});
  if(emailExist) return res.status(400).send('email already exist');


 //hash password(bcrypt)
 const salt = await brypt.genSalt();
 const hashedPassword = await brypt.hash(req.body.password, salt)

 //驗證OK存到DB(mongoDB)
 
  // const user = new User({
  //   name: req.body.name, 
  //   email: req.body.email,
  //   password: hashedPassword
  // });
  // try{
  //   const savedUser = await user.save();
  //   res.send({user: user._id});
  // } catch(err){
  //   res.status(400).send(err);
  // }


//傳送 request data 並產生 user from user schema 
  try {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
    });


     

//產生JWT token
  createUserToken(newUser, 201, req, res);
//if user can't be created, throw an error 
} catch(err) {
    next(err);
}

 

   
});


//api for login
app.post("/login", async (req, res) =>{
  res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.set('Access-Control-Allow-Credentials: true');
  
  res.set('Access-Control-Allow-Methods : POST, GET, OPTIONS')
  res.set('Access-Control-Allow-Headers: Content-Type')
  
  //res.set('Access-Control-Allow-Headers: Content-Type, x-requested-with');
  //申請帳號表單驗證 (joi)
  const {error} = loginValidation(req.body);
  if(error) return res.status(400).send(error.details[0].message);

  //確認USER是否已存在(mongoDB
  const user = await User.findOne({email: req.body.email});
  if(!user) return res.status(400).send('email not found');

  //輸入Password 比較DB內Password是否相同(bcrypt)
  const validPass = await brypt.compare(req.body.password, user.password);
  if(!validPass) return res.status(400).send('wrong password');

  //create and assign JWT toekn
  //const token = await jwt.sign({_id: user._id}, process.env.TOKEN_SECRECT);
  //await res.header('auth-token', token).send(token);

//傳送 request data 並產生 user from user schema 

    const oldUser = {
        _id: user._id,
        name: user.name,
        email: req.body.email,
        password: user.password,
        
    };

    console.log(oldUser);

//產生JWT token
  createUserToken(oldUser, 201, req, res);
//if user can't be created, throw an error 
// } catch(err) {
//     next(err);
// }


  req.session.email = req.body.email;
  //save to session store
  
  // req.session.user = user.email;

  //save sessionId to browser cookie
  //console.log(req.sessionID);
  //res.cookie('firstName', req.sessionID, { path: '/', signed: true, maxAge:600000}); 
  //console.log(req.session.key);
  //req.session.isAuth = true;
  // await res.setHeader('Set-Cookie','eatddd=pizza');
 //res.cookie('foo','bar'); 
  //console.log(req.session);
  //console.log(req.session.email);
  //res.send(req.session.isAuth); 
});

// isAuth middleware for checking login status
const isAuth = (req, res, next) => {
  
  if(req.session.isAuth) {
    console.log('auth ok');
    next();
  } else {
    res.send('no auth 1');
  }
};

//root page
// app.get("/", isAuth ,(req, res) => {
//   res.send('root!');
// });

//see if there is such user existed
app.get('/user', authController.checkUser);


//api for many different pages
app.use("/class-records",classRecordsRouter);
app.use("/members", isAuth,memberRouter);
app.use("/payments", isAuth,paymentRouter);
app.use("/lessons", isAuth,lessonRouter);

app.use("/remainingDeadline", isAuth,remainingDeadlineRouter);

app.use(cors());

//api for addNewRecord
app.post("/addNewRecord", isAuth,(req, res) => {
  res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.set('Access-Control-Allow-Credentials: true');
  
  res.set('Access-Control-Allow-Methods : POST, GET, OPTIONS')
  res.set('Access-Control-Allow-Headers: Content-Type')

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
app.post("/addPaymentRecord", isAuth,(req, res) => {

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
app.get('/revenue',isAuth, async function(req, res, next) {
    try {
     
      res.set('Access-Control-Allow-Origin', 'http://localhost:3000');

      const fromDate = req.query.fromDate;
      const toDate = req.query.toDate;
      
      const revenue = await db.query(
        `SELECT sum(lesson_unit_price) AS revenue
        FROM lessons JOIN classRecord ON lessons.lesson_name = classRecord.lesson_name 
        WHERE class_date >= '${fromDate}' AND class_date <= '${toDate}';`,
        
      );
      res.send(revenue);
    } catch (err) {
      console.error(`Error while getting revenus `, err.message);
      
    }
});

//api for personShowedUp
app.get('/personShowedUp', isAuth,async function(req, res, next) {
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