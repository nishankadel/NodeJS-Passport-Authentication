// importing modules
const express = require("express");
const router = require("./routing/router");
const path = require("path");
const hbs = require("hbs");
require("./db/db");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
require("./config/passport")(passport);

const app = express();

// Port and Host
const port = process.env.PORT || 8080;
const host = "127.0.0.1";

// Path Files
const staticPath = path.join(__dirname, "../public");
const templatePath = path.join(__dirname, "../templates/views");
const partialPath = path.join(__dirname, "../templates/partials");

// Body Parser
app.use(express.urlencoded({ extended: false }));

// expression session middleware
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

//Passport
app.use(passport.initialize());
app.use(passport.session());

// connect flash misddleware
app.use(flash());

// global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});
// Routers
app.use("/", router);
app.use("/users", router);

// view engine
app.set("view engine", "hbs");

//use path files
app.use(express.static(staticPath));
app.set("views", templatePath);
hbs.registerPartials(partialPath);

//running server
app.listen(port, host, () => {
  console.log(`Go To --> http://${host}:${port}/`);
});
