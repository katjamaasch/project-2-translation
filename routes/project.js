const Project = require('./../models/project');
const User = require('./../models/user');
//const Textblock = require('./../models/textblock');

('use strict');

const multer = require('multer');
const cloudinary = require('cloudinary');
const multerStorageCloudinary = require('multer-storage-cloudinary');

const storage = new multerStorageCloudinary.CloudinaryStorage({
  cloudinary: cloudinary.v2
});

const uploadMiddleware = multer({
  storage: storage
});

const express = require('express');
const router = new express.Router();
const routeGuard = require('./../middleware/route-guard');

router.get('/create', routeGuard, (req, res, next) => {
  res.render('project/create');
});

router.post(
  '/confirmation',
  uploadMiddleware.single('projectimage'),
  (req, res, next) => {
    //console.log(req.body);
    //console.log('req.file: ', req.file);
    const data = req.body;
    const imagepath = req.file.path;
    const newProject = new Project({
      client: data.client,
      projectname: data.projectname,
      projectimage: imagepath,
      creator: req.user._id
    });
    newProject
      .save()
      .then((project) => {
        res.render('project/confirmation', { project });
      })
      .catch((error) => {
        next(error);
      });
  }
);

module.exports = router;
