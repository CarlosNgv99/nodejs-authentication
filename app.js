var createError = require("http-errors");
var express = require("express");
var path = require("path");
var logger = require("morgan");
var session = require("express-session");
var FileStore = require("session-file-store")(session);
var mongoose = require('mongoose');

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var dishesRouter = require('./routes/dishes');
var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

mongoose.connect('mongodb://localhost:27017/conFusion-db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then((db) => {
  console.log('DB connected...');
}, (err) => console.log(err));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser());
app.use(
  session({
    name: "session-id",
    secret: "12345-67890-09876-54321",
    saveUninitialized: false,
    store: new FileStore(),
  })
);



app.use("/", indexRouter);
app.use("/users", usersRouter);

function auth(req, res, next) { // auth is used when you try to access to api data
  console.log(req.session);
  if (!req.session.user) {
    var err = new Error("You are not authenticated");
    res.setHeader("WWW-Authenticate", "Basic");
    return next(err);
  } else {
    if (req.session.user === 'authenticated') {
      next();
    } else {
      var err = new Error("You are not authenticated!");
      err.status = 401;
      next(err);
    }
  }
}

app.use(express.static(path.join(__dirname, "public")));

app.use(auth);
app.use("/dishes", dishesRouter);


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
  res.render("error");
});

module.exports = app;
