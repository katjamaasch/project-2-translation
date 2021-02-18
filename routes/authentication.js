'use strict';

const { Router } = require('express');

const bcryptjs = require('bcryptjs');
const User = require('./../models/user');

// Code added by Sok Mun for future activation, if needed for file upload
// const uploadMiddleware = require('./../middleware/file-upload');

const router = new Router();

router.get('/sign-up', (req, res, next) => {
  res.render('authentication/sign-up');
});

router.post('/sign-up', (req, res, next) => {
  const { name, email, password, role, department } = req.body;
  let data = req.body.email;
  // ??Here are new codes ??
  User.findOne({
    email: data
  })
    .then((user) => {
      if (user) {
        throw new Error('There is already a user with that email');
        //return;
      } else {
        return bcryptjs.hash(password, 10);
      }
    })

    //console.log(req.body);
    // bcryptjs
    //  .hash(password, 10)
    .then((hash) => {
      return User.create({
        name,
        email,
        role,
        department,
        passwordHashAndSalt: hash
      });
    })
    .then((user) => {
      //req.session.userId = user._id;
      res.redirect('sign-in');
    })
    .catch((error) => {
      next(error);
    });
});

router.get('/sign-in', (req, res, next) => {
  res.render('authentication/sign-in');
});

// Need to decide if publisher, where to direct user to and which view to render
// Need to decide if interpreter, where to direct user to and which view to render
router.post('/sign-in', (req, res, next) => {
  let user;
  let userRole;
  const { email, password, role } = req.body;

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
        res.redirect(`/profile/${user._id}`);
        /*userRole = [user.role];
        console.log(userRole);
        if (userRole === ['publisher']) {
          res.redirect(`/profile/${user._id}/publisher`);
        } else {
          res.redirect(`/profile/${user._id}/viewer`);
        }*/
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
