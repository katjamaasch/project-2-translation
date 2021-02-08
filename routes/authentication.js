'use strict';

const { Router } = require('express');

const bcryptjs = require('bcryptjs');
const User = require('./../models/user');

// Code added by Sok Mun for future activation, if needed for file upload
// const uploadMiddleware = require('./../middleware/file-upload');

const router = new Router();

router.get('/sign-up', (req, res, next) => {
  res.render('sign-up');
});

// If we want to have profile picture  upload,
// we need to create uploadMiddleWare codes
// and add uploadMiddleware.single('picture'), after '/sign-up' in router.post('/sign-up', )
// Shall we add code to check if the user already exists?
// Should we redirect after sign-up to res.redirect('/sign-in')?
router.post('/sign-up', (req, res, next) => {

  const { name, email, password } = req.body;

  bcryptjs
    .hash(password, 10)
    .then((hash) => {
      return User.create({
        name,
        email,
        passwordHashAndSalt: hash
      });
    })
    .then((user) => {
      req.session.userId = user._id;
      res.redirect('/private');
    })
    .catch((error) => {
      next(error);
    });
});

router.get('/sign-in', (req, res, next) => {
  res.render('sign-in');
});

// Need to decide if publisher, where to direct user to and which view to render
// Need to decide if interpreter, where to direct user to and which view to render
router.post('/sign-in', (req, res, next) => {
  let user;
  const { email, password } = req.body;
  User.findOne({ email })
    .then((document) => {
      if (!document) {
        return Promise.reject(new Error("There's no user with that email."));
      } else {
        user = document;
        return bcryptjs.compare(password, user.passwordHashAndSalt);
      }
    })
    .then((result) => {
      if (result) {
        req.session.userId = user._id;
        res.redirect('/private');
      } else {
        return Promise.reject(new Error('Wrong password.'));
      }
    })
    .catch((error) => {
      next(error);
    });
});

router.post('/sign-out', (req, res, next) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
