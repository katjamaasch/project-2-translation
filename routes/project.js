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
  '/create',
  uploadMiddleware.single('projectimage'),
  (req, res, next) => {
    //console.log(req.body);
    //console.log('req.file: ', req.file);
    const data = req.body;
    let projectimage;
    if (req.file) {
      projectimage = req.file.path;
    }

    Project.create({
      client: data.client,
      projectname: data.projectname,
      projectimage: projectimage,
      creator: req.user._id
    })
      .then((project) => {
        //res.redirect(`/project/${project._id}`);
        res.render('project/confirmation', { project });
      })
      .catch((error) => {
        next(error);
      });
  }
);

router.get('/all', (req, res, next) => {
  Project.find()
    .sort([['projectname', 1]])
    .then((projects) => {
      res.render('project/index', { projects });
    });
});

router.get('/:id', (req, res, next) => {
  const id = req.params.id;
  Project.findById(id)
    .populate('creator')
    .then((project) => {
      console.log(project);
      res.render('project/single', {
        projectname: project.projectname,
        projectimage: project.projectimage,
        client: project.client,
        status: project.status,
        creator: project.creator.name,
        creationDate: project.creationDate
      });
    })
    .catch((error) => {
      next(error);
    });
});

router.get('/:id/delete', (req, res, next) => {
  const id = req.params.id;
  Project.findById(id)
    .then((project) => {
      res.render('project/delete', { project: project });
    })
    .catch((error) => {
      next(error);
    });
});

router.post('/:id/delete', (req, res, next) => {
  let id = req.params.id;
  Project.findByIdAndDelete(id)
    .then(() => {
      console.log(id);
      res.redirect('/project/all');
    })
    .catch((error) => {
      next(error);
    });
});

module.exports = router;
