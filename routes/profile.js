'use strict';

const express = require('express');
const router = new express.Router();
//const bcryptjs = require('bcryptjs');
const routeGuard = require('./../middleware/route-guard');

const Project = require('./../models/project');
const User = require('./../models/user');

router.get('/:id', routeGuard, (req, res, next) => {
  const id = req.params.id;
  let profileUser;
  User.findById(id)
    .then((foundUser) => {
      profileUser = foundUser;
      if (!profileUser) {
        throw new Error('User not found!');
      } else {
        return Project.find({ status: 'in progress' }).populate('creator');
      }
    })
    .then((projects) => {
      console.log(projects);
      res.render('profile', {
        projects,
        profileUser
      });
    })
    .catch((error) => {
      next(error);
    });
});

module.exports = router;
