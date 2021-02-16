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

router.get('/all', (req, res, next) => {
  const page = Number(req.query.page) || 1;
  const limit = 3;
  const skip = (page - 1) * limit;
  const lastPageQueried = Number(req.query.page);

  Project.find()
    .skip(skip)
    .limit(limit)
    .sort([['projectname', 1]])
    .then((projects) => {
      let projectIndex = projects.length;
      //let projectIndex = projects.length;
      // let projectsDisplayed = projects[projectIndex];

      //if (projectsDisplayed <= projects[projects.length - 1]) {
      if (projects[projects.length - 1]) {
        res.render('project/index', {
          projects,
          previousPage: page - 1,
          nextPage: projects.length ? page + 1 : 0
        });
      } else {
        res.redirect('/project/all/?page =${lastPageQueried}');
        // res.render('project/index', {
        //projects
        //currentPage: page
        //currentPage: projects.length ? page : 0
        // });
      }
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
      res.render('project/addtextblocks', {
        foundproject: foundproject
      });
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

router.post('/:id/edit', (req, res, next) => {
  const id = req.params.id;
  Project.findById(id)
    .populate({
      path: 'originalText',
      populate: {
        path: 'author'
      }
    })
    .then((foundproject) => {
      // const data = [];
      // for (let i = 0; i < foundproject.textstructure.length; ++i)
      //   data.push({
      //     texttype: foundproject.textstructure[i],
      //     textarea: foundproject.originalText.textareas[i]
      //   });
      //console.log(foundproject.originalText);
      res.render('project/showtexts', {
        projectname: foundproject.projectname,
        projectimage: foundproject.projectimage,
        status: foundproject.status,
        client: foundproject.client,
        language: foundproject.originalText.language,
        author: foundproject.originalText.author.name,
        updateDate: foundproject.updateDate,
        _id: foundproject._id
        //data: data
      });
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
    .populate('creator')
    .then((foundproject) => {
      res.render('project/showtexts', {
        projectname: foundproject.projectname,
        projectimage: foundproject.projectimage,
        _id: foundproject._id,
        client: foundproject.client,
        status: foundproject.status,
        creator: foundproject.creator.name,
        creationDate: foundproject.creationDate
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
  Textsubmission.create({
    textareas: req.body.textarea,
    author: req.user._id
  }).then((transmissionText) => {
    console.log("I'm the transmissioned text: ", transmissionText);
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
          language: foundproject.originalText.language,
          author: foundproject.originalText.author.name,
          updateDate: foundproject.updateDate,
          _id: foundproject._id,
          data: data
        });
      });
  });
});

module.exports = router;
