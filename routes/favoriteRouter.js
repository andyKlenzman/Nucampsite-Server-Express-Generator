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
  .route("/")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({ user: req.user._id })
      .populate("user")
      .populate("campsites")
      .then((favorites) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(favorites);
      })
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then((favorite) => {
        console.log("hey", favorite.campsites);

        if (favorite) {
          const newFav = req.body;
          newFav.forEach((item) => {
            if (!favorite.campsites.includes(item._id)) {
              favorite.campsites.push(item._id);
            } else {
              res.statusCode = 200;
              res.setHeader("Content-Type", "text/plain");
              res.end("That campsite is already in the list of favorites!");
            }
          });
          favorite.save().then((favorite) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(favorite);
          });
        } else {
          Favorite.create({ user: req.user._id, campsites: req.body }).then(
            (favorite) => {
              console.log("Favorite Created ", favorite);
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(favorite);
            }
          );
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
          if (response) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(response);
          } else {
            res.setHeader("Content-Type", "text/plain");
            res.end("No favorites for deletion");
          }
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
        if (favorites) {
          console.log("here", req.user);
          if (favorites.includes(req.params.campsiteId)) {
            res.end(`Already favorited`);
          } else {
            response.campsites.push(req.params.campsiteId);
            response.save().then((favorite) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(favorite);
            });
          }
        } else {
          Favorite.create({
            user: req.user._id,
            campsites: req.params.campsiteId,
          })
            .then((favorite) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(favorite);
            })
            .catch((err) => next(err));
        }
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
      Favorite.findOne({ user: req.user._id })
        .then((favorite) => {
          console.log(favorite);
          const index = favorite.campsites.indexOf(req.params.campsiteId);
          favorite.campsites.splice(index, 1);
          favorite.save().then((favorite) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(favorite);
          });
        })

        .catch((err) => next(err));
    }
  );

// Edits favorite comments, allows us to get favorite information without the rest of the favorite.

module.exports = favoriteRouter;
