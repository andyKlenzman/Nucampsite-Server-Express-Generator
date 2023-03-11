const express = require("express");
const favoriteRouter = express.Router();
const Favorite = require("../models/favorite");
const authenticate = require("../authenticate");
const cors = require("./cors");

/**
 * Issues
 * GET
 *  - user._id is undefined. Where do I get it from?
 *  - this should be done with passport,
 *  -
 */
favoriteRouter
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .route("/")
  .get(cors.cors, (req, res, next) => {
    console.log(req.user);
    Favorite.find({ user: req.user._id })
      .populate("user")
      .then((favorites) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(favorites);
      })
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      //check if favorites document exists. If it does, add items that are unique, else, create a new doc and add them all
      //does leet codfe have a debugger
      .then((favorite) => {
        const newFavorites = req.body;
        if (favorite) {
          newFavorites.forEach((item) => {
            if (!newFavorites.include(item)) {
              favorite.push(item);
            }
          });
          favorite.save().then((favorite) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(favorite);
          });
        } else {
          Favorite.create(req.body).then((favorite) => {
            console.log("Favorite Created ", favorite);
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(favorite);
          });
        }
      })
      .catch((err) => next(err));
  })
  .put((req, res) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /favorites");
  })
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,

    (req, res, next) => {
      //not sure if this query will work or not
      Favorite.findOneAndDelete({ user: req.user._id })
        .then((response) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(response);
        })
        .catch((err) => next(err));
    }
  );

favoriteRouter
  .route("/:campsiteId")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, (req, res, next) => {
    res.statusCode = 403;
    res.end(
      `GET operation not supported on /favorites/${req.params.campsiteId}`
    );
  })
  // trying to figure out how to validate if it is part of the array
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    Favorite.findOne({ user: req.user._id })
      .populate("User")
      .then((favorites) => {
        console.log("here", favorites);
        if (favorites && favorites.includes(req.params.campsiteId)) {
          res.end(`Already favorited`);
        } else {
          response.push(req.params.campsiteId);
        }
        response.save().then((favorite) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(favorite);
        });
      });

    //check if the camspite exists, and add it if it doesn't, else return the message in instructions
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(
      `PUT operation not supported on /favorites/${req.params.campsiteId}`
    );
  })
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,

    (req, res, next) => {
      Favorite.findOne(req.params.favoriteId)
        .then((favorite) => {
          favorite.indexOf(req.params.campsiteId).then((index) => {
            favoriteRouter.splice(index, 1);
          });
        })
        .then((favorite) => {
          favorite.save();
        })
        .then((favorite) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(favorite);
        })
        .catch((err) => next(err));
    }
  );

// Edits favorite comments, allows us to get favorite information without the rest of the favorite.

module.exports = favoriteRouter;
