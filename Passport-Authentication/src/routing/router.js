const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const passport = require("passport");

router.get("/", (req, res) => {
  res.render("index");
});

router.get("/users/login", (req, res) => {
  res.render("login");
});

router.post("/users/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

router.get("/users/register", (req, res) => {
  res.render("register");
});

router.post("/users/register", (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  // check required field
  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Please fill in all the fields !!" });
  }

  //check password
  if (password !== password2) {
    errors.push({ msg: "Password doesn't matched !!" });
  }

  // password length chewck
  if (password.length < 6) {
    errors.push({ msg: "Password too short !!" });
  }

  if (errors.length > 0) {
    res.render("register");
  } else {
    User.findOne({ email: email })
      .then((user) => {
        if (user) {
          errors.push({ msg: "Emamil is already registered !!" });
          res.render("register");
        } else {
          const newUser = new User({
            name,
            email,
            password,
          });

          // hash password
          bcrypt.genSalt(10, (error, salt) =>
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;

              // set password to hash
              newUser.password = hash;
              newUser
                .save()
                .then(() => {
                  req.flash(
                    "success_msg",
                    "You are successfully registered. You can login now !!"
                  );
                  res.redirect("/users/login");
                })
                .catch((err) => {
                  console.log(err);
                });
            })
          );
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }
});
const { ensureAuthenticated } = require("../config/auth");
router.get("/dashboard", ensureAuthenticated, (req, res) => {
  res.render("dashboard", {
    name: req.user.name,
  });
});

router.get("/logout", (req, res) => {
  req.logOut();
  req.flash("success_msg", "You are logout successfully!");
  res.redirect("/users/login");
});

module.exports = router;
