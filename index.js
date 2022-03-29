const express = require("express");
const app = express();
const port = 8080;
const classRecordsRouter = require("./routes/classRecords");
const memberRouter = require("./routes/members");
const lessonRouter = require("./routes/lessons");
const addNewRecordRouter = require("./routes/addNewRecord");

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
app.use("/lessons", lessonRouter);
app.post("/addNewRecord", addNewRecordRouter);
/* Error handler middleware */
// app.use((err, req, res, next) => {
//   const statusCode = err.statusCode || 500;
//   console.error(err.message, err.stack);
//   res.status(statusCode).json({ message1: err.message });
//   return;
// });
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});