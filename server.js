const express = require('express');//This is change made in second pull request
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const passport = require("passport");
const passportSetup = require('./passport-setup')
const notesRouter = require('./routes/notes');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const cookieSession = require("cookie-session");
const cookieParser = require("cookie-parser");
// const session = require("express-session");

require('dotenv').config();
const port = process.env.PORT || 5000;

let uri = '';
process.env.NODE_ENV!=='test' ? uri = process.env.ATLAS_URI : uri = process.env.ATLAS_TEST_URI;

mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }
).catch(error => console.log(error));

const connection = mongoose.connection;      

connection.on('error', console.error.bind(console,'connection error'));

connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
})

app.use(
  cookieSession({
    name: "session",
    keys: [process.env.COOKIE_KEY],
    maxAge: 24 * 60 * 60 * 100
  })
);

// parse cookies
app.use(cookieParser());

// initalize passport
app.use(passport.initialize());

// deserialize cookie from the browser
app.use(passport.session());

app.use(express.json());

app.use(cors());

app.use('/notes', notesRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);

const authCheck = (req, res, next) => {
  if (!req.user) {
    res.status(401).json({
      authenticated: false,
      message: "user has not been authenticated"
    });
  } else {
    next();
  }
};

// if it's already login, send the profile response,
// otherwise, send a 401 response that the user is not authenticated
// authCheck before navigating to home page
app.get("/", authCheck, (req, res) => {
  res.status(200).json({
    authenticated: true,
    message: "user successfully authenticated",
    user: req.user,
    cookies: req.cookies
  });
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
    console.log(`NODE_ENV = ${process.env.NODE_ENV}`);
});

module.exports = app;
