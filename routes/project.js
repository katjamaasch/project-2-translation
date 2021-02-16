const Project = require('./../models/project');
const User = require('./../models/user');
const Textsubmission = require('./../models/textSubmission');
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
const project = require('./../models/project');
const { locals } = require('../app');

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

router.get('/all', routeGuard, (req, res, next) => {
  const page = Number(req.query.page) || 1;
  const limit = 5;
  const skip = (page - 1) * limit;

  let isLastPage;

  Project.count()
    .then((total) => {
      isLastPage = total / limit <= page;
      return Project.find()
        .skip(skip)
        .limit(limit)
        .sort([['projectname', 1]]);
    })
    .then((projects) => {
      res.render('project/index', {
        projects,
        previousPage: page - 1,
        nextPage: isLastPage ? 0 : page + 1
      });
    })
    .catch((error) => {
      next(error);
    });
});

/*router.get('/all', (req, res, next) => {
  const page = Number(req.query.page) || 1;
  const limit = 5;
  const skip = (page - 1) * limit;

  Project.find()
    .skip(skip)
    .limit(limit)
    .sort([['projectname', 1]])
    .then((projects) => {
      res.render('project/index', {
        projects,
        previousPage: page - 1,
        nextPage: projects.length ? page + 1 : 0
        //lastPage: projects[projects.length - 1] ? page - 1 : page
      });
    })
    .catch((error) => {
      next(error);
    });
});*/

router.post('/:id/ongoing', (req, res, next) => {
  const id = req.params.id;
  // const data = req.body;
  Project.findByIdAndUpdate(id, {
    project: project,
    status: 'ongoing'
  })
    .then((project) => {
      res.redirect(`/project/${project._id}`);
    })
    .catch((error) => {
      next(error);
    });
});

router.get('/:id', (req, res, next) => {
  const id = req.params.id;
  Project.findById(id)
    .populate('creator')
    .then((project) => {
      res.render('project/single', {
        projectname: project.projectname,
        projectimage: project.projectimage,
        _id: project._id,
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

router.post('/:id', (req, res, next) => {
  const id = req.params.id;
  // const data = req.body;
  Project.findByIdAndUpdate(id, {
    project: project,
    status: 'completed'
  })
    .then((project) => {
      res.redirect(`/project/${project._id}`);
    })
    .catch((error) => {
      next(error);
    });
});

router.post('/:id/texts', (req, res, next) => {
  const id = req.params.id;
  //console.log('This is the req.body:', req.body);
  //console.log('This is the id: ', id);
  Textsubmission.create({
    textareas: req.body.textarea,
    author: req.user._id
  }).then((transmissionText) => {
    return Project.findByIdAndUpdate(id, {
      textstructure: req.body.select,
      originalText: transmissionText
    })
      .populate({
        path: 'originalText',
        populate: {
          path: 'author'
        }
      })
      .then((foundproject) => {
        const data = [];

        for (let i = 0; i < foundproject.textstructure.length; ++i)
          data.push({
            texttype: foundproject.textstructure[i],
            textarea: foundproject.originalText.textareas[i]
          });

        console.log(foundproject.originalText);
        res.render('project/show-texts', {
          projectname: foundproject.projectname,
          client: foundproject.client,
          language: foundproject.originalText.language,
          author: foundproject.originalText.author.name,
          updateDate: foundproject.updateDate,
          data: data
        });
      });
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
      res.redirect('/project/all');
    })
    .catch((error) => {
      next(error);
    });
});

module.exports = router;
