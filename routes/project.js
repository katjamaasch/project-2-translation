const Project = require('./../models/project');
const User = require('./../models/user');
const Textsubmission = require('./../models/textSubmission');
const Papa = require('papaparse');
const path = require('path');
const fs = require('fs');
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

const uploadCSV = multer({
  dest: './csv-uploads'
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
        .populate('creator')
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

router.post('/:id/edit/english', (req, res, next) => {
  const id = req.params.id;
  let projectId = '';
  // console.log(req.body);
  // get from the body the texttypes
  const textareas = req.body.textarea;

  Project.findById(id)
    .populate({
      path: 'translations'
    })
    .then((foundProject) => {
      projectId = foundProject._id;

      for (let i = 0; i < foundProject.textstructure.length; i++) {
        const al = textareas[i];
        if (al === '') {
          //console.log('working element ' + el);
          textareas.splice(i, 1);
          i--;
        }
      }
      return Textsubmission.findByIdAndUpdate(
        foundProject.translations[0]._id,
        { textareas },
        {
          new: true
        }
      );
    })
    .then((updatedTextAreas) => {
      console.log('I am the updated text: ', updatedTextAreas);
      //console.log('I am the _id: 'projectinquestion._id');
      //res.render(`project/showtexts`);
      res.redirect(`/project/${projectId}`);
    })
    .catch((error) => {
      next(error);
    });
});

router.post(
  '/:id/csv-file-upload',
  uploadCSV.single('filename'),
  (req, res, next) => {
    const id = req.params.id;
    //console.log(req.file, req.body);
    const csvfilepath = path.join(req.file.destination, req.file.filename);
    fs.readFile(csvfilepath, (err, file) => {
      const csvparsed = Papa.parse(file.toString(), { header: true });
      const importData = csvparsed.data;
      const texttypes = [];
      const textareas = [];
      for (let i = 0; i < importData.length; ++i) {
        texttypes.push(importData[i].texttype);
        textareas.push(importData[i].textarea);
      }
      //console.log(texttypes, textareas);

      Textsubmission.create({
        language: 'english',
        textareas: textareas,
        author: req.user._id
      })
        .then((transmissionText) => {
          return Project.findByIdAndUpdate(
            id,
            {
              translations: [transmissionText]
            },
            { new: true }
          ).populate({
            path: 'translations'
          });
        })
        .then((updatedproject) => {
          const translatedtextarea = updatedproject.translations[0].textareas;
          res.redirect(`/project/${updatedproject._id}`);
        });
    });
  }
);

router.post('/:id/exportgermancsv', (req, res, next) => {
  //console.log('exportgermancsv is triggered');
  const id = req.params.id;
  Project.findById(id)
    .populate({
      path: 'originalText'
    })
    .then((foundproject) => {
      const data = [];
      for (let i = 0; i < foundproject.textstructure.length; ++i)
        data.push({
          texttype: foundproject.textstructure[i],
          textarea: foundproject.originalText.textareas[i]
        });
      //console.log('consolidated areas ', data);
      let csvExport = Papa.unparse(data, {
        quotes: false, //or array of booleans
        quoteChar: '"',
        escapeChar: '"',
        delimiter: ';',
        header: true,
        newline: '\r\n',
        skipEmptyLines: false, //other option is 'greedy', meaning skip delimiters, quotes, and whitespace.
        columns: null //or array of strings
      });
      res.set('Content-Type', 'text/csv');
      res.send(csvExport);
    });
});

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
  return Project.findById(id)
    .populate({
      path: 'originalText',
      populate: {
        path: 'author'
      }
    })
    .then((foundproject) => {
      foundproject.populate({
        path: 'translations',
        populate: {
          path: 'textareas'
        }
      });
      //console.log(foundproject);
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
  let originalTextId;
  let projectinquestion;
  // console.log(req.body);
  // get from the body the texttypes
  const texttypes = req.body.select;
  const textareas = req.body.textarea;

  //console.log(
  //  'types length ' + texttypes.length + 'areas length ' + textareas.length
  // );
  for (let i = 0; i < texttypes.length; i++) {
    let el = texttypes[i];
    let al = textareas[i];
    if ((el === 'mt') | (al === '')) {
      //console.log('working element ' + el);
      texttypes.splice(i, 1);
      textareas.splice(i, 1);
      i--;
    }
  }

  //console.log(texttypes, textareas);

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
            path: 'originalText translations',
            populate: {
              path: 'author'
            }
          });
        })
        .then((populatedproject) => {
          //console.log("I'm the populatedproject: ", populatedproject);
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
          populatedproject.textstructure.splice(
            populatedproject.textstructure.findIndex((v) => v.textarea === 'mt')
          );
          //console.log("I'm the populatedproject: ", populatedproject);
          const rawdata = [];

          for (let i = 0; i < populatedproject.textstructure.length; ++i)
            rawdata.push({
              texttype: populatedproject.textstructure[i],
              textarea: populatedproject.originalText.textareas[i]
            });

          // console.log('I am the cleaned data: ', rawdata);

          // rawdata.splice(
          //   rawdata.findIndex(
          //     (v) => (v.texttype === 'mt') | (v.textarea === '')
          //   )
          // );

          res.redirect(`/project/${populatedproject._id}`);
        })
        .catch((error) => {
          next(error);
        });
    }
  });
});

router.get('/:id/edit/english', (req, res, next) => {
  const id = req.params.id;
  return Project.findById(id)
    .populate({
      path: 'originalText translations',
      populate: {
        path: 'author'
      }
    })
    .then((foundproject) => {
      //console.log(foundproject);
      const data = [];
      for (let i = 0; i < foundproject.textstructure.length; ++i)
        data.push({
          texttype: foundproject.textstructure[i],
          textarea: foundproject.translations[0].textareas[i]
        });
      //console.log(foundproject.originalText);
      res.render('project/editenglish', {
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
    })
    .catch(() => {
      res.render('error', {
        message:
          'Sorry, you have to upload a csv-file with the translation first.'
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
    .populate({
      path: 'originalText creator translations',
      populate: {
        path: 'author'
      }
    })
    .then((foundproject) => {
      const data = transform_project_for_editviewdata(foundproject);

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
  //console.log(req.body);
  Textsubmission.create({
    textareas: req.body.textarea,
    author: req.user._id
  }).then((transmissionText) => {
    //console.log("I'm the transmissioned text: ", transmissionText);
    return Project.findByIdAndUpdate(
      id,
      {
        textstructure: req.body.select,
        originalText: transmissionText
      },
      { new: true }
    )

      .populate({
        path: 'originalText translations',
        populate: {
          path: 'author'
        }
      })
      .then((foundproject) => {
        const data = [];
        //console.log("I'm the foundproject: ", foundproject);
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

function transform_project_for_editviewdata(populatedproject) {
  const data = [];
  let englt = [];
  let frent = [];

  for (const t of populatedproject.translations) {
    if (t.language === 'english') englt = t.textareas;
    if (t.language === 'french') frent = t.textareas;
  }

  for (let i = 0; i < populatedproject.textstructure.length; ++i) {
    let englarea = '';
    let frenarea = '';
    if (englt.length > i) englarea = englt[i];
    if (frent.length > i) frenarea = frent[i];

    data.push({
      texttype: populatedproject.textstructure[i],
      origtextarea: populatedproject.originalText.textareas[i],
      engtextarea: englarea,
      frentextarea: frenarea
    });
  }

  return data;
}

module.exports = router;
