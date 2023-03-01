const express = require("express");
const User = require("../models/user");
const passport = require('passport');

const router = express.Router();

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.post("/signup", (req, res, next) => {

  // Are there any matches in our database? If so, throw an error
  console.log(req.body)
  // debugger;
  User.findOne({ username: req.body.username })
    .then((user) => {
      if (user) {
        const err = new Error(`User ${req.body.username} already exists!`);
        err.status = 403;
        //return next() : By using return next it will jump out the callback immediately and the code below return next() will be unreachable.
        return next(err);
      } else {
        //add user with create which returns promise
        User.create({
          username: req.body.username,
          password: req.body.password,
        })
          .then((user) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json({ status: "Registration Successful!", user: user });
          })
          .catch((err) => next(err));
      }
    })
    .catch((err) => next(err));
});


// Do you always have to make specifications for all of the different types of API requests or can you do a default for API pets call to a specific route that all default to 405 or whatever the call is for when you don't have permission to do that
router.post("/login", (req, res, next) => {
  if (!req.session.user) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      const err = new Error("You are not authenticated!");
      res.setHeader("WWW-Authenticate", "Basic");
      err.status = 401;
      return next(err);
    }

    const auth = Buffer.from(authHeader.split(" ")[1], "base64")
      .toString()
      .split(":");
    const username = auth[0];
    const password = auth[1];

    User.findOne({ username: username })
      .then((user) => {
        if (!user) {
          const err = new Error(`User ${username} does not exist!`);
          err.status = 401;
          return next(err);
        } else if (user.password !== password) {
          const err = new Error("Your password is incorrect!");
          err.status = 401;
          return next(err);
        } else if (user.username === username && user.password === password) {
          req.session.user = "authenticated";
          res.statusCode = 200;
          res.setHeader("Content-Type", "text/plain");
          res.end("You are authenticated!");
        }
      })
      .catch((err) => next(err));
  } else {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end("You are already authenticated!");
  }
});

router.get("/logout", (req, res, next) => {
  // destroy the session so session file on server side cannot authenticate
  if (req.session) {
    req.session.destroy();
    res.clearCookie("session-id");
    res.redirect("/");
  } else {
    const err = new Error("You are not logged in!");
    err.status = 401;
    return next(err);
  }
});

module.exports = router;
