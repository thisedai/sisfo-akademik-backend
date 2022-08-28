const createError = require("http-errors");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const upload = multer();
const expressLayouts = require("express-ejs-layouts");

// routes
const dashboardTT = require("./routes/dashboardTT");
const dashboardMT = require("./routes/dashboardMT");
const storeDetailTT = require("./routes/storeDetailTT");
const storeDetailMT = require("./routes/storeDetailMT");
const download = require("./routes/download");
const batchDashboardTT = require("./routes/batchDashboardTT");
const filterDashboard = require("./routes/filterDashboard");
const batchJsonIRtoRaw = require("./utils/batchJsonIRtoRaw");
const viewHome = require("./routes/viewHome");

const app = express();

app.set("views", "./views/");
app.set("view engine", "ejs");
// app.use(expressLayouts);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(upload.array());

// Routes
app.use("/dashboardTT", dashboardTT);
app.use("/dashboardMT", dashboardMT);
app.use("/storeDetailTT", storeDetailTT);
app.use("/storeDetailMT", storeDetailMT);
app.use("/download", download);
app.use("/filterDashboard", filterDashboard);

// batch
app.use("/batchDashboardTT", batchDashboardTT);
app.use("/batchIRtoRaw", batchJsonIRtoRaw);

app.use("/home", viewHome);

// route paling bawah
app.use("/", (req, res) => {
  res.send({
    status: 401,
    message: "Unauthorized",
  });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send({
    status: "error",
    message: err.message,
    code: err.status || 500,
    data: null,
  });
});

module.exports = app;
