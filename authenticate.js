const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user");
const Campsite = require("./models/campsite");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const jwt = require("jsonwebtoken"); // used to create, sign, and verify tokens
const createError = require("http-errors");

const config = require("./config.js");

exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = function (user) {
  return jwt.sign(user, config.secretKey, { expiresIn: 3600 });
};

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(
  new JwtStrategy(opts, (jwt_payload, done) => {
    console.log("JWT payload:", jwt_payload);
    User.findOne({ _id: jwt_payload._id }, (err, user) => {
      if (err) {
        return done(err, false);
      } else if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    });
  })
);

exports.verifyUser = passport.authenticate("jwt", { session: false });

exports.verifyAdmin = function (req, res, next) {
  console.log("verifyAdmin", req.user);
  if (req.user.admin) {
    console.log("Admin verified! ");
    return next();
  } else {
    next(createError(403, "You are not authorized to perform this operation!"));
  }
};


    // Comparing the value of the comments author and the current user. If true, allow the current user to edit or delete the comment, else error
exports.verifyOwner = function (req, res, next) {
  console.log("Verify Owner");
  Campsite.findById(req.params.campsiteId).then((campsite) => {
    if (
      campsite.comments.id(req.params.commentId).author.toString() ==
      req.user._id.toString()
    ) {
      console.log("Verified Comment Owner")
      return next();
    } else {
      next(
        createError(403, "You are not authorized to perform this operation!")
      );
    }
  });
};
