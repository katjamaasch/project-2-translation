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
        console.log('project._id: ', project._id);
        //res.redirect(`/project/${project._id}`);
        res.render('project/confirmation', { project });
      })
      .catch((error) => {
        next(error);
      });
  }
);

router.get('/:id/add', (req, res, next) => {
  const id = req.params.id;
  Project.findById(id)
    .populate({
      path: 'originalText',
      populate: {
        path: 'author'
      }
    })
    .then((foundproject) => {
      res.render(`project/edit`, { _id: foundproject._id });
      // res.render('project/addtextblocks', {
      //   foundproject: foundproject
      // });
    });
});

router.post('/:id/completed', (req, res, next) => {
  const id = req.params.id;
  // const data = req.body;
  Project.findByIdAndUpdate(id, {
    status: 'completed'
  })
    .then((project) => {
      res.redirect(`/project/${project._id}`);
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
      res.redirect('/project/all');
    })
    .catch((error) => {
      next(error);
    });
});

router.get('/:id/edit', (req, res, next) => {
  const id = req.params.id;
  Project.findById(id)
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
      //console.log(foundproject.originalText);
      res.render('project/edit', {
        projectname: foundproject.projectname,
        projectimage: foundproject.projectimage,
        status: foundproject.status,
        client: foundproject.client,
        language: foundproject.originalText.language,
        author: foundproject.originalText.author.name,
        updateDate: foundproject.updateDate,
        _id: foundproject._id,
        data: data
      });
    });
});

/*
router.post('/:id/edit', (req, res, next) => {
  const id = req.params.id;
  let originalTextId;

  console.log(req.body);
  // get from the body the texttypes
  const texttypes = req.body.select;
  const textareas = req.body.textarea;
  Project.findById(id)
    .then((foundProject) => {
      originalTextId = foundProject.originalText;
      console.log(originalTextId);
      return Project.findByIdAndUpdate(id, texttypes);
    })
    .then(() => {
      console.log('textareas', textareas);
      return Textsubmission.findByIdAndUpdate(
        originalTextId,
        { textareas },
        {
          new: true
        }
      );
    })
    .then((updatedtext) => {
      console.log(updatedtext);
      res.redirect(`/project/${id}`);
    })
    .catch((error) => {
      next(error);
    });
});
*/

router.post('/:id/edit', (req, res, next) => {
  const id = req.params.id;
  let originalTextId;
  let projectinquestion;
  // console.log(req.body);
  // get from the body the texttypes
  const texttypes = req.body.select;
  const textareas = req.body.textarea;
  Project.findById(id).then((foundProject) => {
    //console.log('A project with or without an original text: ', foundProject);
    if (!foundProject.originalText) {
      console.log('There is NO originaltext in the project!');
      Textsubmission.create({
        textareas: req.body.textarea,
        author: req.user._id
      })
        .then((transmissionText) => {
          //console.log("I'm the transmissioned text: ", transmissionText);
          return Project.findByIdAndUpdate(
            id,
            {
              textstructure: req.body.select,
              originalText: transmissionText
            },
            { new: true }
          ).populate({
            path: 'originalText',
            populate: {
              path: 'author'
            }
          });
        })
        .then((populatedproject) => {
          //console.log("I'm the populatedproject: ", populatedproject);
          const data = [];

          for (let i = 0; i < populatedproject.textstructure.length; ++i)
            data.push({
              texttype: populatedproject.textstructure[i],
              textarea: populatedproject.originalText.textareas[i]
            });
          // console.log(data);
          // console.log('new textareas: ', textareas);
          // console.log('I am the Textsubmission Update: ', whateveritis);
          // console.log('I am the projectinquestion: ', populatedproject);

          res.redirect(`/project/${populatedproject._id}`);
        })
        .catch((error) => {
          next(error);
        });
    } else {
      originalTextId = foundProject.originalText;
      //console.log('There is an originaltext in the project!');
      return Project.findByIdAndUpdate(
        id,
        { textstructure: texttypes },
        {
          new: true
        }
      )
        .then((foundProject) => {
          projectinquestion = foundProject;
          //console.log('I am the project which gets updated: ', foundProject);
          return Textsubmission.findByIdAndUpdate(
            originalTextId,
            { textareas },
            {
              new: true
            }
          );
        })
        .then((updatedTextAreas) => {
          //console.log('I am the updated text: ', updatedTextAreas);
          //console.log('I am the _id: 'projectinquestion._id');
          return Project.findById(projectinquestion._id).populate({
            path: 'originalText creator',
            populate: {
              path: 'author'
            }
          });
        })
        .then((populatedproject) => {
          //console.log("I'm the populatedproject: ", populatedproject);
          const data = [];

          for (let i = 0; i < populatedproject.textstructure.length; ++i)
            data.push({
              texttype: populatedproject.textstructure[i],
              textarea: populatedproject.originalText.textareas[i]
            });

          // console.log(data);
          // console.log('new textareas: ', textareas);
          // console.log('I am the Textsubmission Update: ', whateveritis);
          // console.log('I am the projectinquestion: ', populatedproject);

          res.redirect(`/project/${populatedproject._id}`);
        })
        .catch((error) => {
          next(error);
        });
    }
  });
});

router.post('/:id/ongoing', (req, res, next) => {
  const id = req.params.id;
  // const data = req.body;
  Project.findByIdAndUpdate(id, {
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
    .populate({
      path: 'originalText creator',
      populate: {
        path: 'author'
      }
    })
    .then((foundproject) => {
      console.log(foundproject);
      const data = [];
      for (let i = 0; i < foundproject.textstructure.length; ++i)
        data.push({
          texttype: foundproject.textstructure[i],
          textarea: foundproject.originalText.textareas[i]
        });
      res.render('project/showtexts', {
        projectname: foundproject.projectname,
        projectimage: foundproject.projectimage,
        _id: foundproject._id,
        client: foundproject.client,
        status: foundproject.status,
        creator: foundproject.creator.name,
        creationDate: foundproject.creationDate,
        language: foundproject.originalText.language,
        author: foundproject.originalText.author.name,
        updateDate: foundproject.updateDate,
        data
      });
    })
    .catch((error) => {
      next(error);
    });
});

router.post('/:id', (req, res, next) => {
  const id = req.params.id;
  //console.log('This is the req.body:', req.body);
  //console.log('This is the id: ', id);
  console.log(req.body);
  Textsubmission.create({
    textareas: req.body.textarea,
    author: req.user._id
  }).then((transmissionText) => {
    console.log("I'm the transmissioned text: ", transmissionText);
    return Project.findByIdAndUpdate(
      id,
      {
        textstructure: req.body.select,
        originalText: transmissionText
      },
      { new: true }
    )

      .populate({
        path: 'originalText',
        populate: {
          path: 'author'
        }
      })
      .then((foundproject) => {
        console.log("I'm the foundproject: ", foundproject);
        const data = [];

        for (let i = 0; i < foundproject.textstructure.length; ++i)
          data.push({
            texttype: foundproject.textstructure[i],
            textarea: foundproject.originalText.textareas[i]
          });
        //console.log(foundproject.originalText);
        res.render('project/showtexts', {
          projectname: foundproject.projectname,
          projectimage: foundproject.projectimage,
          status: foundproject.status,
          client: foundproject.client,
          //          language: foundproject.originalText.language,
          author: foundproject.originalText.author.name,
          updateDate: foundproject.updateDate,
          _id: foundproject._id,
          data: data
        });
      });
  });
});

module.exports = router;
